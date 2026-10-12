import { cookies } from "next/headers";
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

  // 2. Check authenticated session cookies
  const cookieStore = await cookies();
  const superadminCookie = cookieStore.get("varna_superadmin_session");
  const sessionCookie = cookieStore.get("varna_session");

  let isAuthorized = Boolean(user) || superadminCookie?.value === "true";

  if (!isAuthorized && sessionCookie?.value) {
    try {
      const parsedSession = JSON.parse(sessionCookie.value);
      if (
        parsedSession.role === "superadmin" ||
        parsedSession.clientId?.toLowerCase() === "superadmin"
      ) {
        isAuthorized = true;
      }
    } catch {
      // JSON parse error
    }
  }

  // If no active session exists, immediately redirect to login before child pages render
  if (!isAuthorized) {
    redirect("/");
  }

  return <SuperAdminClientLayout>{children}</SuperAdminClientLayout>;
}
