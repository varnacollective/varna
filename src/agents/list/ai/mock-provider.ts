import type { LLMProvider, LLMRequest, LLMResponse } from "./provider";

/** What the mock answers: fixed text, a full response, or an error to throw. */
export type MockReply = string | Partial<LLMResponse> | Error;

/**
 * A fake AI for tests: no network, no cost, fully predictable. Give it a list
 * of replies (used in order) or a function that answers each request. Every
 * request it receives is kept in `requests` so tests can inspect them.
 */
export class MockProvider implements LLMProvider {
  readonly name = "mock";
  readonly requests: LLMRequest[] = [];
  private readonly replies: MockReply[];
  private readonly answer: ((request: LLMRequest) => MockReply) | undefined;

  constructor(replies: MockReply[] | ((request: LLMRequest) => MockReply)) {
    if (typeof replies === "function") {
      this.replies = [];
      this.answer = replies;
    } else {
      this.replies = [...replies];
      this.answer = undefined;
    }
  }

  complete(request: LLMRequest): Promise<LLMResponse> {
    // Copy, so later changes by the caller don't alter what was recorded.
    this.requests.push({ ...request, messages: [...request.messages] });
    const reply = this.answer ? this.answer(request) : this.replies.shift();
    if (reply === undefined) {
      return Promise.reject(new Error("MockProvider: no reply left"));
    }
    if (reply instanceof Error) return Promise.reject(reply);
    const response: Partial<LLMResponse> =
      typeof reply === "string" ? { text: reply } : reply;
    return Promise.resolve({
      text: response.text ?? "",
      model: response.model ?? "mock-model",
      usage: response.usage ?? { inputTokens: 0, outputTokens: 0 },
      truncated: response.truncated ?? false,
    });
  }
}
