import { describe, expect, it } from "vitest";
import { canOpen, homePath, sessionFromClaims, type SessionPayload } from "@/lib/auth/claims";

// Synthetic accounts only.
const claims = (app_metadata: unknown) => ({ sub: "00000000-0000-0000-0000-000000000001", app_metadata });

describe("sessionFromClaims", () => {
  it("builds a hotel session", () => {
    expect(sessionFromClaims(claims({ role: "client", client_id: "CLT-900", client_name: "Test Hotel", parent_group: "Test Group" }))).toEqual({
      userId: "CLT-900",
      clientId: "CLT-900",
      clientName: "Test Hotel",
      parentGroup: "Test Group",
      role: "client",
      isGroup: false,
    });
  });

  it("marks a group session", () => {
    const s = sessionFromClaims(claims({ role: "group", client_id: "GRP-900", parent_group: "Test Group" }));
    expect(s?.isGroup).toBe(true);
    expect(s?.clientName).toBe("GRP-900");
  });

  it("builds a superadmin session with no group", () => {
    const s = sessionFromClaims(claims({ role: "superadmin", client_id: "superadmin" }));
    expect(s).toMatchObject({ role: "superadmin", parentGroup: null, isGroup: false });
  });

  it.each([
    ["no app_metadata", { sub: "x" }],
    ["no role", claims({ client_id: "CLT-900" })],
    ["unknown role", claims({ role: "admin", client_id: "CLT-900" })],
    ["empty client id", claims({ role: "client", client_id: "  " })],
    ["no subject", { app_metadata: { role: "client", client_id: "CLT-900" } }],
    ["not an object", null],
  ])("refuses an account with %s", (_label, input) => {
    expect(sessionFromClaims(input)).toBeNull();
  });
});

describe("homePath", () => {
  it("sends each role home", () => {
    expect(homePath("superadmin")).toBe("/superadmin");
    expect(homePath("group")).toBe("/group-dashboard");
    expect(homePath("client")).toBe("/dashboard");
  });
});

describe("canOpen", () => {
  const as = (role: SessionPayload["role"]): SessionPayload => ({
    userId: "u", clientId: "u", clientName: "u", parentGroup: null, role, isGroup: role === "group",
  });

  it("keeps superadmin pages for superadmins", () => {
    expect(canOpen("/superadmin/orders", as("superadmin"))).toBe(true);
    expect(canOpen("/superadmin", as("group"))).toBe(false);
    expect(canOpen("/superadmin", as("client"))).toBe(false);
    expect(canOpen("/superadmin", null)).toBe(false);
  });

  it("keeps group pages for groups and superadmins", () => {
    expect(canOpen("/group-dashboard", as("group"))).toBe(true);
    expect(canOpen("/group/reports", as("superadmin"))).toBe(true);
    expect(canOpen("/group-dashboard", as("client"))).toBe(false);
    expect(canOpen("/group", null)).toBe(false);
  });

  it("needs any session for hotel pages", () => {
    expect(canOpen("/dashboard", as("client"))).toBe(true);
    expect(canOpen("/dashboard/orders", null)).toBe(false);
  });

  it("leaves other paths open", () => {
    expect(canOpen("/", null)).toBe(true);
    expect(canOpen("/assessment/abc", null)).toBe(true);
  });
});
