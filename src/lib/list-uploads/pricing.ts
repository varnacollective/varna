/**
 * What an upload's AI calls would cost at Google's paid prices, in US dollars
 * per million tokens (thinking tokens are billed as output). Matched by model
 * family, so renamed versions (3.5, 3.6…) keep their price. Update when
 * Google's prices change: https://ai.google.dev/gemini-api/docs/pricing
 */
const PRICES: readonly { family: RegExp; input: number; output: number }[] = [
  { family: /flash-lite/, input: 0.3, output: 2.5 },
  { family: /flash/, input: 1.5, output: 7.5 },
];

export interface TokenUse {
  model: string;
  input_tokens: number;
  output_tokens: number;
}

/** Total in dollars, or null when any call's model has no known price. */
export function paidCostUsd(calls: readonly TokenUse[]): number | null {
  let total = 0;
  for (const call of calls) {
    const price = PRICES.find((p) => p.family.test(call.model.toLowerCase()));
    if (!price) return null;
    total += (call.input_tokens * price.input + call.output_tokens * price.output) / 1_000_000;
  }
  return total;
}
