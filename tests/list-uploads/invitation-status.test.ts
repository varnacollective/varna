import { describe, expect, it } from "vitest";
import { pillOf } from "@/components/ListUpload/labels";
import { invitationStatus } from "@/lib/invitations/status";

describe("invitation status, shown the same on every page", () => {
  it("names each status as the Invitations page does", () => {
    expect(invitationStatus("accepted")).toEqual({ label: "Accepted", pill: "sa-pill-active" });
    expect(invitationStatus("registration_completed").label).toBe("Accepted");
    expect(invitationStatus("sent").label).toBe("Sent");
    expect(invitationStatus("delivered").label).toBe("Sent");
    expect(invitationStatus("pending").label).toBe("Pending");
    expect(invitationStatus("expired").label).toBe("Expired");
    expect(invitationStatus("bounced").label).toBe("Bounced");
    expect(invitationStatus(null).label).toBe("Invited");
  });

  it("shows an invited supplier's real invitation status, not just 'Invited'", () => {
    const base = { decision: "approved", check_status: "ready" } as const;
    expect(pillOf({ ...base, invitation_id: "i1", invitation: { status: "accepted" } }).label).toBe("Accepted");
    expect(pillOf({ ...base, invitation_id: "i1", invitation: { status: "sent" } }).label).toBe("Sent");
    expect(pillOf({ ...base, invitation_id: null, invitation: null }).label).toBe("Approved");
  });
});
