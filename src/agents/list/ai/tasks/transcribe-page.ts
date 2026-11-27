import { z } from "zod/v4";
import type { DocumentType } from "../../parsers/document";
import {
  TRANSCRIBE_PAGE_INSTRUCTIONS,
  TRANSCRIBE_PAGE_PROMPT_VERSION,
} from "../prompts/transcribe-page";
import type { AiTask } from "../task";

/**
 * The transcription job: write out the text of one page of a PDF, or of a
 * photo, exactly. There is no original text to check the transcript against,
 * so code checks what it can (shape, page numbers, the same page count on
 * every page) and every supplier found in it is flagged for a person.
 */

export const TranscribePageAnswer = z.strictObject({
  page_count: z.int().positive(),
  page: z.int().positive(),
  lines: z.array(z.string()),
});
export type TranscribePageAnswer = z.infer<typeof TranscribePageAnswer>;

export interface TranscribeTaskOptions {
  /** One dense page is a few thousand tokens; room for thinking tokens too. */
  maxOutputTokens: number;
}

export const DEFAULT_TRANSCRIBE_OPTIONS: TranscribeTaskOptions = {
  maxOutputTokens: 32_000,
};

export interface TranscribeRequest {
  file: Uint8Array;
  type: DocumentType;
  /** 1-based page to transcribe (always 1 for an image). */
  page: number;
  /** Page count already reported for this file, if known. Every answer must agree. */
  expectedPageCount?: number;
}

export function transcribePageTask(
  request: TranscribeRequest,
  options: TranscribeTaskOptions = DEFAULT_TRANSCRIBE_OPTIONS,
): AiTask<TranscribePageAnswer> {
  const isImage = request.type.kind === "image";
  const expected = isImage ? 1 : request.expectedPageCount;
  return {
    type: "transcribe_page",
    promptVersion: TRANSCRIBE_PAGE_PROMPT_VERSION,
    instructions: TRANSCRIBE_PAGE_INSTRUCTIONS,
    input: isImage
      ? "Transcribe this image (page 1 of 1)."
      : `Transcribe page ${String(request.page)} of this PDF.`,
    files: [{ mimeType: request.type.mimeType, data: request.file }],
    outputSchema: TranscribePageAnswer,
    check: (answer) => checkTranscript(answer, request.page, expected),
    maxOutputTokens: options.maxOutputTokens,
  };
}

/** Problems with a transcript, in plain words for the model; empty if fine. */
export function checkTranscript(
  answer: TranscribePageAnswer,
  page: number,
  expectedPageCount: number | undefined,
): string[] {
  const problems: string[] = [];
  if (answer.page !== page) {
    problems.push(
      `"page" is ${String(answer.page)}, but page ${String(page)} was asked for. Transcribe page ${String(page)} only.`,
    );
  }
  if (expectedPageCount !== undefined) {
    if (answer.page_count !== expectedPageCount) {
      problems.push(
        `"page_count" is ${String(answer.page_count)}, but the file has ${String(expectedPageCount)} page(s).`,
      );
    }
  } else if (answer.page_count < page) {
    problems.push(
      `"page_count" is ${String(answer.page_count)}, less than the page asked for (${String(page)}).`,
    );
  }
  return problems;
}
