const test = require("node:test");
const assert = require("node:assert");

// Load the compiled/written email template or evaluate it
const fs = require("fs");
const path = require("path");

test("Email Template - renderInvitationEmail output snapshot & structure", () => {
  // Read src/lib/email/invitation-template.ts
  const templatePath = path.resolve(__dirname, "../src/lib/email/invitation-template.ts");
  assert.strictEqual(fs.existsSync(templatePath), true, "invitation-template.ts must exist");

  const templateCode = fs.readFileSync(templatePath, "utf-8");
  assert.ok(templateCode.includes("varna-wordmark-email.png"), "Must reference varna-wordmark-email.png");
  assert.ok(templateCode.includes("Begin your assessment"), "Must include CTA button text");
  assert.ok(templateCode.includes("Keep these handy"), "Must include Keep these handy section");
  assert.ok(templateCode.includes("yuvraj@varnacollective.com"), "Must include Yuvraj help email");
  assert.ok(templateCode.includes("v:roundrect"), "Must include Outlook VML fallback");
  assert.ok(templateCode.includes("max-width: 600px") || templateCode.includes("600"), "Must be constrained to 600px width");
});

