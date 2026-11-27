import { describe, expect, it } from "vitest";
import { checkEmails, deobfuscateEmails } from "@/agents/list/core/emails";

describe("checkEmails", () => {
  it("lowercases a single valid email", () => {
    const result = checkEmails("Ravi.Kumar@Example.COM");
    expect(result.emails).toEqual(["ravi.kumar@example.com"]);
    expect(result.flags).toEqual([]);
  });

  it("splits several emails in one cell, whatever the separator", () => {
    const result = checkEmails(
      "a@example.com, b@example.com; c@example.com / d@example.com\ne@example.com",
    );
    expect(result.emails).toEqual([
      "a@example.com",
      "b@example.com",
      "c@example.com",
      "d@example.com",
      "e@example.com",
    ]);
  });

  it("reads emails from several cells", () => {
    const result = checkEmails(["a@example.com", "b@example.com"]);
    expect(result.emails).toEqual(["a@example.com", "b@example.com"]);
  });

  it("removes duplicates within a cell, keeping first-seen order", () => {
    const result = checkEmails("b@example.com, A@example.com, a@example.com");
    expect(result.emails).toEqual(["b@example.com", "a@example.com"]);
  });

  it("strips wrapping punctuation, mailto and labels", () => {
    const result = checkEmails(
      'Email: <owner@example.com>, "sales@example.in". mailto:ops@example.org',
    );
    expect(result.emails).toEqual([
      "owner@example.com",
      "sales@example.in",
      "ops@example.org",
    ]);
  });

  it("decodes obfuscated emails", () => {
    expect(checkEmails("ravi [at] example [dot] com").emails).toEqual([
      "ravi@example.com",
    ]);
    expect(checkEmails("ravi(at)example(dot)co(dot)in").emails).toEqual([
      "ravi@example.co.in",
    ]);
    expect(deobfuscateEmails("x {AT} y {DOT} com")).toBe("x@y.com");
  });

  it("flags missing_email when there is nothing email-like", () => {
    expect(checkEmails("").flags).toEqual(["missing_email"]);
    expect(checkEmails("N/A").flags).toEqual(["missing_email"]);
    expect(checkEmails("call the owner").flags).toEqual(["missing_email"]);
  });

  it("keeps invalid emails as written and flags them", () => {
    const result = checkEmails("Ravi@@example.com");
    expect(result.emails).toEqual([]);
    expect(result.invalid).toEqual(["Ravi@@example.com"]);
    expect(result.flags).toEqual(["invalid_email"]);
  });

  it("keeps valid emails next to an invalid one", () => {
    const result = checkEmails("good@example.com, bad@example");
    expect(result.emails).toEqual(["good@example.com"]);
    expect(result.invalid).toEqual(["bad@example"]);
    expect(result.flags).toEqual(["invalid_email"]);
  });

  it("flags generic inboxes but keeps them", () => {
    const result = checkEmails("info@example.com");
    expect(result.emails).toEqual(["info@example.com"]);
    expect(result.flags).toEqual(["generic_email"]);
  });

  it("suggests a fix for a domain typo, without changing the email", () => {
    const result = checkEmails("ravi@gmial.com");
    expect(result.emails).toEqual(["ravi@gmial.com"]);
    expect(result.suggestions).toEqual([
      {
        field: "emails",
        issue: 'possible typo in email domain "gmial.com"',
        suggested_value: "ravi@gmail.com",
      },
    ]);
  });
});
