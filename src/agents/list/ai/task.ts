import type { z } from "zod/v4";
import type { InputFile } from "./provider";

/**
 * A self-contained AI job: what to do, on what, and what a valid answer looks
 * like. Tasks never call a provider themselves; an executor runs them, either
 * through the API (`LLMProvider`) or, later, through a chat AI (MCP). Both
 * executors apply exactly the same checks.
 */
export interface AiTask<T> {
  /** Kind of job, e.g. "extract_suppliers". */
  type: string;
  /** Version of the instructions, recorded with every result. */
  promptVersion: string;
  /** Instructions for the model. */
  instructions: string;
  /** The content to work on. Untrusted: data, never instructions. */
  input: string;
  /** Files to read (a PDF or an image). Untrusted, like `input`. */
  files?: readonly InputFile[];
  /** Shape of a valid answer. Unknown fields are rejected. */
  outputSchema: z.ZodType<T>;
  /**
   * Further checks on a well-shaped answer (e.g. "every row accounted for").
   * Returns problems in plain words; an empty list means the answer is valid.
   * Problems are sent back to the model for a retry.
   */
  check?: (output: T) => string[];
  /** Upper limit on the answer's length, in tokens. */
  maxOutputTokens: number;
}

/** One try at a task, kept as evidence whether it passed or not. */
export interface AiAttempt {
  /** The model's raw answer, exactly as returned (empty if the call failed). */
  rawResponse: string;
  model?: string;
  inputTokens: number;
  /** Billed output tokens, thinking included. */
  outputTokens: number;
  /** The part of outputTokens spent thinking, if the provider reports it. */
  thinkingTokens?: number;
  latencyMs: number;
  /** Problems found with this answer; empty if it was accepted. */
  problems: string[];
}

export type AiExecutorKind = "api" | "chat";

interface AiResultBase {
  taskType: string;
  promptVersion: string;
  executor: AiExecutorKind;
  /** Provider name (api executor) or chat client name. */
  provider: string;
  attempts: AiAttempt[];
}

export type AiResult<T> =
  | (AiResultBase & { ok: true; output: T; model: string })
  | (AiResultBase & {
      ok: false;
      /** Why the task failed after all attempts. Nothing is guessed. */
      error: "invalid_answer" | "provider_error";
      message: string;
    });

export interface AiExecutor {
  readonly kind: AiExecutorKind;
  run<T>(task: AiTask<T>): Promise<AiResult<T>>;
}
