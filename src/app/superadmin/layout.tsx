import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SuperAdminClientLayout from "./SuperAdminClientLayout";
import "./sa-styles.css";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const session = await getSession();
  const isAuthorized = Boolean(user) || session?.role === "superadmin";

  if (!isAuthorized) {
    redirect("/");
  }

  return <SuperAdminClientLayout>{children}</SuperAdminClientLayout>;
}
