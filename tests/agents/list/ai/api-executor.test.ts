import { describe, expect, it } from "vitest";
import { z } from "zod";
import { ApiExecutor, checkAnswer } from "@/agents/list/ai/api-executor";
import { MockProvider } from "@/agents/list/ai/mock-provider";
import type { AiTask } from "@/agents/list/ai/task";

const Answer = z.strictObject({ names: z.array(z.string()) });

function task(check?: AiTask<z.infer<typeof Answer>>["check"]) {
  const t: AiTask<z.infer<typeof Answer>> = {
    type: "test_task",
    promptVersion: "test@1",
    instructions: "List the names.",
    input: "Example Crafts, Rao Weaves",
    outputSchema: Answer,
    maxOutputTokens: 1000,
  };
  return check ? { ...t, check } : t;
}

let clock = 0;
const now = () => (clock += 10);

describe("ApiExecutor", () => {
  it("returns a valid answer and records the attempt", async () => {
    const provider = new MockProvider([
      {
        text: '{"names":["Example Crafts","Rao Weaves"]}',
        model: "mock-1",
        usage: { inputTokens: 50, outputTokens: 12 },
      },
    ]);
    const result = await new ApiExecutor(provider, { now }).run(task());
    expect(result).toMatchObject({
      ok: true,
      output: { names: ["Example Crafts", "Rao Weaves"] },
      model: "mock-1",
      taskType: "test_task",
      promptVersion: "test@1",
      executor: "api",
      provider: "mock",
    });
    expect(result.attempts).toEqual([
      {
        rawResponse: '{"names":["Example Crafts","Rao Weaves"]}',
        model: "mock-1",
        inputTokens: 50,
        outputTokens: 12,
        latencyMs: 10,
        problems: [],
      },
    ]);
  });

  it("sends the instructions, the input and the JSON schema to the provider", async () => {
    const provider = new MockProvider(['{"names":[]}']);
    await new ApiExecutor(provider).run(task());
    expect(provider.requests[0]).toMatchObject({
      system: "List the names.",
      messages: [{ role: "user", content: "Example Crafts, Rao Weaves" }],
      maxOutputTokens: 1000,
      outputSchema: { type: "object", additionalProperties: false },
    });
  });

  it("retries invalid JSON, telling the model what was wrong", async () => {
    const provider = new MockProvider([
      "Sure! Here are the names: Example Crafts",
      '{"names":["Example Crafts"]}',
    ]);
    const result = await new ApiExecutor(provider).run(task());
    expect(result.ok).toBe(true);
    expect(result.attempts.map((a) => a.problems)).toEqual([
      ["The answer is not valid JSON. Reply with JSON only."],
      [],
    ]);
    const retry = provider.requests[1]?.messages;
    expect(retry?.map((m) => m.role)).toEqual(["user", "assistant", "user"]);
    expect(retry?.[1]?.content).toBe(
      "Sure! Here are the names: Example Crafts",
    );
    expect(retry?.[2]?.content).toContain("not valid JSON");
  });

  it("retries answers that break the schema (including invented fields)", async () => {
    const provider = new MockProvider([
      '{"names":["Example Crafts"],"confidence":"high"}',
      '{"names":["Example Crafts"]}',
    ]);
    const result = await new ApiExecutor(provider).run(task());
    expect(result.ok).toBe(true);
    expect(result.attempts[0]?.problems[0]).toContain(
      'Unrecognized key: "confidence"',
    );
  });

  it("retries answers that fail the task's own checks", async () => {
    const provider = new MockProvider([
      '{"names":["Example Crafts"]}',
      '{"names":["Example Crafts","Rao Weaves"]}',
    ]);
    const result = await new ApiExecutor(provider).run(
      task((out) => (out.names.length < 2 ? ["Rao Weaves is missing."] : [])),
    );
    expect(result.ok).toBe(true);
    expect(result.attempts[0]?.problems).toEqual(["Rao Weaves is missing."]);
    expect(provider.requests[1]?.messages[2]?.content).toContain(
      "- Rao Weaves is missing.",
    );
  });

  it("gives up after the maximum attempts, keeping every answer as evidence", async () => {
    const provider = new MockProvider(() => "not json");
    const result = await new ApiExecutor(provider, { maxAttempts: 3 }).run(
      task(),
    );
    expect(result).toMatchObject({ ok: false, error: "invalid_answer" });
    expect(result.attempts).toHaveLength(3);
    expect(result.attempts.every((a) => a.rawResponse === "not json")).toBe(
      true,
    );
  });

  it("treats a cut-off answer as invalid, even if it happens to parse", async () => {
    const provider = new MockProvider([
      { text: '{"names":[]}', truncated: true },
      '{"names":["Example Crafts"]}',
    ]);
    const result = await new ApiExecutor(provider).run(task());
    expect(result.ok).toBe(true);
    expect(result.attempts[0]?.problems[0]).toContain("cut off");
  });

  it("stops on a provider error without guessing", async () => {
    const provider = new MockProvider([new Error("rate limited")]);
    const result = await new ApiExecutor(provider).run(task());
    expect(result).toMatchObject({
      ok: false,
      error: "provider_error",
      message: "rate limited",
    });
    expect(result.attempts).toHaveLength(1);
  });

  it("sends the task's files with the input, and again on every retry", async () => {
    const file = { mimeType: "image/png", data: new Uint8Array([1, 2, 3]) };
    const provider = new MockProvider(["not json", '{"names":[]}']);
    const result = await new ApiExecutor(provider).run({
      ...task(),
      files: [file],
    });
    expect(result.ok).toBe(true);
    expect(provider.requests).toHaveLength(2);
    for (const request of provider.requests) {
      expect(request.messages[0]).toEqual({
        role: "user",
        content: "Example Crafts, Rao Weaves",
        files: [file],
      });
    }
    // The model's answers and the retry message carry no files.
    expect(provider.requests[1]?.messages.slice(1).every((m) => !m.files)).toBe(
      true,
    );
  });
});

describe("checkAnswer", () => {
  it("accepts JSON wrapped in a ```json block", () => {
    const result = checkAnswer(task(), '```json\n{"names":["A"]}\n```');
    expect(result).toEqual({ ok: true, output: { names: ["A"] } });
  });

  it("rejects text around the JSON", () => {
    const result = checkAnswer(task(), 'Here you go: {"names":["A"]}');
    expect(result.ok).toBe(false);
  });
});
