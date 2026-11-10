import React from "react";
import { createAdminClient } from "@/utils/supabase/admin";
import { UserCog } from "lucide-react";
import UsersClientView from "./UsersClientView";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const supabase = createAdminClient();

  const { data: adminUsersData } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: false });

  let users = adminUsersData || [];
  if (users.length === 0) {
    users = [
      {
        id: "usr-01",
        name: "Yuvraj Sharma",
        email: "yuvraj@varnacollective.com",
        role: "varna_administrator",
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "usr-02",
        name: "Deepa Nair",
        email: "deepa@varnacollective.com",
        role: "score_reviewer",
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "usr-03",
        name: "Assessment Reviewer",
        email: "review@varnacollective.com",
        role: "assessment_team",
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          borderBottom: "1px solid var(--sa-border)",
          paddingBottom: "16px",
        }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserCog className="w-5 h-5" style={{ color: "var(--sa-accent)" }} />
            <h1 className="sa-page-title">Users &amp; Role Management</h1>
          </div>
          <p style={{ fontSize: "13px", color: "var(--sa-muted)", marginTop: "4px" }}>
            Administer internal team credentials, RBAC assignment, and assessment sign-off authorities.
          </p>
        </div>
      </div>

      <UsersClientView initialUsers={users} />
    </div>
  );
}
