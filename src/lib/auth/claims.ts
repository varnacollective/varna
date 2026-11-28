import { z } from "zod";

/**
 * Who a signed-in user is, as the app sees it. Built only from verified
 * Supabase Auth claims; `app_metadata` can be set only with the service role,
 * so users cannot change their own role or client.
 */
export type SessionRole = "superadmin" | "client" | "group";

export interface SessionPayload {
  /** Same as clientId (e.g. "superadmin", "CLT-001", "GRP-001"). */
  userId: string;
  clientId: string;
  clientName: string;
  parentGroup: string | null;
  role: SessionRole;
  isGroup: boolean;
}

const AppMetadata = z.object({
  role: z.enum(["superadmin", "client", "group"]),
  client_id: z.string().trim().min(1),
  client_name: z.string().trim().min(1).optional(),
  parent_group: z.string().trim().min(1).nullable().optional(),
});

const Claims = z.object({
  sub: z.string().min(1),
  app_metadata: AppMetadata,
});

/** The session for verified claims, or null if the account is not set up. */
export function sessionFromClaims(claims: unknown): SessionPayload | null {
  const parsed = Claims.safeParse(claims);
  if (!parsed.success) return null;
  const { role, client_id, client_name, parent_group } = parsed.data.app_metadata;
  return {
    userId: client_id,
    clientId: client_id,
    clientName: client_name ?? client_id,
    parentGroup: parent_group ?? null,
    role,
    isGroup: role === "group",
  };
}

/** Where each role lands after signing in. */
export function homePath(role: SessionRole): string {
  switch (role) {
    case "superadmin":
      return "/superadmin";
    case "group":
      return "/group-dashboard";
    case "client":
      return "/dashboard";
  }
}

/** Whether a role may open a protected path (the proxy's rules). */
export function canOpen(pathname: string, session: SessionPayload | null): boolean {
  if (pathname.startsWith("/superadmin")) return session?.role === "superadmin";
  if (pathname.startsWith("/group")) return session?.role === "group" || session?.role === "superadmin";
  if (pathname.startsWith("/dashboard")) return session !== null;
  return true;
}
