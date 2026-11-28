/**
 * Server-only session helper. The session comes from Supabase Auth: the
 * access token in the auth cookies is verified, then mapped by
 * `sessionFromClaims`. Import ONLY from Server Components, Route Handlers
 * or Server Actions.
 */
import "server-only";
import { createClient } from "@/utils/supabase/server";
import { sessionFromClaims, type SessionPayload } from "@/lib/auth/claims";

export type { SessionPayload, SessionRole } from "@/lib/auth/claims";

/** The signed-in user's session, or null if signed out or not set up. */
export async function getSession(): Promise<SessionPayload | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data) return null;
  return sessionFromClaims(data.claims);
}
