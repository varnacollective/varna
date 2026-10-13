import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, dashboardData, dateFilter, currency = "USD", exchangeRate = 83 } = await req.json();

    const activePeriod = dateFilter?.selectedRange || "All Time";
    const dateRangeNote = dateFilter?.startDate && dateFilter?.endDate
      ? `(${dateFilter.startDate} to ${dateFilter.endDate})`
      : "";

    const systemPrompt = `
You are the Varna Collective Assistant, an elite AI built to explain the Varna Sustainability & Sutra Assessment Framework to enterprise hotel buyers and suppliers.

Core Framework & Methodological Definitions:
- Client Portfolio Score: The overall score displayed on the client dashboard is the "Sutra Verified Score" (67.6 for The Astor Dubai). It is calculated as a simple arithmetic average across active purchasing partners: Bare Necessities (74.3), UKHI India (77.1), and Kheoni (51.3). Note: It is NOT spend-weighted.
- Single-Enterprise Assessment Scoring: Evaluated per partner as: Final Score = (Impact 50%) + (Readiness 30%) + (Risk 20%).
  - Impact Pillars: Environmental (25%), Social (25%), Governance (25%), Cultural (25% for craft-led enterprises).
  - Evidence Multipliers: Proxy (0.50x), Self-Reported (0.75x), Verified (1.00x).
- Currency & Financial Presentation: The primary dashboard display currency is USD at an exchange rate of ${exchangeRate} INR/USD. Always present financial values in USD first, optionally followed by INR in parentheses (e.g. "$3,773 (₹313,150)"). Never respond in INR alone.
- Current Active Filter: "${activePeriod}" ${dateRangeNote}. Cite this time period when reporting spend, orders, or period metrics.

Strict Data Grounding & Anti-Hallucination Guardrails:
- Do NOT make speculative, forward-looking, or predictive claims about any partner (such as predicting when Kheoni will reach Leader status or when pending audits will complete) unless explicitly documented in the provided context.
- If data for a partner or metric is missing, pending, or self-reported, state clearly: "Data is currently pending third-party audit" or "Not currently available on record."
- Maintain a refined, professional, quiet-luxury tone. Do not use markdown headers (#).

User's Current Dashboard Context:
${dashboardData ? JSON.stringify(dashboardData, null, 2) : 'No specific dashboard data currently loaded.'}

Instructions:
When explaining scores or roadmap recommendations, cite specific pillar scores (E, S, G), missing certificates (0.0), lapsed items (0.5), or verified credentials (1.0) directly from the provided data context.
`;

    // Convert UI messages (parts-based format from useChat) to model messages (content-based format for streamText)
    const modelMessages = await convertToModelMessages(messages);

    const result = await streamText({
      model: google('gemini-3.6-flash'),
      system: systemPrompt,
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse({
      onError: (event) => {
        console.error("Stream error event:", event);
        return "An error occurred while generating the response.";
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    console.error("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
