import { z } from "zod/v4";
import type { LLMMessage, LLMProvider } from "./provider";
import type { AiAttempt, AiExecutor, AiResult, AiTask } from "./task";

export interface ApiExecutorOptions {
  /** Total tries per task, including the first. */
  maxAttempts: number;
  /** Clock, replaceable in tests. */
  now: () => number;
}

const DEFAULTS: ApiExecutorOptions = { maxAttempts: 3, now: () => Date.now() };

/**
 * Runs AI tasks through an `LLMProvider`. Every answer is checked: valid JSON,
 * the task's schema, then the task's own checks. A failed answer is sent back
 * to the model with the problems listed, up to `maxAttempts` tries in total;
 * after that the task fails. Nothing is ever guessed or patched up.
 */
export class ApiExecutor implements AiExecutor {
  readonly kind = "api" as const;
  private readonly options: ApiExecutorOptions;

  constructor(
    private readonly provider: LLMProvider,
    options: Partial<ApiExecutorOptions> = {},
  ) {
    this.options = { ...DEFAULTS, ...options };
  }

  async run<T>(task: AiTask<T>): Promise<AiResult<T>> {
    const base = {
      taskType: task.type,
      promptVersion: task.promptVersion,
      executor: this.kind,
      provider: this.provider.name,
    };
    const attempts: AiAttempt[] = [];
    const messages: LLMMessage[] = [
      {
        role: "user",
        content: task.input,
        ...(task.files === undefined ? {} : { files: task.files }),
      },
    ];
    // The shape the model writes (a schema may expand it after parsing).
    const outputSchema = z.toJSONSchema(task.outputSchema, {
      io: "input",
    }) as Record<string, unknown>;

    for (let i = 0; i < this.options.maxAttempts; i++) {
      const started = this.options.now();
      let response;
      try {
        response = await this.provider.complete({
          system: task.instructions,
          messages,
          outputSchema,
          maxOutputTokens: task.maxOutputTokens,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        attempts.push({
          rawResponse: "",
          inputTokens: 0,
          outputTokens: 0,
          latencyMs: this.options.now() - started,
          problems: [`provider error: ${message}`],
        });
        // Network errors, rate limits and outages are retried by the provider
        // adapter itself. If one still reaches us, stop: the run can resume.
        return {
          ...base,
          ok: false,
          error: "provider_error",
          message,
          attempts,
        };
      }

      const checked = checkAnswer(task, response.text, response.truncated);
      attempts.push({
        rawResponse: response.text,
        model: response.model,
        inputTokens: response.usage.inputTokens,
        outputTokens: response.usage.outputTokens,
        ...(response.usage.thinkingTokens === undefined
          ? {}
          : { thinkingTokens: response.usage.thinkingTokens }),
        latencyMs: this.options.now() - started,
        problems: checked.ok ? [] : checked.problems,
      });
      if (checked.ok) {
        return {
          ...base,
          ok: true,
          output: checked.output,
          model: response.model,
          attempts,
        };
      }
      messages.push(
        { role: "assistant", content: response.text },
        { role: "user", content: retryMessage(checked.problems) },
      );
    }

    return {
      ...base,
      ok: false,
      error: "invalid_answer",
      message: `no valid answer after ${String(this.options.maxAttempts)} attempts`,
      attempts,
    };
  }
}

type Checked<T> = { ok: true; output: T } | { ok: false; problems: string[] };

/** JSON → schema → the task's own checks. Exported for the chat executor. */
export function checkAnswer<T>(
  task: AiTask<T>,
  text: string,
  truncated = false,
): Checked<T> {
  if (truncated) {
    return {
      ok: false,
      problems: [
        "The answer was cut off because it was too long. Reply again with the complete JSON, using no extra spaces or text.",
      ],
    };
  }
  let json: unknown;
  try {
    json = JSON.parse(stripCodeFence(text));
  } catch {
    return {
      ok: false,
      problems: ["The answer is not valid JSON. Reply with JSON only."],
    };
  }
  const parsed = task.outputSchema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, problems: [z.prettifyError(parsed.error)] };
  }
  const problems = task.check?.(parsed.data) ?? [];
  return problems.length === 0
    ? { ok: true, output: parsed.data }
    : { ok: false, problems };
}

/**
 * Some models wrap JSON in a ```json … ``` block even when asked not to.
 * Removing the wrapper doesn't change the content, so it is allowed.
 */
function stripCodeFence(text: string): string {
  const match = /^\s*```(?:json)?\s*\n([\s\S]*?)\n\s*```\s*$/.exec(text);
  return match?.[1] ?? text;
}

function retryMessage(problems: readonly string[]): string {
  return [
    "Your answer was not accepted. Problems found:",
    ...problems.map((p) => `- ${p}`),
    "Reply again with the complete, corrected JSON only.",
  ].join("\n");
}
