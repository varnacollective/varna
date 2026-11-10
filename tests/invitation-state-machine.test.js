const test = require("node:test");
const assert = require("node:assert");

// Copy of state machine logic from src/lib/invitation-state-machine.ts
const ALLOWED_TRANSITIONS = {
  pending: ["sent", "expired", "declined"],
  sent: ["delivered", "accepted", "bounced", "expired", "declined"],
  delivered: ["accepted", "bounced", "expired", "declined"],
  accepted: ["registration_completed", "expired", "declined"],
  registration_completed: [],
  expired: ["pending"],
  declined: ["pending"],
  bounced: ["pending"],
};

function canTransitionInvitation(from, to, hasAdminOverride = false) {
  if (from === to) return { allowed: true };
  const allowedNext = ALLOWED_TRANSITIONS[from] || [];
  if (allowedNext.includes(to)) return { allowed: true };
  if (hasAdminOverride) {
    if (from === "registration_completed") {
      return { allowed: false, reason: "Registration is completed and verified; cannot revert." };
    }
    return { allowed: true };
  }
  return { allowed: false, reason: `Invalid transition from ${from} to ${to}` };
}

function canTransitionPipeline(from, to, options = {}) {
  if (from === to) return { allowed: true };
  if (to === "completed" || to === "published") {
    if (options.hasMandatoryMissing) return { allowed: false, reason: "Outstanding mandatory items" };
    if (options.hasEvidencePending) return { allowed: false, reason: "Evidence verification pending" };
    if (!options.hasScoreApproval) return { allowed: false, reason: "Score approval required" };
  }
  return { allowed: true };
}

test("Invitation State Machine - happy path transitions", () => {
  assert.strictEqual(canTransitionInvitation("pending", "sent").allowed, true);
  assert.strictEqual(canTransitionInvitation("sent", "delivered").allowed, true);
  assert.strictEqual(canTransitionInvitation("delivered", "accepted").allowed, true);
  assert.strictEqual(canTransitionInvitation("accepted", "registration_completed").allowed, true);
});

test("Invitation State Machine - expiration and decline", () => {
  assert.strictEqual(canTransitionInvitation("pending", "expired").allowed, true);
  assert.strictEqual(canTransitionInvitation("sent", "declined").allowed, true);
  assert.strictEqual(canTransitionInvitation("delivered", "bounced").allowed, true);
});

test("Invitation State Machine - disallows backward transitions without override", () => {
  assert.strictEqual(canTransitionInvitation("delivered", "pending").allowed, false);
  assert.strictEqual(canTransitionInvitation("accepted", "sent").allowed, false);
  assert.strictEqual(canTransitionInvitation("registration_completed", "pending").allowed, false);
});

test("Invitation State Machine - admin override allows reopening expired or bounced", () => {
  assert.strictEqual(canTransitionInvitation("expired", "pending", true).allowed, true);
  assert.strictEqual(canTransitionInvitation("bounced", "pending", true).allowed, true);
  assert.strictEqual(canTransitionInvitation("registration_completed", "pending", true).allowed, false); // terminal
});

test("Assessment Pipeline - workflow gates block completion without mandatory items", () => {
  assert.strictEqual(canTransitionPipeline("awaiting_approval", "completed", { hasMandatoryMissing: true }).allowed, false);
  assert.strictEqual(canTransitionPipeline("awaiting_approval", "completed", { hasEvidencePending: true }).allowed, false);
  assert.strictEqual(canTransitionPipeline("awaiting_approval", "completed", { hasScoreApproval: false }).allowed, false);
  assert.strictEqual(canTransitionPipeline("awaiting_approval", "completed", { hasScoreApproval: true }).allowed, true);
});

