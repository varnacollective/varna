import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("partner_clients")
      .select("*")
      .order("name");

    if (error) throw error;
    return NextResponse.json({ clients: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, contact_name, contact_email, outreach_mode = "approve_once" } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("partner_clients")
      .insert({
        name: name.trim(),
        contact_name: contact_name?.trim() || null,
        contact_email: contact_email?.trim() || null,
        outreach_mode,
        status: "active",
      })
      .select("*")
      .single();

    if (error) throw error;

    await supabase.from("audit_log").insert({
      user_id: session.userId || "superadmin",
      action: "create_client",
      entity_type: "partner_client",
      entity_id: data.id,
      after_state: data,
    });

    return NextResponse.json({ success: true, client: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
