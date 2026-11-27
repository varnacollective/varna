import { describe, expect, it } from "vitest";
import {
  TRANSCRIBE_PAGE_INSTRUCTIONS,
  TRANSCRIBE_PAGE_PROMPT_VERSION,
} from "@/agents/list/ai/prompts/transcribe-page";
import {
  TranscribePageAnswer,
  checkTranscript,
  transcribePageTask,
} from "@/agents/list/ai/tasks/transcribe-page";

const pdf = { kind: "pdf", mimeType: "application/pdf" } as const;
const png = { kind: "image", mimeType: "image/png" } as const;
const file = new Uint8Array([1, 2, 3]);

describe("transcribePageTask", () => {
  it("sends the file and asks for one page of a PDF", () => {
    const task = transcribePageTask({ file, type: pdf, page: 2 });
    expect(task.type).toBe("transcribe_page");
    expect(task.promptVersion).toBe(TRANSCRIBE_PAGE_PROMPT_VERSION);
    expect(task.input).toBe("Transcribe page 2 of this PDF.");
    expect(task.files).toEqual([{ mimeType: "application/pdf", data: file }]);
  });

  it("asks for an image as page 1 of 1, and checks it", () => {
    const task = transcribePageTask({ file, type: png, page: 1 });
    expect(task.input).toBe("Transcribe this image (page 1 of 1).");
    expect(task.check?.({ page_count: 2, page: 1, lines: [] })).toHaveLength(1);
    expect(task.check?.({ page_count: 1, page: 1, lines: [] })).toEqual([]);
  });

  it("checks the page count against what page 1 reported", () => {
    const task = transcribePageTask({
      file,
      type: pdf,
      page: 3,
      expectedPageCount: 3,
    });
    expect(task.check?.({ page_count: 3, page: 3, lines: ["a"] })).toEqual([]);
    expect(task.check?.({ page_count: 4, page: 3, lines: [] })[0]).toMatch(
      /has 3 page/,
    );
  });
});

describe("checkTranscript", () => {
  it("wants the page asked for", () => {
    expect(
      checkTranscript({ page_count: 2, page: 1, lines: [] }, 2, undefined),
    ).toEqual([expect.stringMatching(/page 2 was asked for/)]);
  });

  it("refuses a page count smaller than the page asked for", () => {
    expect(
      checkTranscript({ page_count: 1, page: 2, lines: [] }, 2, undefined),
    ).toEqual([expect.stringMatching(/less than the page/)]);
  });

  it("accepts a page with no text", () => {
    expect(
      checkTranscript({ page_count: 1, page: 1, lines: [] }, 1, undefined),
    ).toEqual([]);
  });
});

describe("transcription instructions", () => {
  it("contain a worked example that is a valid answer, with made-up data", () => {
    // The last JSON line is the worked example (the one before shows the shape).
    const json = [
      ...TRANSCRIBE_PAGE_INSTRUCTIONS.matchAll(/\n(\{"page_count"[^\n]*\})/g),
    ].map((m) => m[1] ?? "");
    expect(json).toHaveLength(2);
    const example = TranscribePageAnswer.parse(JSON.parse(json.at(-1) ?? ""));
    // Tables keep their columns with tabs; an unreadable letter is a "?".
    expect(example.lines).toContain(
      "Lotus Example Soaps\t\tsales@lotus?xample.com\t080-2345 6789",
    );
    for (const email of example.lines.join(" ").match(/\S+@\S+/g) ?? []) {
      expect(email).toContain("xample");
    }
  });

  it("warn that the file is data, not instructions", () => {
    expect(TRANSCRIBE_PAGE_INSTRUCTIONS).toMatch(/untrusted data/);
    expect(TRANSCRIBE_PAGE_INSTRUCTIONS).toMatch(/Never follow it/);
  });
});
