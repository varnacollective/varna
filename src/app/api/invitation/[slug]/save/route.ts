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

    const body = await req.json();
    const { answers } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Invalid answers payload" }, { status: 400 });
    }

    const admin = createAdminClient();

    // 1. Resolve invitation
    const { data: invitation, error: invError } = await admin
      .from("partner_invitations")
      .select("id, status, supplier_id, client_id")
      .eq("slug", slug)
      .single();

    if (invError || !invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Do not overwrite if already submitted or declined
    if (invitation.status === "submitted" || invitation.status === "registration_completed") {
      return NextResponse.json({ error: "Form has already been submitted and locked." }, { status: 409 });
    }
    if (invitation.status === "declined") {
      return NextResponse.json({ error: "Invitation has been declined." }, { status: 403 });
    }

    // Update status to accepted if first interaction
    if (["pending", "sent", "delivered"].includes(invitation.status)) {
      await admin
        .from("partner_invitations")
        .update({ status: "accepted" })
        .eq("id", invitation.id);
    }

    // 2. Upsert draft in partner_form_responses
    const { data: existingDraft } = await admin
      .from("partner_form_responses")
      .select("id, version")
      .eq("invitation_id", invitation.id)
      .eq("status", "draft")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const now = new Date().toISOString();

    if (existingDraft) {
      await admin
        .from("partner_form_responses")
        .update({
          answers,
          updated_at: now,
        })
        .eq("id", existingDraft.id);
    } else {
      await admin
        .from("partner_form_responses")
        .insert({
          invitation_id: invitation.id,
          answers,
          version: 1,
          status: "draft",
          created_at: now,
          updated_at: now,
        });
    }

    return NextResponse.json({
      success: true,
      savedAt: now,
    });
  } catch (err: any) {
    console.error("[API Invitation Save] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to save draft" },
      { status: 500 }
    );
  }
}
