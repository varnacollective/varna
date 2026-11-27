import "server-only";
import { createAdminClient } from "@/utils/supabase/admin";
import { generatePartnerSlug } from "@/lib/slug";
import { generateInvitationEmail } from "@/lib/email/invitation-template";
import { sendInvitationEmail } from "@/lib/email/send-email";

/**
 * Invite one supplier: create the supplier, link it to the hotel, create the
 * invitation, send the email, and record it. Used by the manual invite form
 * and by the supplier list upload, so both behave the same.
 *
 * "preview" only renders the email; "save" stores it unsent; "send" also
 * emails it.
 */

export type InvitationAction = "send" | "preview" | "save";

export interface InvitationInput {
  enterprise_name: string;
  brand_name?: string | null;
  contact_person: string;
  contact_email: string;
  phone?: string | null;
  client_id?: string | null;
  category?: string | null;
  state?: string | null;
  personal_note?: string | null;
  validity_days?: number | string | null;
  /** Where the supplier came from (partner_suppliers.source). */
  source?: "manual" | "bulk_upload";
}

export interface InvitationContext {
  action: InvitationAction;
  createdBy: string;
  /** Origin of the request, used when no site URL is configured. */
  origin: string;
}

export interface InvitationPreview {
  preview_html: string;
  invitation_url: string;
  slug: string;
  subject: string;
}

export interface InvitationCreated {
  slug: string;
  invitation_url: string;
  status: "sent" | "pending";
  supplier_id: string;
  invitation_id: string;
  email_sent: boolean;
  message_id: string | null;
}

export type InvitationOutcome =
  | { ok: true; kind: "preview"; body: InvitationPreview }
  | { ok: true; kind: "created"; body: InvitationCreated }
  | { ok: false; status: number; body: { error: string } & Record<string, unknown> };

const failure = (status: number, error: string, extra: Record<string, unknown> = {}): InvitationOutcome => ({
  ok: false,
  status,
  body: { error, ...extra },
});

export async function createInvitation(
  input: InvitationInput,
  { action, createdBy, origin }: InvitationContext,
): Promise<InvitationOutcome> {
  const {
    enterprise_name,
    brand_name = null,
    contact_person,
    contact_email,
    phone = null,
    client_id = null,
    category = null,
    state = null,
    personal_note = null,
    validity_days = 30,
    source = "manual",
  } = input;

  if (!enterprise_name?.trim()) {
    return failure(400, "Enterprise legal name is required.");
  }
  if (!contact_person?.trim()) {
    return failure(400, "Contact person is required.");
  }
  if (!contact_email?.trim() || !contact_email.includes("@")) {
    return failure(400, "Valid contact email is required.");
  }

  const validity = Number(validity_days) > 0 ? Number(validity_days) : 30;
  const cleanClientId = client_id && client_id !== "none" ? client_id : null;

  const slug = generatePartnerSlug(enterprise_name.trim());
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || origin;
  const invitation_url = `${siteUrl.replace(/\/+$/, "")}/invitation/${slug}`;

  const supabase = createAdminClient();

  let clientName: string | null = null;
  if (cleanClientId) {
    const { data: clientData } = await supabase
      .from("partner_clients")
      .select("name")
      .eq("id", cleanClientId)
      .maybeSingle();
    if (clientData?.name) clientName = clientData.name;
  }

  const emailData = generateInvitationEmail({
    enterprise_name: enterprise_name.trim(),
    contact_person: contact_person.trim(),
    invitation_url,
    client_name: clientName,
    personal_note: personal_note?.trim() || null,
    validity_days: validity,
  });

  if (action === "preview") {
    return {
      ok: true,
      kind: "preview",
      body: { preview_html: emailData.html, invitation_url, slug, subject: emailData.subject },
    };
  }

  const status = action === "send" ? "sent" : "pending";
  const nowIso = new Date().toISOString();
  const expiresAt = new Date(Date.now() + validity * 86400000).toISOString();

  const { data: supplier, error: supplierError } = await supabase
    .from("partner_suppliers")
    .insert({
      enterprise_name: enterprise_name.trim(),
      brand_name: brand_name?.trim() || null,
      contact_person: contact_person.trim(),
      contact_email: contact_email.trim().toLowerCase(),
      contact_phone: phone?.trim() || null,
      state: state || null,
      status: "active",
      source,
    })
    .select("id")
    .single();
  if (supplierError) {
    console.error("Error creating partner_supplier:", supplierError);
    return failure(500, `Failed to create partner supplier: ${supplierError.message}`);
  }
  const supplierId = supplier.id;

  if (cleanClientId) {
    const { error: linkError } = await supabase.from("partner_client_supplier_links").insert({
      client_id: cleanClientId,
      supplier_id: supplierId,
      assessment_status: "invited",
    });
    if (linkError) console.warn("Warning linking client to supplier:", linkError.message);
  }

  const { data: invitation, error: invitationError } = await supabase
    .from("partner_invitations")
    .insert({
      slug,
      supplier_id: supplierId,
      client_id: cleanClientId,
      enterprise_name: enterprise_name.trim(),
      brand_name: brand_name?.trim() || null,
      contact_person: contact_person.trim(),
      contact_email: contact_email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      state: state || null,
      category: category || null,
      personal_note: personal_note?.trim() || null,
      validity_days: validity,
      status,
      invitation_url,
      created_by: createdBy,
      sent_at: action === "send" ? nowIso : null,
      expires_at: expiresAt,
    })
    .select("id")
    .single();
  if (invitationError) {
    console.error("Error creating partner_invitation:", invitationError);
    return failure(500, `Failed to create partner invitation: ${invitationError.message}`);
  }
  const invitationId = invitation.id;

  let emailResult: Awaited<ReturnType<typeof sendInvitationEmail>> | null = null;
  if (action === "send") {
    emailResult = await sendInvitationEmail({
      to: contact_email.trim().toLowerCase(),
      contact_person: contact_person.trim(),
      enterprise_name: enterprise_name.trim(),
      invitation_url,
      client_name: clientName,
      personal_note: personal_note?.trim() || null,
      validity_days: validity,
      invitation_id: invitationId,
    });
    if (!emailResult.success) {
      console.error("Failed to send invitation email:", emailResult.error);
      return failure(500, `Invitation saved but email failed to send: ${emailResult.error}`, {
        invitation_url,
        slug,
        invitation_id: invitationId,
      });
    }
    if (emailResult.messageId) {
      await supabase
        .from("partner_invitations")
        .update({ provider_message_id: emailResult.messageId })
        .eq("id", invitationId);
    }
  }

  await supabase.from("assessment_pipeline").insert({
    supplier_id: supplierId,
    client_id: cleanClientId,
    status: "invited",
    days_in_status: 0,
    total_days: 0,
  });

  await supabase.from("audit_log").insert({
    user_id: createdBy,
    action: "create_invitation",
    entity_type: "partner_invitation",
    entity_id: invitationId,
    after_state: {
      slug,
      supplier_id: supplierId,
      client_id: cleanClientId,
      enterprise_name,
      contact_email,
      status,
      action,
    },
  });

  return {
    ok: true,
    kind: "created",
    body: {
      slug,
      invitation_url,
      status,
      supplier_id: supplierId,
      invitation_id: invitationId,
      email_sent: action === "send" ? (emailResult?.success ?? false) : false,
      message_id: emailResult?.messageId || null,
    },
  };
}
