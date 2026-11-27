import { describe, expect, it } from "vitest";
import {
  checkStatus,
  evidenceFor,
  greetingName,
  isSendableEmail,
  issuesFor,
  linkRelatedRows,
  placeOf,
  recheck,
  toReviewRow,
  type LinkRow,
} from "@/lib/list-uploads/review-row";
import { attention, evidence, info, supplier } from "./fixtures";

const where = {
  id: "55555555-5555-4555-8555-555555555555",
  uploadId: "33333333-3333-4333-8333-333333333333",
  fileId: "44444444-4444-4444-8444-444444444444",
  fileName: "vendors.xlsx",
  position: 0,
};

describe("isSendableEmail", () => {
  it("accepts a plain address and trims spaces", () => {
    expect(isSendableEmail("asha@example.com")).toBe(true);
    expect(isSendableEmail("  asha@example.com ")).toBe(true);
  });

  it("refuses empty, missing or malformed addresses", () => {
    for (const email of [null, undefined, "", "asha", "asha@example", "a sha@example.com", "@example.com"]) {
      expect(isSendableEmail(email)).toBe(false);
    }
  });
});

describe("checkStatus", () => {
  it("is ready with a name, a valid email and only info issues", () => {
    expect(checkStatus({ company_name: "Example", email: "a@example.com", issues: [info("generic_email")] })).toBe(
      "ready",
    );
  });

  it("is missing_contact without a valid email, whatever else is true", () => {
    expect(checkStatus({ company_name: "Example", email: null, issues: [] })).toBe("missing_contact");
    expect(checkStatus({ company_name: null, email: "not-an-email", issues: [] })).toBe("missing_contact");
  });

  it("needs attention without a company name or with an attention issue", () => {
    expect(checkStatus({ company_name: "  ", email: "a@example.com", issues: [] })).toBe("needs_attention");
    expect(
      checkStatus({ company_name: "Example", email: "a@example.com", issues: [attention("shared_email")] }),
    ).toBe("needs_attention");
  });
});

describe("issuesFor", () => {
  it("turns agent flags into issues with their level, skipping flags with no issue", () => {
    const issues = issuesFor(supplier({ flags: ["missing_name", "generic_email", "invalid_gstin"] }));
    expect(issues.map((i) => [i.code, i.level])).toEqual([
      ["missing_name", "attention"],
      ["generic_email", "info"],
    ]);
  });

  it("adds email suggestions as attention issues and ignores other fields", () => {
    const issues = issuesFor(
      supplier({
        suggestions: [
          { field: "emails", issue: "typo", suggested_value: "rao@gmail.com" },
          { field: "emails", issue: "no suggestion" },
          { field: "gstin", issue: "looks like a CIN", suggested_value: "x" },
        ],
      }),
    );
    expect(issues).toEqual([{ code: "email_suggestion", level: "attention", message: "typo: did you mean rao@gmail.com?" }]);
  });

  it("shows the AI's reason when it was unsure", () => {
    const [issue] = issuesFor(
      supplier({
        flags: ["low_confidence"],
        suggestions: [{ field: "supplier", issue: "AI was unsure: might be a section heading" }],
      }),
    );
    expect(issue).toEqual({ code: "low_confidence", level: "attention", message: "The AI was not sure: might be a section heading" });
  });

  it("keeps the plain message when the AI gave no reason", () => {
    const [issue] = issuesFor(
      supplier({ flags: ["low_confidence"], suggestions: [{ field: "supplier", issue: "AI was unsure" }] }),
    );
    expect(issue?.message).toBe("The AI was not sure about this one");
  });

  it("notes a missing contact name, with the company in the greeting", () => {
    const [issue] = issuesFor(supplier({ contact_name: undefined }));
    expect(issue).toMatchObject({ code: "no_contact_name", level: "info" });
    expect(issue?.message).toContain('"Dear Example Handloom team"');
  });
});

describe("evidenceFor", () => {
  it("keeps where the supplier was found and every cell of its rows", () => {
    expect(evidenceFor(supplier(), "vendors.xlsx")).toEqual({
      fileName: "vendors.xlsx",
      sheet: "Vendors",
      row: 2,
      readFromImage: false,
      cells: [
        { cell: "A2", text: "Example Handloom" },
        { cell: "B2", text: "asha@example.com" },
      ],
    });
  });

  it("records a page and that it was read from an image", () => {
    const found = supplier({
      flags: ["read_from_image"],
      source: { file_id: where.fileId, file_name: "list.pdf", page: 3 },
    });
    expect(evidenceFor(found, "list.pdf")).toMatchObject({ page: 3, readFromImage: true });
    expect(evidenceFor(found, "list.pdf")).not.toHaveProperty("sheet");
  });
});

describe("toReviewRow", () => {
  it("uses the first email and phone as main and keeps the rest", () => {
    const row = toReviewRow(
      supplier({ emails: ["a@example.com", "b@example.com"], phones: ["+919000000001", "+919000000002"] }),
      where,
    );
    expect(row).toMatchObject({
      id: where.id,
      upload_id: where.uploadId,
      file_id: where.fileId,
      email: "a@example.com",
      other_emails: ["b@example.com"],
      phone: "+919000000001",
      other_phones: ["+919000000002"],
      check_status: "ready",
    });
    expect(row.extracted.evidence.fileName).toBe("vendors.xlsx");
  });

  it("marks a supplier with no email as missing_contact, with null fields", () => {
    const row = toReviewRow(supplier({ emails: [], phones: [], city: undefined }), where);
    expect(row).toMatchObject({ email: null, other_emails: [], phone: null, city: null, check_status: "missing_contact" });
  });
});

describe("recheck", () => {
  const row = {
    company_name: "Example",
    contact_name: "Asha",
    email: "a@example.com",
    issues: [attention("invalid_email"), attention("missing_name"), info("read_from_image")],
  };

  it("drops issues about the edited fields and keeps the others", () => {
    const result = recheck(row, ["email"]);
    expect(result.issues.map((i) => i.code)).toEqual(["missing_name", "read_from_image"]);
    expect(result.check_status).toBe("needs_attention");
  });

  it("becomes ready once every attention issue is edited away", () => {
    expect(recheck(row, ["email", "company_name"]).check_status).toBe("ready");
  });

  it("rebuilds the no-contact-name note with the current company name", () => {
    const result = recheck({ ...row, company_name: "New Name", contact_name: " ", issues: [info("no_contact_name")] }, [
      "company_name",
    ]);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]?.message).toContain("New Name");
  });
});

describe("greetingName", () => {
  it("greets the contact, else the company's team", () => {
    expect(greetingName({ company_name: "Example", contact_name: " Asha " })).toBe("Asha");
    expect(greetingName({ company_name: "Example", contact_name: null })).toBe("Example team");
    expect(greetingName({ company_name: null, contact_name: "" })).toBe("Supplier team");
  });
});

describe("placeOf", () => {
  const here = { file_id: "f1", evidence: evidence({ sheet: "Vendors", row: 2 }) };

  it("says only the row in the same sheet of the same file", () => {
    expect(placeOf({ file_id: "f1", evidence: evidence({ row: 9 }) }, here)).toBe("row 9");
  });

  it("names the sheet when it differs, and the file when it differs", () => {
    expect(placeOf({ file_id: "f1", evidence: evidence({ sheet: "Linen", row: 4 }) }, here)).toBe('sheet "Linen", row 4');
    expect(placeOf({ file_id: "f2", evidence: evidence({ fileName: "more.xlsx", row: 4 }) }, here)).toBe(
      'more.xlsx, sheet "Vendors", row 4',
    );
  });

  it("uses the page for PDFs and never names the pasted-text sheet", () => {
    expect(placeOf({ file_id: "f2", evidence: evidence({ fileName: "list.pdf", sheet: "Page 2", page: 2 }) }, here)).toBe(
      "list.pdf, page 2",
    );
    expect(placeOf({ file_id: "f2", evidence: evidence({ fileName: "mail.txt", sheet: "Text", row: 5 }) }, here)).toBe(
      "mail.txt, row 5",
    );
  });
});

describe("linkRelatedRows", () => {
  function link(id: string, extra: Partial<LinkRow> = {}): LinkRow {
    return {
      id,
      file_id: "f1",
      company_name: `Supplier ${id}`,
      email: `${id}@example.com`,
      other_emails: [],
      issues: [],
      evidence: evidence({ row: Number(id) }),
      group: null,
      ...extra,
    };
  }

  it("points rows with the same email (any case, main or other) at each other", () => {
    const rows = [link("2", { email: "Same@Example.com" }), link("3", { other_emails: ["same@example.com"] }), link("4")];
    const changed = linkRelatedRows(rows);
    expect([...changed.keys()]).toEqual(["2", "3"]);
    expect(changed.get("2")).toEqual([
      { code: "shared_email", level: "attention", message: "Same email as Supplier 3 (row 3)", related: [{ id: "3", place: "row 3" }] },
    ]);
  });

  it("reports a duplicate group once, not also as a shared email", () => {
    const rows = [link("2", { group: "g", email: "x@example.com" }), link("3", { group: "g", email: "x@example.com" })];
    const issues = linkRelatedRows(rows).get("2") ?? [];
    expect(issues.map((i) => i.code)).toEqual(["possible_duplicate"]);
  });

  it("removes a link once the emails no longer match, and leaves unchanged rows out", () => {
    const stale = { code: "shared_email", level: "attention" as const, message: "Same email as Supplier 3 (row 3)" };
    const changed = linkRelatedRows([link("2", { issues: [stale] }), link("3")]);
    expect(changed.get("2")).toEqual([]);
    expect(changed.has("3")).toBe(false);
  });

  it("shortens long lists to two names and a count", () => {
    const rows = ["2", "3", "4", "5", "6"].map((id) => link(id, { email: "same@example.com" }));
    const message = linkRelatedRows(rows).get("2")?.[0]?.message;
    expect(message).toBe("Same email as Supplier 3 (row 3), Supplier 4 (row 4) and 2 more");
  });
});
