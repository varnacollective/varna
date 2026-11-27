import { z } from "zod/v4";
import { createInvitation } from "@/lib/invitations/create-invitation";
import { badRequest, superadminId, unauthorized } from "@/lib/list-uploads/auth";
import { getUpload, getReviewSupplier } from "@/lib/list-uploads/queries";
import { greetingName } from "@/lib/list-uploads/review-row";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Preview or send the invitation for one approved supplier. One per request:
 * the page sends them one after another, within the email limit.
 */

const Body = z.strictObject({
  supplierId: z.uuid(),
  action: z.enum(["preview", "send"]),
});

export async function POST(request: Request, ctx: RouteContext<"/api/superadmin/list-uploads/[id]/invite">) {
  const userId = await superadminId();
  if (!userId) return unauthorized();
  const { id } = await ctx.params;

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid request");
  const { supplierId, action } = parsed.data;

  const [upload, supplier] = await Promise.all([getUpload(id), getReviewSupplier(id, supplierId)]);
  if (!upload || !supplier) return Response.json({ error: "Supplier not found." }, { status: 404 });
  if (supplier.decision !== "approved") return badRequest("Approve the supplier first.");
  if (supplier.invitation_id) return Response.json({ error: "Already invited." }, { status: 409 });
  if (!supplier.company_name || !supplier.email) return badRequest("A company name and email are needed.");

  const outcome = await createInvitation(
    {
      enterprise_name: supplier.company_name,
      brand_name: supplier.brand_name,
      contact_person: greetingName(supplier),
      contact_email: supplier.email,
      phone: supplier.phone,
      state: supplier.state,
      client_id: upload.clientId,
      source: "bulk_upload",
    },
    { action, createdBy: userId, origin: new URL(request.url).origin },
  );

  // Keep the link even when only the email failed, so it is never invited twice.
  const invitationId = outcome.ok
    ? outcome.kind === "created" ? outcome.body.invitation_id : null
    : typeof outcome.body.invitation_id === "string" ? outcome.body.invitation_id : null;
  if (invitationId) {
    await createAdminClient()
      .from("list_upload_suppliers")
      .update({
        invitation_id: invitationId,
        partner_supplier_id: outcome.ok && outcome.kind === "created" ? outcome.body.supplier_id : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", supplierId);
  }

  if (!outcome.ok) return Response.json(outcome.body, { status: outcome.status });
  return Response.json(outcome.body);
}
