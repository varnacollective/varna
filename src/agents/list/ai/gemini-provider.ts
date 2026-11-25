import type {
  LLMProvider,
  LLMRequest,
  LLMResponse,
  LLMMessage,
} from "./provider";

/**
 * Google Gemini, through its REST API (no SDK needed).
 *
 * - Asks for plain JSON (`responseMimeType`). The answer's shape is described
 *   in the task instructions and checked by the executor, not by the model.
 * - Rate limits (HTTP 429) and server errors are retried here, waiting as long
 *   as Gemini asks. A used-up daily quota is not retried: it fails at once.
 * - `thinkingLevel` sets how much the model thinks before answering
 *   (thinking is billed as output). Unset: the model's default.
 * - `minIntervalMs` spaces out request starts, to stay under a
 *   requests-per-minute limit (the free tier allows only a few).
 *
 * The free tier may use what we send to improve Google's products: send it
 * sample data only, never real supplier lists.
 */

export const THINKING_LEVELS = ["minimal", "low", "medium", "high"] as const;
export type ThinkingLevel = (typeof THINKING_LEVELS)[number];

export interface GeminiOptions {
  apiKey: string;
  /** Model id, e.g. "gemini-2.5-flash". */
  model: string;
  /** How much the model thinks before answering; unset: its default. */
  thinkingLevel?: ThinkingLevel;
  /** Retries after a rate limit or server error. */
  maxRetries: number;
  /** Least time between two request starts, in ms (0: no spacing). */
  minIntervalMs: number;
  /** Give up on one request after this long, in ms. */
  timeoutMs: number;
  baseUrl: string;
  fetch: typeof fetch;
  sleep: (ms: number) => Promise<void>;
  now: () => number;
}

const DEFAULTS = {
  maxRetries: 5,
  minIntervalMs: 0,
  timeoutMs: 5 * 60_000,
  baseUrl: "https://generativelanguage.googleapis.com/v1beta",
  fetch: (input: string | URL | Request, init?: RequestInit) =>
    fetch(input, init),
  sleep: (ms: number) => new Promise<void>((r) => setTimeout(r, ms)),
  now: () => Date.now(),
} satisfies Omit<GeminiOptions, "apiKey" | "model">;

/** Longest wait between retries, in ms. */
const MAX_BACKOFF_MS = 90_000;

export class GeminiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly retryable = false,
    readonly retryAfterMs?: number,
  ) {
    super(message);
    this.name = "GeminiError";
  }
}

export class GeminiProvider implements LLMProvider {
  readonly name = "gemini";
  private readonly options: GeminiOptions;
  private nextStart = 0;

  constructor(
    options: Pick<GeminiOptions, "apiKey" | "model"> & Partial<GeminiOptions>,
  ) {
    if (options.apiKey.trim() === "")
      throw new Error("Gemini API key is empty");
    this.options = { ...DEFAULTS, ...options };
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const body = JSON.stringify(
      toGeminiRequest(request, this.options.thinkingLevel),
    );
    for (let retry = 0; ; retry++) {
      await this.waitForSlot();
      try {
        return await this.send(body);
      } catch (error) {
        const retryable = error instanceof GeminiError ? error.retryable : true;
        if (!retryable || retry >= this.options.maxRetries) throw error;
        const backoff = Math.min(2_000 * 2 ** retry, MAX_BACKOFF_MS);
        const asked =
          error instanceof GeminiError ? error.retryAfterMs : undefined;
        await this.options.sleep(Math.min(asked ?? backoff, MAX_BACKOFF_MS));
      }
    }
  }

  /** Space request starts at least `minIntervalMs` apart, across all callers. */
  private async waitForSlot(): Promise<void> {
    const { minIntervalMs, now, sleep } = this.options;
    if (minIntervalMs <= 0) return;
    const start = Math.max(now(), this.nextStart);
    this.nextStart = start + minIntervalMs;
    const wait = start - now();
    if (wait > 0) await sleep(wait);
  }

  private async send(body: string): Promise<LLMResponse> {
    const { baseUrl, model, apiKey, timeoutMs } = this.options;
    const url = `${baseUrl}/models/${encodeURIComponent(model)}:generateContent`;
    let res: Response;
    try {
      res = await this.options.fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body,
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new GeminiError(`network error: ${message}`, undefined, true);
    }
    const text = await res.text();
    if (!res.ok) throw httpError(res.status, text);
    return fromGeminiResponse(parseJson(text), model);
  }
}

/** Model ids this key can call with generateContent. */
export async function listGeminiModels(
  apiKey: string,
  options: Partial<Pick<GeminiOptions, "baseUrl" | "fetch">> = {},
): Promise<string[]> {
  const { baseUrl, fetch: fetchFn } = { ...DEFAULTS, ...options };
  const ids: string[] = [];
  let pageToken = "";
  do {
    const query = pageToken
      ? `?pageToken=${encodeURIComponent(pageToken)}`
      : "";
    const res = await fetchFn(`${baseUrl}/models${query}`, {
      headers: { "x-goog-api-key": apiKey },
    });
    const text = await res.text();
    if (!res.ok) throw httpError(res.status, text);
    const page = parseJson(text) as {
      models?: { name?: string; supportedGenerationMethods?: string[] }[];
      nextPageToken?: string;
    };
    for (const m of page.models ?? []) {
      if (m.name && m.supportedGenerationMethods?.includes("generateContent")) {
        ids.push(m.name.replace(/^models\//, ""));
      }
    }
    pageToken = page.nextPageToken ?? "";
  } while (pageToken);
  return ids;
}

// ---- request / response mapping -------------------------------------------

function toGeminiRequest(request: LLMRequest, thinkingLevel?: ThinkingLevel) {
  return {
    systemInstruction: { parts: [{ text: request.system }] },
    contents: request.messages.map((m: LLMMessage) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [
        ...(m.files ?? []).map((f) => ({
          inlineData: {
            mimeType: f.mimeType,
            data: Buffer.from(f.data).toString("base64"),
          },
        })),
        { text: m.content },
      ],
    })),
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: request.maxOutputTokens,
      ...(thinkingLevel === undefined
        ? {}
        : { thinkingConfig: { thinkingLevel } }),
    },
  };
}

interface GeminiPart {
  text?: string;
  thought?: boolean;
}
interface GeminiResponse {
  candidates?: {
    content?: { parts?: GeminiPart[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    thoughtsTokenCount?: number;
  };
  modelVersion?: string;
}

/** Finish reasons that still carry a usable (or checkably cut-off) answer. */
const USABLE_FINISH = new Set(["STOP", "MAX_TOKENS", undefined]);

function fromGeminiResponse(data: unknown, model: string): LLMResponse {
  const response = data as GeminiResponse;
  const candidate = response.candidates?.[0];
  if (!candidate) {
    const reason = response.promptFeedback?.blockReason ?? "no answer";
    throw new GeminiError(`Gemini returned no answer (${reason})`);
  }
  if (!USABLE_FINISH.has(candidate.finishReason)) {
    throw new GeminiError(
      `Gemini stopped the answer (${candidate.finishReason ?? "unknown"})`,
    );
  }
  const text = (candidate.content?.parts ?? [])
    .filter((p) => p.thought !== true)
    .map((p) => p.text ?? "")
    .join("");
  const usage = response.usageMetadata ?? {};
  return {
    text,
    model: response.modelVersion ?? model,
    usage: {
      inputTokens: usage.promptTokenCount ?? 0,
      // Thinking tokens are billed as output.
      outputTokens:
        (usage.candidatesTokenCount ?? 0) + (usage.thoughtsTokenCount ?? 0),
      thinkingTokens: usage.thoughtsTokenCount ?? 0,
    },
    truncated: candidate.finishReason === "MAX_TOKENS",
  };
}

// ---- errors ------------------------------------------------------------------

interface GeminiErrorBody {
  error?: {
    message?: string;
    status?: string;
    details?: {
      "@type"?: string;
      retryDelay?: string;
      violations?: { quotaId?: string }[];
    }[];
  };
}

function httpError(status: number, text: string): GeminiError {
  const body = (safeParse(text) ?? {}) as GeminiErrorBody;
  const details = body.error?.details ?? [];
  const message = `Gemini HTTP ${String(status)}: ${body.error?.message ?? text.slice(0, 300)}`;

  if (status === 429) {
    const daily = details.some((d) =>
      d.violations?.some((v) => v.quotaId?.includes("PerDay")),
    );
    if (daily) {
      return new GeminiError(
        `${message} (daily quota used up; try again tomorrow or use another model)`,
        status,
        false,
      );
    }
    const delay = details.find((d) => d.retryDelay)?.retryDelay;
    return new GeminiError(message, status, true, parseDelay(delay));
  }
  return new GeminiError(message, status, status >= 500);
}

/** "37s" or "1.5s" → ms. */
function parseDelay(delay: string | undefined): number | undefined {
  const match = delay ? /^(\d+(?:\.\d+)?)s$/.exec(delay) : null;
  return match?.[1] === undefined
    ? undefined
    : Math.ceil(Number(match[1]) * 1000);
}

function parseJson(text: string): unknown {
  const data = safeParse(text);
  if (data === undefined) {
    throw new GeminiError(
      "Gemini sent a reply that is not JSON",
      undefined,
      true,
    );
  }
  return data;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}
