/**
 * scripts/disable_rls.js — NEUTRALIZED
 *
 * This script has been intentionally disabled as part of security remediation
 * (Fix F5 / F3). Running it would disable Row-Level Security across all core
 * tables, exposing tenant data.
 *
 * To re-enable RLS after accidental disabling, run:
 *   psql $DATABASE_URL -f supabase/migrations/enable_rls_security.sql
 *
 * DO NOT restore the original pool.query logic.
 */

console.error(
  "[SECURITY] disable_rls.js has been permanently neutralized. " +
  "To manage RLS policies, use supabase/migrations/enable_rls_security.sql."
);
process.exit(1);
