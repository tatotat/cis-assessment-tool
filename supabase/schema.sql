-- CIS RAM v2.1 Assessment Tool - Database Schema
-- ⚠️  FRESH INSTALL ONLY — run this on a brand-new Supabase project.
-- If you already ran this before, use supabase/migrations/001_add_app_users_and_admin_setup.sql
-- instead to add only the new tables/functions without conflicts.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Organizations (multi-tenant)
create table public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text unique not null,
  industry text,
  contact_email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User profiles (linked to auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id),
  email text not null,
  full_name text,
  role text default 'user' check (role in ('admin', 'user')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Assessments
create table public.assessments (
  id uuid primary key default uuid_generate_v4(),
  session_id text unique not null default uuid_generate_v4()::text,
  organization_id uuid references public.organizations(id) not null,
  assessor_email text not null,
  assessor_name text,
  implementation_group int check (implementation_group in (1,2,3)),
  ig_screening_answers jsonb,
  ig_screening_score decimal,
  status text default 'screening' check (status in ('screening', 'in_progress', 'completed')),
  current_safeguard_index int default 0,
  organizational_risk_index decimal,
  total_safeguards int,
  completed_safeguards int default 0,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Assessment Responses (one per safeguard)
create table public.assessment_responses (
  id uuid primary key default uuid_generate_v4(),
  assessment_id uuid references public.assessments(id) on delete cascade,
  session_id text not null,
  safeguard_id text not null,
  control_number int not null,
  asset_class text not null,
  maturity_score int check (maturity_score between 1 and 5),
  expectancy_score decimal,
  impact_mission int,
  impact_operational int,
  impact_obligations int,
  impact_financial int,
  risk_score decimal,
  risk_level text check (risk_level in ('acceptable', 'unacceptable', 'high')),
  risk_treatment text check (risk_treatment in ('accept', 'reduce')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(assessment_id, safeguard_id)
);

-- App Users (assessors and known contacts — does NOT require a Supabase Auth account)
-- This is separate from `profiles` (which is linked to auth.users).
-- Use this table for user management in the admin panel.
create table public.app_users (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  organization_id uuid references public.organizations(id) on delete set null,
  role text default 'user' check (role in ('admin', 'user')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_responses enable row level security;

-- Organization Policies
create policy "Admins can manage all organizations" on public.organizations
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users can view their own organization" on public.organizations
  for select using (
    id in (select organization_id from public.profiles where id = auth.uid())
  );

-- NOTE: there is intentionally NO public SELECT policy on organizations.
-- Anonymous org lookup goes through the get_org_by_code() RPC (below),
-- which requires the exact code and returns only safe columns.

-- is_admin() — recursion-safe helper used by RLS policies.
-- SECURITY DEFINER runs as postgres (bypasses RLS internally),
-- so querying profiles inside this function does NOT re-trigger
-- profile policies and avoids infinite recursion (error 42P17).
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Profile Policies
create policy "Users can view their own profile" on public.profiles
  for select using (id = auth.uid());

create policy "Users can update their own profile" on public.profiles
  for update using (id = auth.uid());

create policy "Admins can manage profiles" on public.profiles
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Assessment Policies
-- Direct table access is limited to admins and (read-only) org members.
-- The anonymous assessment flow uses the session-scoped RPCs below —
-- RLS cannot see client-side .eq() filters, so USING (true) policies
-- would expose every row to anyone holding the public anon key.
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

-- App Users Policies (admin-only — contains an email registry)
alter table public.app_users enable row level security;

create policy "Admins manage app_users" on public.app_users
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Assessment Response Policies
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

-- Updated at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger handle_organizations_updated_at
  before update on public.organizations
  for each row execute procedure public.handle_updated_at();

create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_assessments_updated_at
  before update on public.assessments
  for each row execute procedure public.handle_updated_at();

create trigger handle_responses_updated_at
  before update on public.assessment_responses
  for each row execute procedure public.handle_updated_at();

-- Function to handle new user (auto-create profile)
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated-at trigger for app_users
create trigger handle_app_users_updated_at
  before update on public.app_users
  for each row execute procedure public.handle_updated_at();

-- ─── Admin Bootstrap Function ──────────────────────────────────────────────────
-- Allows the FIRST user to promote themselves to admin.
-- Safe: only succeeds when no admin exists yet in profiles.
-- Call via: supabase.rpc('make_first_admin')
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

-- ─── Manual Admin Setup (run in Supabase SQL Editor) ──────────────────────────
-- If make_first_admin() doesn't work, run this manually replacing the email:
--
--   UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
--
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Session-Scoped RPCs (anonymous assessment flow) ──────────────────────────
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

-- ─── Storage: "locales" bucket — public read, admin-only write ────────────────

insert into storage.buckets (id, name, public)
values ('locales', 'locales', true)
on conflict (id) do nothing;

create policy "Public read locales" on storage.objects
  for select using (bucket_id = 'locales');

create policy "Admins insert locales" on storage.objects
  for insert with check (bucket_id = 'locales' and public.is_admin());

create policy "Admins update locales" on storage.objects
  for update using (bucket_id = 'locales' and public.is_admin())
  with check (bucket_id = 'locales' and public.is_admin());

create policy "Admins delete locales" on storage.objects
  for delete using (bucket_id = 'locales' and public.is_admin());

-- Seed a demo organization
insert into public.organizations (name, code, industry, contact_email)
values ('Demo Organization', 'DEMO001', 'Technology', 'demo@example.com');
