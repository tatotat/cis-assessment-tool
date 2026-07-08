-- Migration 004 — Enrollment (invite links + roster) and Training catalog
-- Run this in the Supabase SQL Editor on a project that already has 003 applied.
-- (Fresh installs: supabase/schema.sql already includes all of this.)
--
-- Adds:
--   • organizations.roster_enforced — when true, only enrolled emails may
--     start an assessment for that org.
--   • enrollments — one row per invited person, with a bearer invite_token,
--     status (invited → started → completed), and optional audit_label.
--   • training_catalog — admin-editable per-CIS-Control training content;
--     rows are OVERRIDES over the built-in defaults shipped in the app.
--   • RPCs for the anonymous flow: get_enrollment_by_token, get_training_catalog,
--     roster enforcement folded into create_assessment, and an enrollment
--     completion hook inside update_assessment_by_session.

-- ─── 1. Roster flag ───────────────────────────────────────────────────────────

alter table public.organizations
  add column if not exists roster_enforced boolean not null default false;

-- ─── 2. Enrollments ───────────────────────────────────────────────────────────

create table if not exists public.enrollments (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  full_name text,
  audit_label text,
  invite_token text unique not null default replace(uuid_generate_v4()::text, '-', ''),
  status text not null default 'invited' check (status in ('invited', 'started', 'completed')),
  assessment_id uuid references public.assessments(id) on delete set null,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- One enrollment per (org, email, audit campaign)
create unique index if not exists enrollments_org_email_label
  on public.enrollments (organization_id, email, coalesce(audit_label, ''));

alter table public.enrollments enable row level security;

drop policy if exists "Admins manage enrollments" on public.enrollments;
create policy "Admins manage enrollments" on public.enrollments
  for all
  using (public.is_admin())
  with check (public.is_admin());
-- No public policies — anonymous access is only via the RPCs below.

drop trigger if exists handle_enrollments_updated_at on public.enrollments;
create trigger handle_enrollments_updated_at
  before update on public.enrollments
  for each row execute procedure public.handle_updated_at();

-- ─── 3. Training catalog ──────────────────────────────────────────────────────

create table if not exists public.training_catalog (
  control_number int primary key check (control_number between 1 and 18),
  title text not null,
  summary text,
  topics jsonb not null default '[]',  -- [{ topic, objective, resources:[{label,url}] }]
  updated_at timestamptz default now()
);

alter table public.training_catalog enable row level security;

drop policy if exists "Admins manage training_catalog" on public.training_catalog;
create policy "Admins manage training_catalog" on public.training_catalog
  for all
  using (public.is_admin())
  with check (public.is_admin());
-- Public READ is served by the get_training_catalog() RPC (below).

drop trigger if exists handle_training_catalog_updated_at on public.training_catalog;
create trigger handle_training_catalog_updated_at
  before update on public.training_catalog
  for each row execute procedure public.handle_updated_at();

-- ─── 4. Enrollment lookup by token (bearer credential) ────────────────────────

create or replace function public.get_enrollment_by_token(p_token text)
returns json
language sql
security definer
stable
set search_path = public
as $$
  select json_build_object(
    'email', e.email,
    'full_name', e.full_name,
    'status', e.status,
    'audit_label', e.audit_label,
    'organization', json_build_object('id', o.id, 'name', o.name, 'code', o.code),
    'resume_session_id', a.session_id
  )
  from public.enrollments e
  join public.organizations o on o.id = e.organization_id
  left join public.assessments a on a.id = e.assessment_id
  where e.invite_token = p_token;
$$;

-- ─── 5. create_assessment — add invite token + roster enforcement ─────────────
-- The argument list changes, so the old signature must be dropped first.

drop function if exists public.create_assessment(text, uuid, text);

create or replace function public.create_assessment(
  p_session_id text,
  p_organization_id uuid,
  p_assessor_email text,
  p_invite_token text default null
)
returns setof public.assessments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_roster boolean;
  v_email text := lower(trim(p_assessor_email));
  v_enr public.enrollments%rowtype;
  v_new_id uuid;
begin
  if p_session_id is null or length(p_session_id) < 32 then
    raise exception 'Invalid session id';
  end if;

  select roster_enforced into v_roster
  from public.organizations
  where id = p_organization_id;

  if v_roster is null then
    raise exception 'Organization not found';
  end if;

  if p_invite_token is not null then
    select * into v_enr
    from public.enrollments
    where invite_token = p_invite_token and organization_id = p_organization_id;
    if not found then
      raise exception 'Invalid or revoked invitation';
    end if;
    v_email := v_enr.email;
  else
    select * into v_enr
    from public.enrollments
    where organization_id = p_organization_id and email = v_email
    order by created_at desc
    limit 1;
    if v_roster and not found then
      raise exception 'This organization requires an invitation link';
    end if;
  end if;

  insert into public.assessments (session_id, organization_id, assessor_email, status)
  values (p_session_id, p_organization_id, v_email, 'screening')
  returning id into v_new_id;

  if v_enr.id is not null then
    update public.enrollments set
      status = case when status = 'completed' then status else 'started' end,
      started_at = coalesce(started_at, now()),
      assessment_id = v_new_id
    where id = v_enr.id;
  end if;

  return query select * from public.assessments where id = v_new_id;
end;
$$;

-- ─── 6. update_assessment_by_session — flip enrollment to completed ───────────

create or replace function public.update_assessment_by_session(
  p_session_id text,
  p_updates jsonb
)
returns setof public.assessments
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.assessments set
    implementation_group      = coalesce((p_updates->>'implementation_group')::int, implementation_group),
    ig_screening_answers      = coalesce(p_updates->'ig_screening_answers', ig_screening_answers),
    ig_screening_score        = coalesce((p_updates->>'ig_screening_score')::decimal, ig_screening_score),
    assessor_name             = coalesce(p_updates->>'assessor_name', assessor_name),
    status                    = coalesce(p_updates->>'status', status),
    current_safeguard_index   = coalesce((p_updates->>'current_safeguard_index')::int, current_safeguard_index),
    organizational_risk_index = coalesce((p_updates->>'organizational_risk_index')::decimal, organizational_risk_index),
    total_safeguards          = coalesce((p_updates->>'total_safeguards')::int, total_safeguards),
    completed_safeguards      = coalesce((p_updates->>'completed_safeguards')::int, completed_safeguards),
    completed_at              = coalesce((p_updates->>'completed_at')::timestamptz, completed_at)
  where session_id = p_session_id;

  -- Enrollment completion hook
  if p_updates->>'status' = 'completed' then
    update public.enrollments set status = 'completed', completed_at = now()
    where assessment_id = (select id from public.assessments where session_id = p_session_id)
      and status <> 'completed';
  end if;

  return query select * from public.assessments where session_id = p_session_id;
end;
$$;

-- ─── 7. Training catalog public read ──────────────────────────────────────────

create or replace function public.get_training_catalog()
returns setof public.training_catalog
language sql
security definer
stable
set search_path = public
as $$
  select * from public.training_catalog order by control_number;
$$;

-- ─── 8. Grants ────────────────────────────────────────────────────────────────

grant execute on function public.get_enrollment_by_token(text) to anon, authenticated;
grant execute on function public.create_assessment(text, uuid, text, text) to anon, authenticated;
grant execute on function public.get_training_catalog() to anon, authenticated;
