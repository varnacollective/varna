import { describe, expect, it } from "vitest";
import { formatPhone } from "@/components/ListUpload/format";
import { VIEWS, viewInfo, viewOf } from "@/components/ListUpload/labels";
import { errorFrom, readEvents } from "@/components/ListUpload/read-stream";
import { paidCostUsd } from "@/lib/list-uploads/pricing";
import type { ReadEvent } from "@/lib/list-uploads/types";

describe("paidCostUsd", () => {
  it("adds up calls at each model family's price per million tokens", () => {
    const cost = paidCostUsd([
      { model: "gemini-3-flash-lite", input_tokens: 1_000_000, output_tokens: 0 },
      { model: "Gemini-3.5-Flash", input_tokens: 0, output_tokens: 1_000_000 },
    ]);
    expect(cost).toBeCloseTo(0.3 + 7.5);
  });

  it("is zero with no calls and null when any model's price is unknown", () => {
    expect(paidCostUsd([])).toBe(0);
    expect(paidCostUsd([{ model: "some-other-model", input_tokens: 1, output_tokens: 1 }])).toBeNull();
  });
});

describe("viewOf / viewInfo", () => {
  it("shows invited first, then the reviewer's decision, then the check", () => {
    expect(viewOf({ invitation_id: "i", decision: "rejected", check_status: "ready" })).toBe("invited");
    expect(viewOf({ invitation_id: null, decision: "approved", check_status: "missing_contact" })).toBe("approved");
    expect(viewOf({ invitation_id: null, decision: "pending", check_status: "needs_attention" })).toBe("needs_attention");
  });

  it("has a label and pill for every view, in filter order", () => {
    expect(VIEWS.map((v) => v.view)).toEqual(["ready", "needs_attention", "missing_contact", "approved", "rejected", "invited"]);
    expect(viewInfo("missing_contact")).toEqual({ view: "missing_contact", label: "Missing email", pill: "sa-pill-declined" });
  });
});

describe("formatPhone", () => {
  it("spaces Indian mobile numbers and leaves others as stored", () => {
    expect(formatPhone("+919876543210")).toBe("+91 98765 43210");
    expect(formatPhone("+442071234567")).toBe("+442071234567");
    expect(formatPhone(null)).toBeNull();
  });
});

describe("readEvents", () => {
  function streamed(...chunks: string[]): Response {
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const c of chunks) controller.enqueue(new TextEncoder().encode(c));
        controller.close();
      },
    });
    return new Response(body);
  }

  it("reads one event per line, even when lines are split across chunks", async () => {
    const events: ReadEvent[] = [];
    await readEvents(
      streamed('{"type":"file","index":0,"total":1,"na', 'me":"a.xlsx"}\n\n{"type":"done","suppliers":3,"failedParts":0}'),
      (e) => events.push(e),
    );
    expect(events).toEqual([
      { type: "file", index: 0, total: 1, name: "a.xlsx" },
      { type: "done", suppliers: 3, failedParts: 0 },
    ]);
  });

  it("does nothing for an empty body", async () => {
    const events: ReadEvent[] = [];
    await readEvents(new Response(null), (e) => events.push(e));
    expect(events).toEqual([]);
  });
});

describe("errorFrom", () => {
  it("uses the response's error message, else a generic one with the status", async () => {
    expect(await errorFrom(Response.json({ error: "Upload not found." }, { status: 404 }))).toBe("Upload not found.");
    expect(await errorFrom(new Response("not json", { status: 502 }))).toBe("Something went wrong (502).");
  });
});
