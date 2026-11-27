import { addSupplier } from "@/lib/list-uploads/add-supplier";
import { badRequest, superadminId, unauthorized } from "@/lib/list-uploads/auth";
import { missingHotel } from "@/lib/list-uploads/hotel-check";
import { ManualSupplier } from "@/lib/list-uploads/manual";

/** Add one supplier by hand, for a hotel or No hotel. It is then reviewed and invited like a supplier from a list. */
export async function POST(request: Request) {
  const userId = await superadminId();
  if (!userId) return unauthorized();

  const parsed = ManualSupplier.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid request");

  const missing = await missingHotel(parsed.data.clientId);
  if (missing) return missing;

  try {
    return Response.json(await addSupplier(parsed.data, userId));
  } catch (caught) {
    return Response.json({ error: caught instanceof Error ? caught.message : "The supplier could not be saved." }, { status: 500 });
  }
}
