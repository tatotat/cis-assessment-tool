-- Migration 003 — Security hardening
-- Run this in the Supabase SQL Editor on an existing project.
-- (Fresh installs: supabase/schema.sql already includes all of this.)
--
-- What this fixes:
--   1. CRITICAL: "Public can create and view assessments by session" and
--      "Responses are session-scoped" were USING (true) — any anonymous
--      visitor could read/modify/delete every assessment and response.
--      RLS cannot see client-side .eq() filters, so session-scoped access
--      must go through SECURITY DEFINER RPCs that take the session_id as
--      an argument (a true bearer token).
--   2. HIGH: app_users was world-readable (email registry leak).
--   3. HIGH: organizations allowed public SELECT * (org code enumeration).
--      Replaced with a lookup-by-exact-code RPC returning safe columns.
--   4. Hardening: SET search_path on SECURITY DEFINER functions; storage
--      policies for the "locales" bucket (public read, admin-only write).

-- ─── 1. Drop the wide-open policies ────────────────────────────────────────────

drop policy if exists "Public can create and view assessments by session" on public.assessments;
drop policy if exists "Responses are session-scoped" on public.assessment_responses;
drop policy if exists "Public can view app_users" on public.app_users;
drop policy if exists "Public can look up organization by code" on public.organizations;
drop policy if exists "Assessments are org-scoped" on public.assessments;

-- ─── 2. Tight table policies (direct table access = admins + org members) ─────

create policy "Admins manage assessments" on public.assessments
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Org members can view their org's assessments" on public.assessments
  for select using (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    )
  );

create policy "Admins manage responses" on public.assessment_responses
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Org members can view their org's responses" on public.assessment_responses
  for select using (
    assessment_id in (
      select a.id from public.assessments a
      where a.organization_id in (
        select organization_id from public.profiles where id = auth.uid()
      )
    )
  );

-- ─── 3. Session-scoped RPCs for the anonymous assessment flow ─────────────────
-- The session_id is a crypto-random UUID generated client-side; knowing it is
-- the credential. Each function touches only rows matching the given session.

-- Organization lookup by exact code — returns only safe columns.
create or replace function public.get_org_by_code(p_code text)
returns table (id uuid, name text, code text)
language sql
security definer
stable
set search_path = public
as $$
  select o.id, o.name, o.code
  from public.organizations o
  where o.code = upper(p_code);
$$;

-- Create a new assessment for a session.
create or replace function public.create_assessment(
  p_session_id text,
  p_organization_id uuid,
  p_assessor_email text
)
returns setof public.assessments
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_session_id is null or length(p_session_id) < 32 then
    raise exception 'Invalid session id';
  end if;
  if not exists (select 1 from public.organizations where id = p_organization_id) then
    raise exception 'Organization not found';
  end if;
  return query
    insert into public.assessments (session_id, organization_id, assessor_email, status)
    values (p_session_id, p_organization_id, lower(p_assessor_email), 'screening')
    returning *;
end;
$$;

-- Fetch an assessment (with its organization) by session id.
create or replace function public.get_assessment_by_session(p_session_id text)
returns json
language sql
security definer
stable
set search_path = public
as $$
  select to_jsonb(a) || jsonb_build_object('organizations', to_jsonb(o))
  from public.assessments a
  left join public.organizations o on o.id = a.organization_id
  where a.session_id = p_session_id;
$$;

-- Update an assessment by session id. Only whitelisted fields are applied.
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
  return query
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
    where session_id = p_session_id
    returning *;
end;
$$;

-- Upsert one safeguard response for a session.
create or replace function public.upsert_response_by_session(
  p_session_id text,
  p_response jsonb
)
returns setof public.assessment_responses
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assessment_id uuid;
begin
  select id into v_assessment_id
  from public.assessments
  where session_id = p_session_id;

  if v_assessment_id is null then
    raise exception 'Session not found';
  end if;

  return query
    insert into public.assessment_responses (
      assessment_id, session_id, safeguard_id, control_number, asset_class,
      maturity_score, expectancy_score,
      impact_mission, impact_operational, impact_obligations, impact_financial,
      risk_score, risk_level, notes
    )
    values (
      v_assessment_id,
      p_session_id,
      p_response->>'safeguard_id',
      (p_response->>'control_number')::int,
      p_response->>'asset_class',
      (p_response->>'maturity_score')::int,
      (p_response->>'expectancy_score')::decimal,
      (p_response->>'impact_mission')::int,
      (p_response->>'impact_operational')::int,
      (p_response->>'impact_obligations')::int,
      (p_response->>'impact_financial')::int,
      (p_response->>'risk_score')::decimal,
      p_response->>'risk_level',
      p_response->>'notes'
    )
    on conflict (assessment_id, safeguard_id) do update set
      maturity_score     = excluded.maturity_score,
      expectancy_score   = excluded.expectancy_score,
      impact_mission     = excluded.impact_mission,
      impact_operational = excluded.impact_operational,
      impact_obligations = excluded.impact_obligations,
      impact_financial   = excluded.impact_financial,
      risk_score         = excluded.risk_score,
      risk_level         = excluded.risk_level,
      notes              = excluded.notes,
      updated_at         = now()
    returning *;
end;
$$;

-- Fetch all responses for a session (resume flow).
create or replace function public.get_responses_by_session(p_session_id text)
returns setof public.assessment_responses
language sql
security definer
stable
set search_path = public
as $$
  select r.*
  from public.assessment_responses r
  where r.session_id = p_session_id
  order by r.safeguard_id;
$$;

grant execute on function public.get_org_by_code(text) to anon, authenticated;
grant execute on function public.create_assessment(text, uuid, text) to anon, authenticated;
grant execute on function public.get_assessment_by_session(text) to anon, authenticated;
grant execute on function public.update_assessment_by_session(text, jsonb) to anon, authenticated;
grant execute on function public.upsert_response_by_session(text, jsonb) to anon, authenticated;
grant execute on function public.get_responses_by_session(text) to anon, authenticated;

-- ─── 4. Harden existing SECURITY DEFINER functions (search_path) ──────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create or replace function public.make_first_admin()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_count int;
begin
  select count(*) into admin_count
  from public.profiles
  where role = 'admin';

  if admin_count > 0 then
    return json_build_object(
      'success', false,
      'message', 'An admin already exists. Ask them to update your role, or run the SQL manually in Supabase.'
    );
  end if;

  update public.profiles
  set role = 'admin'
  where id = auth.uid();

  return json_build_object(
    'success', true,
    'message', 'Admin access granted. You can now manage organizations, assessments, and users.'
  );
end;
$$;

-- ─── 5. Storage: "locales" bucket — public read, admin-only write ─────────────

insert into storage.buckets (id, name, public)
values ('locales', 'locales', true)
on conflict (id) do nothing;

drop policy if exists "Public read locales" on storage.objects;
drop policy if exists "Admins insert locales" on storage.objects;
drop policy if exists "Admins update locales" on storage.objects;
drop policy if exists "Admins delete locales" on storage.objects;

create policy "Public read locales" on storage.objects
  for select using (bucket_id = 'locales');

create policy "Admins insert locales" on storage.objects
  for insert with check (bucket_id = 'locales' and public.is_admin());

create policy "Admins update locales" on storage.objects
  for update using (bucket_id = 'locales' and public.is_admin())
  with check (bucket_id = 'locales' and public.is_admin());

create policy "Admins delete locales" on storage.objects
  for delete using (bucket_id = 'locales' and public.is_admin());
