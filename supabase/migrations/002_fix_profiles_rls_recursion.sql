-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 002: Fix infinite recursion in profiles RLS + is_admin() helper
--
-- Problem: The "Admins manage all profiles" policy queries public.profiles
-- from inside a policy ON public.profiles → PostgreSQL error 42P17
-- (infinite recursion detected in policy for relation "profiles").
--
-- Fix: Replace the recursive subquery with a SECURITY DEFINER function
-- (is_admin()) that runs as the postgres role, bypassing RLS when it
-- queries profiles internally, so there is no recursion.
--
-- Run this in Supabase SQL Editor.
-- Safe to re-run — uses CREATE OR REPLACE and DROP IF EXISTS.
-- ─────────────────────────────────────────────────────────────────────────────


-- ── 1. Drop the recursive policy ─────────────────────────────────────────────

DROP POLICY IF EXISTS "Admins manage all profiles"    ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles"    ON public.profiles;


-- ── 2. Create is_admin() — a recursion-safe admin check ──────────────────────
-- SECURITY DEFINER means the function body runs as the owning role (postgres),
-- which bypasses RLS. So querying profiles inside the function does NOT
-- re-trigger profile policies → no infinite recursion.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;


-- ── 3. Re-add the admin profile policy using is_admin() ──────────────────────

CREATE POLICY "Admins can manage profiles" ON public.profiles
  FOR ALL
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());


-- ── 4. Update app_users policy to use is_admin() too ─────────────────────────
-- (The app_users policy queries profiles from a different table so it doesn't
--  recurse, but using the function is cleaner and consistent.)

DROP POLICY IF EXISTS "Admins manage app_users" ON public.app_users;

CREATE POLICY "Admins manage app_users" ON public.app_users
  FOR ALL
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());


-- ── 5. Update organizations policy to use is_admin() ─────────────────────────

DROP POLICY IF EXISTS "Admins can manage all organizations" ON public.organizations;

CREATE POLICY "Admins can manage all organizations" ON public.organizations
  FOR ALL
  USING  (public.is_admin())
  WITH CHECK (public.is_admin());


-- ── Verify ────────────────────────────────────────────────────────────────────
-- After running, test with:
--   SELECT public.is_admin();          -- should return true when logged in as admin
--   SELECT id, email, role FROM public.profiles WHERE email = 'your@email.com';
-- ─────────────────────────────────────────────────────────────────────────────
