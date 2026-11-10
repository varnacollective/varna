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
    const { answers } = body;

    const admin = createAdminClient();

    // 1. Resolve invitation
    const { data: invitation, error: invError } = await admin
      .from("partner_invitations")
      .select("id, status, supplier_id, client_id, enterprise_name")
      .eq("slug", slug)
      .single();

    if (invError || !invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (invitation.status === "declined") {
      return NextResponse.json({ error: "Invitation was previously declined." }, { status: 403 });
    }

    const now = new Date().toISOString();

    // 2. Fetch existing draft or prepare answers
    let effectiveAnswers = answers;
    const { data: existingDraft } = await admin
      .from("partner_form_responses")
      .select("id, answers, version")
      .eq("invitation_id", invitation.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!effectiveAnswers && existingDraft?.answers) {
      effectiveAnswers = existingDraft.answers;
    }

    if (!effectiveAnswers) {
      effectiveAnswers = {};
    }

    // 3. Lock as submitted response
    if (existingDraft) {
      await admin
        .from("partner_form_responses")
        .update({
          answers: effectiveAnswers,
          status: "submitted",
          submitted_at: now,
          updated_at: now,
        })
        .eq("id", existingDraft.id);
    } else {
      await admin
        .from("partner_form_responses")
        .insert({
          invitation_id: invitation.id,
          answers: effectiveAnswers,
          version: 1,
          status: "submitted",
          submitted_at: now,
          created_at: now,
          updated_at: now,
        });
    }

    // 4. Update partner_invitations status to submitted
    await admin
      .from("partner_invitations")
      .update({
        status: "submitted",
      })
      .eq("id", invitation.id);

    // 5. Update assessment_pipeline
    if (invitation.supplier_id) {
      const { data: pipelineRow } = await admin
        .from("assessment_pipeline")
        .select("id")
        .eq("supplier_id", invitation.supplier_id)
        .maybeSingle();

      if (pipelineRow) {
        await admin
          .from("assessment_pipeline")
          .update({
            status: "submitted",
            updated_at: now,
          })
          .eq("id", pipelineRow.id);
      } else {
        await admin
          .from("assessment_pipeline")
          .insert({
            supplier_id: invitation.supplier_id,
            client_id: invitation.client_id || null,
            status: "submitted",
            created_at: now,
            updated_at: now,
          });
      }

      // Also update partner_client_supplier_links if present
      if (invitation.client_id) {
        await admin
          .from("partner_client_supplier_links")
          .update({
            assessment_status: "submitted",
          })
          .eq("supplier_id", invitation.supplier_id)
          .eq("client_id", invitation.client_id);
      }
    }

    // 6. Record audit log
    try {
      await admin.from("audit_log").insert({
        action: "partner_form_submitted",
        entity_type: "partner_invitations",
        entity_id: invitation.id,
        after_state: {
          slug,
          enterprise_name: invitation.enterprise_name,
          submitted_at: now,
        },
      });
    } catch (auditErr) {
      console.warn("Failed to write audit log:", auditErr);
    }

    return NextResponse.json({
      success: true,
      submittedAt: now,
    });
  } catch (err: any) {
    console.error("[API Invitation Submit] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to submit assessment" },
      { status: 500 }
    );
  }
}
