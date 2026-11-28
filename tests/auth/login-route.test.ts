import { beforeEach, describe, expect, it, vi } from "vitest";

// Synthetic accounts only.
const signInWithPassword = vi.fn();
const signOut = vi.fn(() => Promise.resolve({ error: null }));
vi.mock("@/utils/supabase/server", () => ({
  createClient: () => Promise.resolve({ auth: { signInWithPassword, signOut } }),
}));

const { POST } = await import("@/app/api/auth/route");

function post(body: unknown): Request {
  return new Request("http://localhost/api/auth", { method: "POST", body: JSON.stringify(body) });
}

describe("POST /api/auth", () => {
  beforeEach(() => {
    signInWithPassword.mockReset();
    signOut.mockClear();
  });

  it("signs in a hotel and sends it to its dashboard", async () => {
    signInWithPassword.mockResolvedValue({
      data: { user: { id: "u1", app_metadata: { role: "client", client_id: "CLT-900" } } },
      error: null,
    });
    const res = await POST(post({ email: " Hotel@Example.test ", password: "secret1" }));
    expect(signInWithPassword).toHaveBeenCalledWith({ email: "hotel@example.test", password: "secret1" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, isSuperAdmin: false, isGroup: false, redirectUrl: "/dashboard" });
  });

  it("sends a superadmin to the superadmin area", async () => {
    signInWithPassword.mockResolvedValue({
      data: { user: { id: "u2", app_metadata: { role: "superadmin", client_id: "superadmin" } } },
      error: null,
    });
    const res = await POST(post({ email: "admin@example.test", password: "secret1" }));
    expect(await res.json()).toMatchObject({ isSuperAdmin: true, redirectUrl: "/superadmin" });
  });

  it("refuses a wrong password with a generic message", async () => {
    signInWithPassword.mockResolvedValue({ data: { user: null }, error: { message: "Invalid login credentials" } });
    const res = await POST(post({ email: "hotel@example.test", password: "wrong1" }));
    expect(res.status).toBe(401);
    expect(((await res.json()) as { error: string }).error).toBe("Invalid email or password. Please check and try again.");
  });

  it("signs out and refuses an account with no Varna role", async () => {
    signInWithPassword.mockResolvedValue({ data: { user: { id: "u3", app_metadata: {} } }, error: null });
    const res = await POST(post({ email: "x@example.test", password: "secret1" }));
    expect(res.status).toBe(403);
    expect(signOut).toHaveBeenCalled();
  });

  it.each([
    ["no body", undefined],
    ["a bad email", { email: "nope", password: "secret1" }],
    ["no password", { email: "a@example.test", password: "" }],
  ])("rejects %s without calling Supabase", async (_label, body) => {
    const res = await POST(post(body));
    expect(res.status).toBe(400);
    expect(signInWithPassword).not.toHaveBeenCalled();
  });
});
