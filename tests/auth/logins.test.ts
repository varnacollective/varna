import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createLogin, listLogins, NewLogin, toLogin } from "@/lib/auth/logins";

// Synthetic accounts only.
function user(id: string, app_metadata: Record<string, unknown>, created_at = "2026-01-01T00:00:00Z"): User {
  const u: User = { id, email: `${id}@example.test`, app_metadata, user_metadata: {}, aud: "authenticated", created_at };
  return u;
}

function fakeAdmin(opts: {
  hotel?: { client_id: string; client_name: string | null; parent_group: string | null } | null;
  createError?: { status: number; message: string };
  pages?: User[][];
}) {
  const createUser = vi.fn((attrs: { email: string; app_metadata: Record<string, unknown> }) =>
    Promise.resolve(opts.createError
      ? { data: { user: null }, error: opts.createError }
      : { data: { user: user("new", attrs.app_metadata) }, error: null }));
  const listUsers = vi.fn(({ page }: { page: number }) => Promise.resolve({ data: { users: opts.pages?.[page - 1] ?? [] }, error: null }));
  const eq = vi.fn(() => ({ maybeSingle: () => Promise.resolve({ data: opts.hotel ?? null, error: null }) }));
  const admin = {
    auth: { admin: { createUser, listUsers } },
    from: () => ({ select: () => ({ eq }) }),
  } as unknown as SupabaseClient;
  return { admin, createUser, listUsers, eq };
}

describe("NewLogin", () => {
  it("accepts a hotel login", () => {
    expect(NewLogin.safeParse({ role: "client", email: "a@example.test", password: "secret1", clientId: "CLT-900" }).success).toBe(true);
  });

  it.each([
    ["a short password", { role: "client", email: "a@example.test", password: "123", clientId: "CLT-900" }],
    ["a bad email", { role: "client", email: "nope", password: "secret1", clientId: "CLT-900" }],
    ["a superadmin role", { role: "superadmin", email: "a@example.test", password: "secret1", clientId: "x" }],
    ["a group without a name", { role: "group", email: "a@example.test", password: "secret1", clientId: "GRP-9" }],
    ["extra fields", { role: "client", email: "a@example.test", password: "secret1", clientId: "CLT-900", admin: true }],
  ])("refuses %s", (_label, input) => {
    expect(NewLogin.safeParse(input).success).toBe(false);
  });
});

describe("createLogin", () => {
  it("links a hotel login to the hotel's record", async () => {
    const { admin, createUser, eq } = fakeAdmin({ hotel: { client_id: "CLT-900", client_name: "Test Hotel", parent_group: "Test Group" } });
    const result = await createLogin(admin, NewLogin.parse({ role: "client", email: " A@Example.test ", password: "secret1", clientId: "clt-900" }));
    expect(eq).toHaveBeenCalledWith("client_id", "CLT-900");
    expect(createUser).toHaveBeenCalledWith({
      email: "a@example.test",
      password: "secret1",
      email_confirm: true,
      app_metadata: { role: "client", client_id: "CLT-900", client_name: "Test Hotel", parent_group: "Test Group" },
    });
    expect(result).toMatchObject({ ok: true, login: { role: "client", clientId: "CLT-900", clientName: "Test Hotel" } });
  });

  it("refuses an unknown hotel without creating a login", async () => {
    const { admin, createUser } = fakeAdmin({ hotel: null });
    const result = await createLogin(admin, { role: "client", email: "a@example.test", password: "secret1", clientId: "CLT-999" });
    expect(result).toEqual({ ok: false, status: 400, error: "No hotel with client ID CLT-999." });
    expect(createUser).not.toHaveBeenCalled();
  });

  it("creates a group login with its group name", async () => {
    const { admin, createUser } = fakeAdmin({});
    await createLogin(admin, { role: "group", email: "g@example.test", password: "secret1", clientId: "grp-9", groupName: "Test Group" });
    expect(createUser.mock.calls[0]?.[0].app_metadata).toEqual({
      role: "group", client_id: "GRP-9", client_name: "Test Group", parent_group: "Test Group",
    });
  });

  it("reports an email that is already used", async () => {
    const { admin } = fakeAdmin({ hotel: { client_id: "CLT-900", client_name: null, parent_group: null }, createError: { status: 422, message: "User already registered" } });
    const result = await createLogin(admin, { role: "client", email: "a@example.test", password: "secret1", clientId: "CLT-900" });
    expect(result).toEqual({ ok: false, status: 409, error: "A login with this email already exists." });
  });
});

describe("listLogins", () => {
  it("lists every login newest first and flags accounts that are not set up", async () => {
    const { admin } = fakeAdmin({
      pages: [[
        user("old", { role: "client", client_id: "CLT-900" }, "2026-01-01T00:00:00Z"),
        user("new", {}, "2026-02-01T00:00:00Z"),
      ]],
    });
    const logins = await listLogins(admin);
    expect(logins.map((l) => l.id)).toEqual(["new", "old"]);
    expect(logins[0]?.role).toBeNull();
  });
});

describe("toLogin", () => {
  it("never exposes anything beyond the listed fields", () => {
    expect(Object.keys(toLogin(user("u", { role: "group", client_id: "GRP-9", parent_group: "G" }))).sort()).toEqual(
      ["clientId", "clientName", "createdAt", "email", "id", "lastSignInAt", "parentGroup", "role"]
    );
  });
});
