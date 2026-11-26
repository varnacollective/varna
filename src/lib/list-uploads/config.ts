import "server-only";
import {
  GeminiProvider,
  THINKING_LEVELS,
  type ThinkingLevel,
} from "@/agents/list/ai/gemini-provider";
import { ApiExecutor } from "@/agents/list/ai/api-executor";

/**
 * Settings for the supplier list reader, from the environment:
 *
 *   GEMINI_API_KEY          required
 *   GEMINI_MODEL            required: the model that reads the rows
 *   GEMINI_VISION_MODEL     optional: the model that reads PDF pages and photos
 *   GEMINI_THINKING         optional: minimal | low | medium | high
 *   GEMINI_VISION_THINKING  optional: the same, for PDF pages and photos
 *   GEMINI_RPM              optional: most AI requests per minute (free keys)
 */

export class ListUploadConfigError extends Error {}

export interface ListReaders {
  rows: ApiExecutor;
  pages: ApiExecutor;
  model: string;
  visionModel: string;
}

function thinking(name: string): ThinkingLevel | undefined {
  const value = process.env[name]?.trim();
  if (!value) return undefined;
  if (!(THINKING_LEVELS as readonly string[]).includes(value)) {
    throw new ListUploadConfigError(
      `${name} must be one of: ${THINKING_LEVELS.join(", ")}`,
    );
  }
  return value as ThinkingLevel;
}

export function listReaders(): ListReaders {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim();
  if (!apiKey || !model) {
    throw new ListUploadConfigError(
      "The list reader is not set up: GEMINI_API_KEY and GEMINI_MODEL are needed.",
    );
  }
  const visionModel = process.env.GEMINI_VISION_MODEL?.trim() || model;
  const rpm = Number(process.env.GEMINI_RPM ?? "");
  const minIntervalMs = rpm > 0 ? Math.ceil(60_000 / rpm) : 0;

  const executor = (id: string, level: ThinkingLevel | undefined) =>
    new ApiExecutor(
      new GeminiProvider({
        apiKey,
        model: id,
        minIntervalMs,
        ...(level === undefined ? {} : { thinkingLevel: level }),
      }),
    );
  return {
    rows: executor(model, thinking("GEMINI_THINKING")),
    pages: executor(visionModel, thinking("GEMINI_VISION_THINKING")),
    model,
    visionModel,
  };
}
