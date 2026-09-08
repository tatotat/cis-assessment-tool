-- Migration 005 — Server-side app settings (branding, disclaimer, guest code…)
-- Run this in the Supabase SQL Editor on a project that already has 004 applied.
-- (Fresh installs: supabase/schema.sql already includes all of this.)
--
-- Before this, Admin → Settings only wrote to the admin's own browser
-- localStorage, so assessors never saw the configured logo, org name,
-- disclaimer, or guest org code. This stores one shared settings document
-- (admin-write via RLS, public-read via RPC); the client keeps localStorage
-- as a cache / demo-mode fallback.

create table if not exists public.app_settings (
  id int primary key check (id = 1),           -- single row
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

insert into public.app_settings (id, settings) values (1, '{}'::jsonb)
on conflict (id) do nothing;

alter table public.app_settings enable row level security;

drop policy if exists "Admins manage app_settings" on public.app_settings;
create policy "Admins manage app_settings" on public.app_settings
  for all
  using (public.is_admin())
  with check (public.is_admin());
-- No public policies — anonymous read is via the RPC below.

drop trigger if exists handle_app_settings_updated_at on public.app_settings;
create trigger handle_app_settings_updated_at
  before update on public.app_settings
  for each row execute procedure public.handle_updated_at();

create or replace function public.get_app_settings()
returns jsonb
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select settings from public.app_settings where id = 1), '{}'::jsonb);
$$;

grant execute on function public.get_app_settings() to anon, authenticated;
