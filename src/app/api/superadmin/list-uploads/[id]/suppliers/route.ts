import { badRequest, superadminId, unauthorized } from "@/lib/list-uploads/auth";
import { BulkDecision, decideMany } from "@/lib/list-uploads/review";

/** Approve or reject many suppliers at once. */
export async function PATCH(request: Request, ctx: RouteContext<"/api/superadmin/list-uploads/[id]/suppliers">) {
  const userId = await superadminId();
  if (!userId) return unauthorized();
  const { id } = await ctx.params;

  const parsed = BulkDecision.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid request");

  return Response.json(await decideMany(id, parsed.data.ids, parsed.data.decision, userId));
}
