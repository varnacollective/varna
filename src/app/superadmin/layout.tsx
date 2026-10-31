import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SuperAdminClientLayout from "./SuperAdminClientLayout";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Fetch Supabase session on the server side (defense in depth)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Check authenticated session
  const session = await getSession();
  const isAuthorized = Boolean(user) || session?.role === "superadmin";

  // If no active session exists, immediately redirect to login before child pages render
  if (!isAuthorized) {
    redirect("/");
  }

  return <SuperAdminClientLayout>{children}</SuperAdminClientLayout>;
}
