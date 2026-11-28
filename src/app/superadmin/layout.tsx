import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import SuperAdminClientLayout from "./SuperAdminClientLayout";
import "./sa-styles.css";

// Second check after src/proxy.ts: only a signed superadmin session may enter.
export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (session?.role !== "superadmin") {
    redirect("/");
  }

  return <SuperAdminClientLayout>{children}</SuperAdminClientLayout>;
}
