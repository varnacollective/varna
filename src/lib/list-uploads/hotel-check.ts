import "server-only";
import { createAdminClient } from "@/utils/supabase/admin";
import { badRequest } from "./auth";

/** An error response if the chosen hotel doesn't exist; null when it does or when "No hotel" (null) was chosen. */
export async function missingHotel(clientId: string | null): Promise<Response | null> {
  if (clientId === null) return null;
  const { data, error } = await createAdminClient()
    .from("client_master")
    .select("client_id")
    .eq("client_id", clientId)
    .maybeSingle<{ client_id: string }>();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return data ? null : badRequest("That hotel no longer exists. Choose another or add it again.");
}
