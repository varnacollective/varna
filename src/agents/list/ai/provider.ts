/**
 * The one interface every AI model is called through. Adapters (one per
 * provider) implement it; the rest of the code never knows which provider is
 * in use. No provider is chosen yet: only the mock adapter exists.
 */

/** A file sent to the model with a message (a PDF or an image). */
export interface InputFile {
  /** Media type, e.g. "application/pdf" or "image/jpeg". */
  mimeType: string;
  data: Uint8Array;
}

export interface LLMMessage {
  role: "user" | "assistant";
  content: string;
  /** Files the model should read, sent before the text. User messages only. */
  files?: readonly InputFile[];
}

export interface LLMRequest {
  /** Instructions for the model (role, rules, output format). */
  system: string;
  /** The conversation so far; the last message is from the user. */
  messages: readonly LLMMessage[];
  /**
   * JSON Schema the answer must follow. Adapters pass it to the provider's
   * structured-output feature where one exists. Our own validation runs
   * regardless: the provider is never trusted to have enforced it.
   */
  outputSchema: Record<string, unknown>;
  /** Upper limit on the answer's length, in tokens. */
  maxOutputTokens: number;
}

export interface LLMUsage {
  inputTokens: number;
  /** Everything billed as output, thinking included. */
  outputTokens: number;
  /** The part of outputTokens the model spent thinking, if reported. */
  thinkingTokens?: number;
}

export interface LLMResponse {
  /** The model's answer, exactly as returned (stored as evidence). */
  text: string;
  /** Exact model that answered, e.g. as reported by the provider. */
  model: string;
  usage: LLMUsage;
  /** True if the answer was cut off by the length limit. */
  truncated: boolean;
}

export interface LLMProvider {
  /** Provider name for records, e.g. "mock". */
  readonly name: string;
  complete(request: LLMRequest): Promise<LLMResponse>;
}
