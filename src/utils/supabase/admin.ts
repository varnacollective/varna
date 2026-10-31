/**
 * utils/supabase/admin.ts – Server-only Supabase admin client.
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.
 * NEVER import this in browser components or expose to the client.
 */
import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== "REPLACE_WITH_YOUR_SERVICE_ROLE_KEY"
      ? process.env.SUPABASE_SERVICE_ROLE_KEY
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing Supabase URL or Key environment variables."
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

