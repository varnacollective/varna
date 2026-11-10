import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Missing invitation slug" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { reason } = body;

    const admin = createAdminClient();

    const { data: invitation, error: invError } = await admin
      .from("partner_invitations")
      .select("id, status, enterprise_name")
      .eq("slug", slug)
      .single();

    if (invError || !invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    const now = new Date().toISOString();

    await admin
      .from("partner_invitations")
      .update({
        status: "declined",
      })
      .eq("id", invitation.id);

    try {
      await admin.from("audit_log").insert({
        action: "partner_invitation_declined",
        entity_type: "partner_invitations",
        entity_id: invitation.id,
        reason: reason || "Declined by partner",
        after_state: {
          slug,
          enterprise_name: invitation.enterprise_name,
          declined_at: now,
          reason,
        },
      });
    } catch (auditErr) {
      console.warn("Failed to write audit log:", auditErr);
    }

    return NextResponse.json({
      success: true,
      declinedAt: now,
    });
  } catch (err: any) {
    console.error("[API Invitation Decline] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to decline invitation" },
      { status: 500 }
    );
  }
}
