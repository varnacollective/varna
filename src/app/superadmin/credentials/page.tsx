import { createClient } from "@/utils/supabase/server";
import CredentialsClient from "./CredentialsClient";

export const revalidate = 0;

export default async function CredentialsPage() {
  const supabase = await createClient();

  const { data: credentials, error } = await supabase
    .from("client_credentials")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching client_credentials:", error);
  }

  return <CredentialsClient initialCredentials={credentials || []} />;
}
