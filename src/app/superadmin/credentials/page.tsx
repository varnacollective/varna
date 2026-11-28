import { createAdminClient } from "@/utils/supabase/admin";
import { listLogins, type Login } from "@/lib/auth/logins";
import LoginsClient from "./LoginsClient";

export const revalidate = 0;

export default async function CredentialsPage() {
  let logins: Login[] = [];
  let loadError = false;
  try {
    logins = await listLogins(createAdminClient());
  } catch (error) {
    console.error("[credentials] Could not list logins:", error instanceof Error ? error.message : error);
    loadError = true;
  }
  return <LoginsClient initialLogins={logins} loadError={loadError} />;
}
