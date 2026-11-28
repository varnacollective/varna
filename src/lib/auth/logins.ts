import "server-only";
import { z } from "zod";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { sessionFromClaims, type SessionRole } from "./claims";

/** A Supabase Auth login as the Credentials screen shows it. */
export interface Login {
  id: string;
  email: string;
  role: SessionRole | null;
  clientId: string | null;
  clientName: string | null;
  parentGroup: string | null;
  createdAt: string;
  lastSignInAt: string | null;
}

/** A new hotel or group login. Superadmin logins are made in Supabase only. */
export const NewLogin = z.discriminatedUnion("role", [
  z.strictObject({
    role: z.literal("client"),
    email: z.string().trim().toLowerCase().pipe(z.email().max(320)),
    password: z.string().min(6).max(128),
    clientId: z.string().trim().min(1).max(64),
  }),
  z.strictObject({
    role: z.literal("group"),
    email: z.string().trim().toLowerCase().pipe(z.email().max(320)),
    password: z.string().min(6).max(128),
    clientId: z.string().trim().min(1).max(64),
    groupName: z.string().trim().min(1).max(200),
  }),
]);
export type NewLogin = z.infer<typeof NewLogin>;

export type CreateLoginResult =
  | { ok: true; login: Login }
  | { ok: false; status: 400 | 409 | 500; error: string };

export function toLogin(user: User): Login {
  const session = sessionFromClaims({ sub: user.id, app_metadata: user.app_metadata });
  return {
    id: user.id,
    email: user.email ?? "",
    role: session?.role ?? null,
    clientId: session?.clientId ?? null,
    clientName: session?.clientName ?? null,
    parentGroup: session?.parentGroup ?? null,
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at ?? null,
  };
}

const PAGE_SIZE = 1000;

/** Every login, newest first. */
export async function listLogins(admin: SupabaseClient): Promise<Login[]> {
  const users: User[] = [];
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: PAGE_SIZE });
    if (error) throw new Error(`Could not list logins: ${error.message}`);
    users.push(...data.users);
    if (data.users.length < PAGE_SIZE) break;
  }
  return users.map(toLogin).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

interface HotelRow {
  client_id: string;
  client_name: string | null;
  parent_group: string | null;
}

/**
 * Creates a login linked to an existing hotel (name and group come from
 * client_master) or to a group. The role and client go in app_metadata,
 * which only the service role can change.
 */
export async function createLogin(admin: SupabaseClient, input: NewLogin): Promise<CreateLoginResult> {
  const clientId = input.clientId.toUpperCase();
  let appMetadata: { role: SessionRole; client_id: string; client_name: string; parent_group: string | null };

  if (input.role === "client") {
    const { data: hotel, error } = await admin
      .from("client_master")
      .select("client_id, client_name, parent_group")
      .eq("client_id", clientId)
      .maybeSingle<HotelRow>();
    if (error) return { ok: false, status: 500, error: "Could not check the hotel. Please try again." };
    if (!hotel) return { ok: false, status: 400, error: `No hotel with client ID ${clientId}.` };
    appMetadata = {
      role: "client",
      client_id: hotel.client_id,
      client_name: hotel.client_name ?? hotel.client_id,
      parent_group: hotel.parent_group,
    };
  } else {
    appMetadata = { role: "group", client_id: clientId, client_name: input.groupName, parent_group: input.groupName };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    app_metadata: appMetadata,
  });
  if (error) {
    const taken = error.status === 422 || /already/i.test(error.message);
    return taken
      ? { ok: false, status: 409, error: "A login with this email already exists." }
      : { ok: false, status: 500, error: "Could not create the login. Please try again." };
  }
  return { ok: true, login: toLogin(data.user) };
}
