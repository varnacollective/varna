import type { ReviewSupplier } from "@/lib/list-uploads/types";

/** What the reviewer sees for a supplier: its state and pill style. */

export type View = "ready" | "needs_attention" | "missing_contact" | "approved" | "rejected" | "invited";

export const VIEWS: { view: View; label: string; pill: string }[] = [
  { view: "ready", label: "Ready", pill: "sa-pill-active" },
  { view: "needs_attention", label: "Needs attention", pill: "sa-pill-pending" },
  { view: "missing_contact", label: "Missing email", pill: "sa-pill-declined" },
  { view: "approved", label: "Approved", pill: "sa-pill-verified" },
  { view: "rejected", label: "Rejected", pill: "sa-pill-draft" },
  { view: "invited", label: "Invited", pill: "sa-pill-sent" },
];

export function viewOf(s: Pick<ReviewSupplier, "invitation_id" | "decision" | "check_status">): View {
  if (s.invitation_id) return "invited";
  if (s.decision !== "pending") return s.decision;
  return s.check_status;
}

export function viewInfo(view: View) {
  return VIEWS.find((v) => v.view === view) ?? VIEWS[0];
}

export const FIELD_LABELS = {
  company_name: "Company",
  contact_name: "Contact name",
  email: "Email",
  phone: "Phone",
  city: "City",
  state: "State",
} as const;
