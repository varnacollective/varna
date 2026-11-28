/**
 * utils/supabase/admin.ts – Server-only Supabase admin client.
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY, which bypasses row level security.
 * NEVER import this in browser components or expose it to the client.
 * Fails loudly when the key is missing instead of falling back to the
 * public key.
 */
import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey || serviceKey === "REPLACE_WITH_YOUR_SERVICE_ROLE_KEY") {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
