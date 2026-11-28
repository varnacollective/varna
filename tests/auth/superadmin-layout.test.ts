import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionPayload } from "@/lib/session";

const getSession = vi.fn<() => Promise<SessionPayload | null>>();
const redirect = vi.fn((url: string): never => {
  throw new Error(`redirect:${url}`);
});

vi.mock("@/lib/session", () => ({ getSession }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/app/superadmin/SuperAdminClientLayout", () => ({ default: () => null }));
vi.mock("@/app/superadmin/sa-styles.css", () => ({}));

const { default: SuperAdminLayout } = await import("@/app/superadmin/layout");

function session(role: SessionPayload["role"]): SessionPayload {
  return { userId: "u", clientId: "u", clientName: "Test", parentGroup: null, role, isGroup: role === "group" };
}

describe("superadmin layout", () => {
  beforeEach(() => {
    getSession.mockReset();
    redirect.mockClear();
  });

  it("lets a superadmin session in", async () => {
    getSession.mockResolvedValue(session("superadmin"));
    await expect(SuperAdminLayout({ children: null })).resolves.toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });

  it.each(["client", "group"] as const)("sends a %s session to the login page", async (role) => {
    getSession.mockResolvedValue(session(role));
    await expect(SuperAdminLayout({ children: null })).rejects.toThrow("redirect:/");
  });

  it("sends a visitor with no session to the login page", async () => {
    getSession.mockResolvedValue(null);
    await expect(SuperAdminLayout({ children: null })).rejects.toThrow("redirect:/");
  });
});
