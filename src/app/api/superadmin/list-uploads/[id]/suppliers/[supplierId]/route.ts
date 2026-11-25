import { badRequest, superadminId, unauthorized } from "@/lib/list-uploads/auth";
import { changeSupplier, SupplierChange } from "@/lib/list-uploads/review";

/** Edit one supplier's fields, or approve or reject it. */
export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/superadmin/list-uploads/[id]/suppliers/[supplierId]">,
) {
  const userId = await superadminId();
  if (!userId) return unauthorized();
  const { id, supplierId } = await ctx.params;

  const parsed = SupplierChange.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid request");

  const result = await changeSupplier(id, supplierId, parsed.data, userId);
  if (!result.ok) return Response.json({ error: result.error }, { status: result.status });
  return Response.json({ supplier: result.supplier });
}
