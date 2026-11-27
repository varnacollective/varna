import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/utils/supabase/admin";
import { CLIENT_COLUMNS, OUTREACH_MODES, toClientRecord, type ClientMasterRow } from "@/lib/clients";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("client_master")
      .select(CLIENT_COLUMNS)
      .order("client_name")
      .overrideTypes<ClientMasterRow[], { merge: false }>();

    if (error) throw error;
    return NextResponse.json({ clients: (data ?? []).map(toClientRecord) });
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
    if (!OUTREACH_MODES.includes(outreach_mode)) {
      return NextResponse.json({ error: "Unknown outreach mode" }, { status: 400 });
    }

    // The database gives the hotel its code (CLT-012, …).
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("client_master")
      .insert({
        client_name: name.trim(),
        procurement_contact_name: contact_name?.trim() || null,
        contact_email: contact_email?.trim() || null,
        outreach_mode,
        account_status: "Active",
      })
      .select(CLIENT_COLUMNS)
      .single<ClientMasterRow>();

    if (error) throw error;

    await supabase.from("audit_log").insert({
      user_id: session.userId || "superadmin",
      action: "create_client",
      entity_type: "client",
      entity_id: data.client_id,
      after_state: data,
    });

    return NextResponse.json({ success: true, client: toClientRecord(data) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
