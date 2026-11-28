/**
 * How an invitation's status is shown, everywhere it is shown (Invitations,
 * Supplier Lists), so both always say the same. The status itself lives
 * only in partner_invitations.
 */
export interface InvitationStatusInfo {
  label: string;
  pill: string;
}

export function invitationStatus(status: string | null | undefined): InvitationStatusInfo {
  switch ((status ?? "").toLowerCase()) {
    case "accepted":
    case "registration_completed":
      return { label: "Accepted", pill: "sa-pill-active" };
    case "sent":
    case "delivered":
      return { label: "Sent", pill: "sa-pill-sent" };
    case "pending":
      return { label: "Pending", pill: "sa-pill-pending" };
    case "expired":
      return { label: "Expired", pill: "sa-pill-expired" };
    case "declined":
      return { label: "Declined", pill: "sa-pill-declined" };
    case "bounced":
      return { label: "Bounced", pill: "sa-pill-declined" };
    default:
      return { label: status || "Invited", pill: "sa-pill-draft" };
  }
}
