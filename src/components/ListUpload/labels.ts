import type { ReviewSupplier } from "@/lib/list-uploads/types";

/** What the reviewer sees for a supplier: its state and pill style. */

export type View = "ready" | "needs_attention" | "missing_contact" | "approved" | "rejected" | "invited";

type ViewInfo = { view: View; label: string; pill: string };

const VIEW_INFO: Record<View, ViewInfo> = {
  ready: { view: "ready", label: "Ready", pill: "sa-pill-active" },
  needs_attention: { view: "needs_attention", label: "Needs attention", pill: "sa-pill-pending" },
  missing_contact: { view: "missing_contact", label: "Missing email", pill: "sa-pill-declined" },
  approved: { view: "approved", label: "Approved", pill: "sa-pill-verified" },
  rejected: { view: "rejected", label: "Rejected", pill: "sa-pill-draft" },
  invited: { view: "invited", label: "Invited", pill: "sa-pill-sent" },
};

/** Every view, in the order the filters show them. */
export const VIEWS: ViewInfo[] = Object.values(VIEW_INFO);

export function viewOf(s: Pick<ReviewSupplier, "invitation_id" | "decision" | "check_status">): View {
  if (s.invitation_id) return "invited";
  if (s.decision !== "pending") return s.decision;
  return s.check_status;
}

export function viewInfo(view: View): ViewInfo {
  return VIEW_INFO[view];
}

export const FIELD_LABELS = {
  company_name: "Company",
  contact_name: "Contact name",
  email: "Email",
  phone: "Phone",
  city: "City",
  state: "State",
  category: "Category",
} as const;
