-- =============================================================================
-- Migration: enable_rls_security.sql
-- Purpose  : Enable Row-Level Security on all 11 core tables, revoke public
--            access to client_credentials, and enforce strict tenant-isolation
--            SELECT policies so each authenticated client only sees its own rows.
--
-- Run via: psql $DATABASE_URL -f supabase/migrations/enable_rls_security.sql
--          or paste into the Supabase SQL editor.
-- =============================================================================

-- ── 1. Enable RLS on every core table ────────────────────────────────────────

ALTER TABLE public.client_master             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_credentials        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_spend_by_client  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_detail_by_client ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_summary            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_register            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_catalogue         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores_summary            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_inputs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_master         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_certificates      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_links          ENABLE ROW LEVEL SECURITY;

-- ── 2. Revoke all public access to client_credentials ─────────────────────────
--   Only the service_role (server-side) may read this table.

REVOKE ALL ON public.client_credentials FROM anon, authenticated;

-- ── 3. Drop any stale/permissive policies before re-creating ─────────────────
--   (idempotent: IF EXISTS means no error on first run)

DO $$
DECLARE
  pol RECORD;
  tbl TEXT;
  tbls TEXT[] := ARRAY[
    'client_master','client_credentials','category_spend_by_client',
    'supplier_detail_by_client','client_summary','order_register',
    'product_catalogue','scores_summary','assessment_inputs',
    'enterprise_master','partner_certificates','assessment_links'
  ];
BEGIN
  FOREACH tbl IN ARRAY tbls LOOP
    FOR pol IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = tbl
    LOOP
      EXECUTE format(
        'DROP POLICY IF EXISTS %I ON public.%I',
        pol.policyname, tbl
      );
    END LOOP;
  END LOOP;
END;
$$;

-- ── 4. Helper: expose current JWT claims as a stable function ─────────────────
--   Our signed cookies are not Supabase-auth tokens, so we store the verified
--   clientId + role in the Postgres session via:
--     SET LOCAL app.current_client_id = '...';
--     SET LOCAL app.current_role       = '...';
--   These SET LOCAL calls are made by the server-side Supabase admin client
--   BEFORE executing any query.

-- ── 5. Tenant-isolation policies ─────────────────────────────────────────────
-- Pattern:
--   • anon  : no access (deny-by-default because RLS is now ON)
--   • authenticated: allowed ONLY when current_setting matches the row's
--                    client_id or parent_group column.
--   • service_role : bypasses RLS entirely (Supabase default).
--
-- All INSERT / UPDATE / DELETE remain restricted to service_role (server-only).

-- ── client_master ─────────────────────────────────────────────────────────────
CREATE POLICY "client_master_tenant_read"
  ON public.client_master
  FOR SELECT
  TO authenticated
  USING (
    client_id = current_setting('app.current_client_id', TRUE)
    OR current_setting('app.current_role', TRUE) = 'superadmin'
  );

-- ── client_credentials ───────────────────────────────────────────────────────
--   No anon/authenticated reads at all — only service_role.
--   (REVOKE above + no policy = hard deny for anon/authenticated)

-- ── category_spend_by_client ──────────────────────────────────────────────────
CREATE POLICY "cat_spend_tenant_read"
  ON public.category_spend_by_client
  FOR SELECT
  TO authenticated
  USING (
    client_id = current_setting('app.current_client_id', TRUE)
    OR current_setting('app.current_role', TRUE) IN ('superadmin','group')
  );

-- ── supplier_detail_by_client ─────────────────────────────────────────────────
CREATE POLICY "supplier_detail_tenant_read"
  ON public.supplier_detail_by_client
  FOR SELECT
  TO authenticated
  USING (
    client_id = current_setting('app.current_client_id', TRUE)
    OR parent_group = current_setting('app.current_client_id', TRUE)
    OR current_setting('app.current_role', TRUE) IN ('superadmin','group')
  );

-- ── client_summary ────────────────────────────────────────────────────────────
CREATE POLICY "client_summary_tenant_read"
  ON public.client_summary
  FOR SELECT
  TO authenticated
  USING (
    client_id = current_setting('app.current_client_id', TRUE)
    OR current_setting('app.current_role', TRUE) IN ('superadmin','group')
  );

-- ── order_register ────────────────────────────────────────────────────────────
CREATE POLICY "order_register_tenant_read"
  ON public.order_register
  FOR SELECT
  TO authenticated
  USING (
    client_id = current_setting('app.current_client_id', TRUE)
    OR current_setting('app.current_role', TRUE) IN ('superadmin','group')
  );

-- ── product_catalogue ─────────────────────────────────────────────────────────
--   Product catalogue is shared/read-only for all authenticated users.
CREATE POLICY "product_catalogue_auth_read"
  ON public.product_catalogue
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- ── scores_summary ────────────────────────────────────────────────────────────
--   Scores are enterprise-level, not per-client. Allow all authenticated users
--   to read; superadmin/group can read all.
CREATE POLICY "scores_summary_auth_read"
  ON public.scores_summary
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- ── assessment_inputs ─────────────────────────────────────────────────────────
CREATE POLICY "assessment_inputs_auth_read"
  ON public.assessment_inputs
  FOR SELECT
  TO authenticated
  USING (
    current_setting('app.current_role', TRUE) = 'superadmin'
  );

-- ── enterprise_master ─────────────────────────────────────────────────────────
CREATE POLICY "enterprise_master_auth_read"
  ON public.enterprise_master
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- ── partner_certificates ──────────────────────────────────────────────────────
CREATE POLICY "partner_certs_superadmin_read"
  ON public.partner_certificates
  FOR SELECT
  TO authenticated
  USING (
    current_setting('app.current_role', TRUE) = 'superadmin'
  );

-- ── assessment_links ──────────────────────────────────────────────────────────
--   Token-based access is handled at the API layer (no authenticated cookie).
--   Only superadmin may browse all rows.
CREATE POLICY "assessment_links_superadmin_read"
  ON public.assessment_links
  FOR SELECT
  TO authenticated
  USING (
    current_setting('app.current_role', TRUE) = 'superadmin'
  );

-- ── 6. Strict deny for INSERT/UPDATE/DELETE via authenticated role ────────────
--   service_role bypasses all policies; no explicit INSERT policies are created
--   so authenticated (browser client) can never mutate any table.

-- =============================================================================
-- Done. Verify with: SELECT tablename, rowsecurity FROM pg_tables
--                    WHERE schemaname = 'public';
-- =============================================================================

