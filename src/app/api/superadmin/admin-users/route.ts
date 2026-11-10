import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, role = "assessment_team" } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("admin_users")
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        is_active: true,
      })
      .select("*")
      .single();

    if (error) throw error;

    await supabase.from("audit_log").insert({
      user_id: session.userId || "superadmin",
      action: "create_admin_user",
      entity_type: "admin_user",
      entity_id: data.id,
      after_state: data,
    });

    return NextResponse.json({ success: true, user: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
