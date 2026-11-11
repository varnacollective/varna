import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/utils/supabase/admin";
import { generatePartnerSlug } from "@/lib/slug";
import { generateInvitationEmail } from "@/lib/email/invitation-template";
import { sendInvitationEmail } from "@/lib/email/send-email";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized. Superadmin role required." }, { status: 401 });
    }

    const supabase = createAdminClient();
    const [clientsRes, categoriesRes] = await Promise.all([
      supabase.from("partner_clients").select("id, name").order("name"),
      supabase.from("category_master").select("id, name").eq("is_active", true).order("name"),
    ]);

    return NextResponse.json({
      clients: clientsRes.data || [],
      categories: categoriesRes.data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ clients: [], categories: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const session = await getSession();
    if (!session || session.role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized. Superadmin role required." }, { status: 401 });
    }

    const body = await request.json();
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
      action = "send", // 'send' | 'preview' | 'save'
    } = body;

    // 2. Validate required fields
    if (!enterprise_name?.trim()) {
      return NextResponse.json({ error: "Enterprise legal name is required." }, { status: 400 });
    }
    if (!contact_person?.trim()) {
      return NextResponse.json({ error: "Contact person is required." }, { status: 400 });
    }
    if (!contact_email?.trim() || !contact_email.includes("@")) {
      return NextResponse.json({ error: "Valid contact email is required." }, { status: 400 });
    }

    const validity = Number(validity_days) > 0 ? Number(validity_days) : 30;
    const cleanClientId = client_id && client_id !== "none" ? client_id : null;

    // 3. Generate partner slug & invitation URL
    const slug = generatePartnerSlug(enterprise_name.trim());
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      request.nextUrl.origin;
    const invitation_url = `${siteUrl.replace(/\/+$/, "")}/invitation/${slug}`;

    // Admin DB client
    const supabase = createAdminClient();

    // If client_id is given, retrieve client name for email personalization
    let clientName: string | null = null;
    if (cleanClientId) {
      const { data: clientData } = await supabase
        .from("partner_clients")
        .select("name")
        .eq("id", cleanClientId)
        .maybeSingle();
      if (clientData?.name) {
        clientName = clientData.name;
      }
    }

    // Generate email content
    const emailData = generateInvitationEmail({
      enterprise_name: enterprise_name.trim(),
      contact_person: contact_person.trim(),
      invitation_url,
      client_name: clientName,
      personal_note: personal_note?.trim() || null,
      validity_days: validity,
    });

    // 4. If action === 'preview': return preview without committing to DB
    if (action === "preview") {
      return NextResponse.json({
        preview_html: emailData.html,
        invitation_url,
        slug,
        subject: emailData.subject,
      });
    }

    // 5. If action === 'send' or 'save': Commit to database
    const status = action === "send" ? "sent" : "pending";
    const nowIso = new Date().toISOString();
    const expiresAt = new Date(Date.now() + validity * 86400000).toISOString();

    // A. Insert into partner_suppliers
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
        source: "manual",
      })
      .select("id")
      .single();

    if (supplierError) {
      console.error("Error creating partner_supplier:", supplierError);
      return NextResponse.json(
        { error: `Failed to create partner supplier: ${supplierError.message}` },
        { status: 500 }
      );
    }

    const supplierId = supplier.id;

    // B. If client_id provided, link client and supplier
    if (cleanClientId) {
      const { error: linkError } = await supabase
        .from("partner_client_supplier_links")
        .insert({
          client_id: cleanClientId,
          supplier_id: supplierId,
          assessment_status: "invited",
        });

      if (linkError) {
        console.warn("Warning linking client to supplier:", linkError.message);
      }
    }

    // C. Insert into partner_invitations
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
        created_by: session.userId || "superadmin",
        sent_at: action === "send" ? nowIso : null,
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (invitationError) {
      console.error("Error creating partner_invitation:", invitationError);
      return NextResponse.json(
        { error: `Failed to create partner invitation: ${invitationError.message}` },
        { status: 500 }
      );
    }

    const invitationId = invitation.id;

    // D. If action === 'send', dispatch email via SMTP
    let emailResult = null;
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
        return NextResponse.json(
          {
            error: `Invitation saved but email failed to send: ${emailResult.error}`,
            invitation_url,
            slug,
            invitation_id: invitationId,
          },
          { status: 500 }
        );
      }

      // Update provider_message_id on partner_invitations
      if (emailResult.messageId) {
        await supabase
          .from("partner_invitations")
          .update({ provider_message_id: emailResult.messageId })
          .eq("id", invitationId);
      }
    }

    // E. Insert into assessment_pipeline
    await supabase.from("assessment_pipeline").insert({
      supplier_id: supplierId,
      client_id: cleanClientId,
      status: "invited",
      days_in_status: 0,
      total_days: 0,
    });

    // F. Insert into audit_log
    await supabase.from("audit_log").insert({
      user_id: session.userId || "superadmin",
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

    return NextResponse.json({
      success: true,
      slug,
      invitation_url,
      status,
      supplier_id: supplierId,
      invitation_id: invitationId,
      email_sent: action === "send" ? (emailResult?.success ?? false) : false,
      message_id: emailResult?.messageId || null,
    });
  } catch (err: any) {
    console.error("Unexpected error in /api/superadmin/invite-partner:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
