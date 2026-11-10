/**
 * lib/invitation-state-machine.ts
 *
 * Deterministic state machine governing partner invitation and assessment lifecycle transitions.
 */

export type InvitationStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "accepted"
  | "registration_completed"
  | "expired"
  | "declined"
  | "bounced";

const ALLOWED_TRANSITIONS: Record<InvitationStatus, InvitationStatus[]> = {
  pending: ["sent", "expired", "declined"],
  sent: ["delivered", "accepted", "bounced", "expired", "declined"],
  delivered: ["accepted", "bounced", "expired", "declined"],
  accepted: ["registration_completed", "expired", "declined"],
  registration_completed: [], // Terminal success status for invitation stage
  expired: ["pending"], // Can only be re-opened with explicit admin action
  declined: ["pending"], // Can only be re-opened with explicit admin override
  bounced: ["pending"], // Can be reset to pending after email correction
};

export function canTransitionInvitation(
  from: InvitationStatus,
  to: InvitationStatus,
  hasAdminOverride: boolean = false
): { allowed: boolean; reason?: string } {
  if (from === to) {
    return { allowed: true };
  }

  const allowedNext = ALLOWED_TRANSITIONS[from] || [];
  if (allowedNext.includes(to)) {
    return { allowed: true };
  }

  if (hasAdminOverride) {
    // Admin override allows re-opening or forcing transitions except from completed
    if (from === "registration_completed") {
      return {
        allowed: false,
        reason: "Registration is completed and verified; cannot revert to previous invitation status.",
      };
    }
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Invalid status transition from '${from}' to '${to}'. Allowed transitions: ${allowedNext.join(", ") || "none (terminal state)"}`,
  };
}

export type AssessmentPipelineStatus =
  | "not_started"
  | "invited"
  | "registered"
  | "in_progress"
  | "submitted"
  | "processing"
  | "action_required"
  | "under_verification"
  | "verification_complete"
  | "scoring_in_progress"
  | "awaiting_approval"
  | "completed"
  | "published";

const PIPELINE_ORDER: AssessmentPipelineStatus[] = [
  "not_started",
  "invited",
  "registered",
  "in_progress",
  "submitted",
  "processing",
  "action_required",
  "under_verification",
  "verification_complete",
  "scoring_in_progress",
  "awaiting_approval",
  "completed",
  "published",
];

export function canTransitionPipeline(
  from: AssessmentPipelineStatus,
  to: AssessmentPipelineStatus,
  options: {
    hasMandatoryMissing?: boolean;
    hasEvidencePending?: boolean;
    hasScoreApproval?: boolean;
    overrideReason?: string;
  } = {}
): { allowed: boolean; reason?: string } {
  if (from === to) return { allowed: true };

  // Workflow gates per PRD:
  // Cannot mark Completed or Published while mandatory info, evidence verification, or score approval is outstanding
  if (to === "completed" || to === "published") {
    if (options.hasMandatoryMissing) {
      return { allowed: false, reason: "Workflow gate: Outstanding mandatory information must be resolved." };
    }
    if (options.hasEvidencePending) {
      return { allowed: false, reason: "Workflow gate: Evidence verification is pending." };
    }
    if (!options.hasScoreApproval) {
      return { allowed: false, reason: "Workflow gate: Score sign-off and approval is required before completion/publication." };
    }
  }

  const fromIdx = PIPELINE_ORDER.indexOf(from);
  const toIdx = PIPELINE_ORDER.indexOf(to);

  if (toIdx === fromIdx + 1 || to === "action_required") {
    return { allowed: true };
  }

  // Returning to in_progress from action_required or submitted
  if (from === "action_required" && (to === "in_progress" || to === "submitted")) {
    return { allowed: true };
  }

  if (options.overrideReason && options.overrideReason.trim().length >= 10) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Non-sequential pipeline transition from '${from}' to '${to}' requires a typed reason (minimum 10 characters).`,
  };
}

