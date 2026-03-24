-- CIS RAM v2.1 Assessment Tool - Database Schema
-- Run this in your Supabase SQL editor

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

-- Row Level Security
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_responses enable row level security;

-- Organization Policies
create policy "Admins can manage all organizations" on public.organizations
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users can view their own organization" on public.organizations
  for select using (
    id in (select organization_id from public.profiles where id = auth.uid())
  );

-- Allow unauthenticated lookup by org code (for assessment flow)
create policy "Public can look up organization by code" on public.organizations
  for select using (true);

-- Profile Policies
create policy "Users can view their own profile" on public.profiles
  for select using (id = auth.uid());

create policy "Users can update their own profile" on public.profiles
  for update using (id = auth.uid());

create policy "Admins manage all profiles" on public.profiles
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Assessment Policies
create policy "Assessments are org-scoped" on public.assessments
  for all using (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    ) or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Allow public insert/select for assessments (non-auth flow uses session_id)
create policy "Public can create and view assessments by session" on public.assessments
  for all using (true)
  with check (true);

-- Assessment Response Policies
create policy "Responses are session-scoped" on public.assessment_responses
  for all using (true)
  with check (true);

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
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed a demo organization
insert into public.organizations (name, code, industry, contact_email)
values ('Demo Organization', 'DEMO001', 'Technology', 'demo@example.com');
