import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendInvitationEmail } from "@/lib/email/send-email";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("partner_invitations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ invitations: data || [] });
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
    const { invitation_id } = body;

    if (!invitation_id) {
      return NextResponse.json({ error: "invitation_id is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: inv, error } = await supabase
      .from("partner_invitations")
      .select(`
        *,
        partner_clients ( name )
      `)
      .eq("id", invitation_id)
      .single();

    if (error || !inv) {
      return NextResponse.json({ error: "Invitation record not found" }, { status: 404 });
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      request.nextUrl.origin;
    const invitation_url =
      inv.invitation_url || `${siteUrl.replace(/\/+$/, "")}/invitation/${inv.slug}`;

    const emailResult = await sendInvitationEmail({
      to: inv.contact_email,
      contact_person: inv.contact_person,
      enterprise_name: inv.enterprise_name,
      invitation_url,
      client_name: inv.partner_clients?.name || null,
      personal_note: inv.personal_note || null,
      validity_days: inv.validity_days || 30,
      invitation_id: inv.id,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || "Failed to send email via SMTP" },
        { status: 500 }
      );
    }

    const nowIso = new Date().toISOString();
    await supabase
      .from("partner_invitations")
      .update({
        status: "sent",
        sent_at: nowIso,
        provider_message_id: emailResult.messageId || null,
      })
      .eq("id", inv.id);

    return NextResponse.json({
      success: true,
      messageId: emailResult.messageId,
      sent_at: nowIso,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
