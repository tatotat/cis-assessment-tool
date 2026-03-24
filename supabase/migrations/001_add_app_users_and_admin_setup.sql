-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 001: Add app_users table + make_first_admin RPC
--
-- Run this in Supabase SQL Editor if you already ran the original schema.sql.
-- Safe to run on an existing database — uses IF NOT EXISTS throughout.
-- ─────────────────────────────────────────────────────────────────────────────


-- ── 1. app_users table ────────────────────────────────────────────────────────
-- Stores assessors and known contacts WITHOUT requiring a Supabase Auth account.
-- The admin panel's "Users" page reads from this table, not from profiles.

create table if not exists public.app_users (
  id               uuid        primary key default uuid_generate_v4(),
  email            text        not null unique,
  organization_id  uuid        references public.organizations(id) on delete set null,
  role             text        default 'user' check (role in ('admin', 'user')),
  notes            text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- Enable RLS
alter table public.app_users enable row level security;

-- Anyone can read the user list (assessment flow checks org membership by code)
create policy if not exists "Public can view app_users"
  on public.app_users
  for select using (true);

-- Only admins can insert / update / delete
create policy if not exists "Admins manage app_users"
  on public.app_users
  for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Keep updated_at current
create trigger handle_app_users_updated_at
  before update on public.app_users
  for each row execute procedure public.handle_updated_at();


-- ── 2. make_first_admin() RPC ─────────────────────────────────────────────────
-- Grants admin role to the calling auth user, but ONLY when no admin exists yet.
-- Called from the login page via: supabase.rpc('make_first_admin')
-- Falls back gracefully with a message if an admin already exists.

create or replace function public.make_first_admin()
returns json
language plpgsql
security definer
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
      'message', 'An admin already exists. Ask them to update your role, or run the SQL below manually in Supabase.'
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


-- ── 3. Manual fallback ────────────────────────────────────────────────────────
-- If make_first_admin() doesn't work (e.g. admin already exists),
-- run this manually in SQL Editor, replacing the email address:
--
--   UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
--
-- ─────────────────────────────────────────────────────────────────────────────
