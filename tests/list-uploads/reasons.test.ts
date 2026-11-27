import { describe, expect, it } from "vitest";
import { reasonLabel, reasonsOf } from "@/components/ListUpload/reasons";
import type { Issue } from "@/lib/list-uploads/types";
import { attention, info } from "./fixtures";

const row = (extra: { company_name?: string | null; email?: string | null; issues?: Issue[] } = {}) => ({
  company_name: "Example Handloom",
  email: "asha@example.com",
  issues: [],
  ...extra,
});

const codes = (r: ReturnType<typeof row>) => reasonsOf(r).map((x) => x.code);

describe("reasonsOf", () => {
  it("is empty for a clean row", () => {
    expect(reasonsOf(row())).toEqual([]);
  });

  it("gives a short label for a known issue, not its long message", () => {
    expect(reasonsOf(row({ issues: [attention("possible_duplicate")] }))).toEqual([
      { code: "possible_duplicate", label: "Possible duplicate", level: "attention" },
    ]);
  });

  it("falls back to the message for an unknown issue", () => {
    const issue: Issue = { code: "something_new", level: "attention", message: "Something new" };
    expect(reasonsOf(row({ issues: [issue] }))[0]?.label).toBe("Something new");
  });

  it("puts problems before things worth knowing, most important first", () => {
    const r = row({
      issues: [info("no_contact_name"), info("generic_email"), attention("low_confidence"), attention("possible_duplicate")],
    });
    expect(codes(r)).toEqual(["possible_duplicate", "low_confidence", "generic_email", "no_contact_name"]);
  });

  it("reads a missing name and email from the row itself", () => {
    expect(codes(row({ company_name: "  ", email: null }))).toEqual(["missing_name", "missing_email"]);
  });

  it("says the email is not valid when it is there but malformed", () => {
    expect(codes(row({ email: "asha@example" }))).toEqual(["invalid_email"]);
  });

  it("lists each reason once", () => {
    const r = row({ company_name: null, email: "bad", issues: [attention("missing_name"), attention("invalid_email")] });
    expect(codes(r)).toEqual(["missing_name", "invalid_email"]);
  });

  it("drops a missing name once the reviewer has filled it in", () => {
    expect(codes(row({ issues: [attention("missing_name")] }))).toEqual([]);
  });
});

describe("reasonLabel", () => {
  it("knows the derived codes", () => {
    expect(reasonLabel("missing_email")).toBe("No email");
    expect(reasonLabel("nope")).toBeUndefined();
  });
});
