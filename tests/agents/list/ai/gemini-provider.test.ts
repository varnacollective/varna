import { describe, expect, it } from "vitest";
import { GeminiProvider } from "@/agents/list/ai/gemini-provider";
import type { LLMRequest } from "@/agents/list/ai/provider";

const request: LLMRequest = {
  system: "Answer in JSON.",
  messages: [
    { role: "user", content: "List the names." },
    { role: "assistant", content: '{"names":[]}' },
    { role: "user", content: "Try again." },
  ],
  outputSchema: { type: "object" },
  maxOutputTokens: 1000,
};

interface Call {
  url: string;
  init: RequestInit;
}

/** Fake fetch: answers in order and records every call. */
function fakeFetch(replies: (Response | Error)[]) {
  const calls: Call[] = [];
  const fn: typeof fetch = (url, init) => {
    calls.push({
      url: url instanceof Request ? url.url : url.toString(),
      init: init ?? {},
    });
    const reply = replies.shift();
    if (!reply) throw new Error("no more replies");
    return reply instanceof Error
      ? Promise.reject(reply)
      : Promise.resolve(reply);
  };
  return { fetch: fn, calls };
}

function ok(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200 });
}

function answer(text: string, finishReason = "STOP") {
  return ok({
    candidates: [{ content: { parts: [{ text }] }, finishReason }],
    usageMetadata: {
      promptTokenCount: 120,
      candidatesTokenCount: 30,
      thoughtsTokenCount: 10,
    },
    modelVersion: "gemini-test-001",
  });
}

function provider(fetchFn: typeof fetch, sleeps: number[] = []) {
  return new GeminiProvider({
    apiKey: "test-key",
    model: "gemini-test",
    fetch: fetchFn,
    sleep: (ms) => {
      sleeps.push(ms);
      return Promise.resolve();
    },
  });
}

describe("GeminiProvider", () => {
  it("sends the system prompt, the conversation and JSON mode", async () => {
    const { fetch, calls } = fakeFetch([answer('{"names":["A"]}')]);
    await provider(fetch).complete(request);

    expect(calls).toHaveLength(1);
    const call = calls[0];
    expect(call?.url).toBe(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-test:generateContent",
    );
    expect(call?.init.method).toBe("POST");
    expect(
      (call?.init.headers as Record<string, string>)["x-goog-api-key"],
    ).toBe("test-key");
    expect(JSON.parse(call?.init.body as string)).toEqual({
      systemInstruction: { parts: [{ text: "Answer in JSON." }] },
      contents: [
        { role: "user", parts: [{ text: "List the names." }] },
        { role: "model", parts: [{ text: '{"names":[]}' }] },
        { role: "user", parts: [{ text: "Try again." }] },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 1000,
      },
    });
  });

  it("sends files as inline data before the text", async () => {
    const { fetch, calls } = fakeFetch([answer("{}")]);
    await provider(fetch).complete({
      ...request,
      messages: [
        {
          role: "user",
          content: "Transcribe page 1 of this PDF.",
          files: [
            {
              mimeType: "application/pdf",
              data: new TextEncoder().encode("%PDF-1.4"),
            },
          ],
        },
      ],
    });
    const body = JSON.parse(calls[0]?.init.body as string) as {
      contents: unknown[];
    };
    expect(body.contents).toEqual([
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: Buffer.from("%PDF-1.4").toString("base64"),
            },
          },
          { text: "Transcribe page 1 of this PDF." },
        ],
      },
    ]);
  });

  it("sends the thinking level only when one is set", async () => {
    const { fetch, calls } = fakeFetch([answer("{}")]);
    await new GeminiProvider({
      apiKey: "test-key",
      model: "gemini-test",
      thinkingLevel: "low",
      fetch,
      sleep: () => Promise.resolve(),
    }).complete(request);
    const body = JSON.parse(calls[0]?.init.body as string) as {
      generationConfig: unknown;
    };
    expect(body.generationConfig).toEqual({
      responseMimeType: "application/json",
      maxOutputTokens: 1000,
      thinkingConfig: { thinkingLevel: "low" },
    });
  });

  it("never puts the key in the URL", async () => {
    const { fetch, calls } = fakeFetch([answer("{}")]);
    await provider(fetch).complete(request);
    expect(calls[0]?.url).not.toContain("test-key");
  });

  it("returns the text, model and tokens (thinking counted as output)", async () => {
    const { fetch } = fakeFetch([answer('{"names":["A"]}')]);
    const result = await provider(fetch).complete(request);
    expect(result).toEqual({
      text: '{"names":["A"]}',
      model: "gemini-test-001",
      usage: { inputTokens: 120, outputTokens: 40, thinkingTokens: 10 },
      truncated: false,
    });
  });

  it("leaves out thinking parts and joins the rest", async () => {
    const { fetch } = fakeFetch([
      ok({
        candidates: [
          {
            content: {
              parts: [
                { text: "let me think", thought: true },
                { text: '{"names":' },
                { text: '["A"]}' },
              ],
            },
            finishReason: "STOP",
          },
        ],
      }),
    ]);
    const result = await provider(fetch).complete(request);
    expect(result.text).toBe('{"names":["A"]}');
    expect(result.model).toBe("gemini-test");
    expect(result.usage).toEqual({
      inputTokens: 0,
      outputTokens: 0,
      thinkingTokens: 0,
    });
  });

  it("marks an answer cut off at the token limit as truncated", async () => {
    const { fetch } = fakeFetch([answer('{"names":["A', "MAX_TOKENS")]);
    const result = await provider(fetch).complete(request);
    expect(result.truncated).toBe(true);
  });

  it("fails when Gemini blocks the request or stops for safety", async () => {
    const blocked = fakeFetch([
      ok({ promptFeedback: { blockReason: "OTHER" } }),
    ]);
    await expect(provider(blocked.fetch).complete(request)).rejects.toThrow(
      "no answer (OTHER)",
    );
    const safety = fakeFetch([answer("", "SAFETY")]);
    await expect(provider(safety.fetch).complete(request)).rejects.toThrow(
      "stopped the answer (SAFETY)",
    );
  });

  it("retries a rate limit, waiting as long as Gemini asks", async () => {
    const sleeps: number[] = [];
    const { fetch, calls } = fakeFetch([
      new Response(
        JSON.stringify({
          error: {
            code: 429,
            message: "Resource exhausted",
            details: [
              {
                "@type": "type.googleapis.com/google.rpc.QuotaFailure",
                violations: [
                  { quotaId: "GenerateRequestsPerMinutePerProjectPerModel" },
                ],
              },
              {
                "@type": "type.googleapis.com/google.rpc.RetryInfo",
                retryDelay: "7.5s",
              },
            ],
          },
        }),
        { status: 429 },
      ),
      answer("{}"),
    ]);
    const result = await provider(fetch, sleeps).complete(request);
    expect(result.text).toBe("{}");
    expect(calls).toHaveLength(2);
    expect(sleeps).toEqual([7500]);
  });

  it("does not retry when the daily quota is used up", async () => {
    const { fetch, calls } = fakeFetch([
      new Response(
        JSON.stringify({
          error: {
            message: "Resource exhausted",
            details: [
              {
                violations: [
                  { quotaId: "GenerateRequestsPerDayPerProjectPerModel" },
                ],
              },
            ],
          },
        }),
        { status: 429 },
      ),
    ]);
    await expect(provider(fetch).complete(request)).rejects.toThrow(
      "daily quota used up",
    );
    expect(calls).toHaveLength(1);
  });

  it("retries server and network errors with growing waits, then gives up", async () => {
    const sleeps: number[] = [];
    const replies = [
      new Error("socket hang up"),
      ...Array.from({ length: 5 }, () => new Response("down", { status: 503 })),
    ];
    const { fetch, calls } = fakeFetch(replies);
    await expect(provider(fetch, sleeps).complete(request)).rejects.toThrow(
      "Gemini HTTP 503",
    );
    expect(calls).toHaveLength(6);
    expect(sleeps).toEqual([2000, 4000, 8000, 16000, 32000]);
  });

  it("does not retry a bad request (for example a wrong model name)", async () => {
    const { fetch, calls } = fakeFetch([
      new Response(
        JSON.stringify({ error: { message: "models/x is not found" } }),
        { status: 404 },
      ),
    ]);
    await expect(provider(fetch).complete(request)).rejects.toThrow(
      "Gemini HTTP 404: models/x is not found",
    );
    expect(calls).toHaveLength(1);
  });

  it("spaces out requests when a minimum interval is set", async () => {
    let clock = 1000;
    const sleeps: number[] = [];
    const { fetch } = fakeFetch([answer("{}"), answer("{}"), answer("{}")]);
    const p = new GeminiProvider({
      apiKey: "k",
      model: "m",
      fetch,
      minIntervalMs: 12_000,
      now: () => clock,
      sleep: (ms) => {
        sleeps.push(ms);
        clock += ms;
        return Promise.resolve();
      },
    });
    await Promise.all([
      p.complete(request),
      p.complete(request),
      p.complete(request),
    ]);
    expect(sleeps).toEqual([12_000, 12_000]);
  });

  it("refuses an empty API key", () => {
    expect(() => new GeminiProvider({ apiKey: " ", model: "m" })).toThrow(
      "API key is empty",
    );
  });
});
