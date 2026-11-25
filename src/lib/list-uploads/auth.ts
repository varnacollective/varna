import "server-only";
import { getSession } from "@/lib/session";

/** The signed-in superadmin's id, or null if the caller is not a superadmin. */
export async function superadminId(): Promise<string | null> {
  const session = await getSession();
  if (!session || session.role !== "superadmin") return null;
  return session.userId || "superadmin";
}

export function unauthorized(): Response {
  return Response.json({ error: "Superadmin sign-in required." }, { status: 401 });
}

export function badRequest(error: string): Response {
  return Response.json({ error }, { status: 400 });
}
