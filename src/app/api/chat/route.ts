import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, dashboardData } = await req.json();

    const systemPrompt = `
You are the Varna Collective Assistant, an elite AI built to explain the Varna Sustainability Evaluation Framework to enterprise hotel buyers and suppliers.

Core Framework Rules:
- Final Score = (Impact 50%) + (Readiness 30%) + (Risk 20%).
- Impact = Env (25%), Soc (25%), Gov (25%), Cul (25% for craft-led).
- Evidence Multipliers: Proxy (0.50x), Self-Reported (0.75x), Verified (1.0x).

Score Improvement Strategy:
To improve scores, suppliers should upgrade evidence (e.g., get third-party verification), provide product-level carbon data, formalize registrations (Udyam, GSTIN), and renew lapsed certificates.

User's Current Dashboard Context:
${dashboardData ? JSON.stringify(dashboardData, null, 2) : 'No specific dashboard data currently loaded.'}

Instructions:
If the user asks "Why is my score X?" or "How do I improve?", analyze the 'User's Current Dashboard Context' provided above. Identify specific missing certificates (0.0), lapsed items (0.5), or low pillar scores, and give them exact, actionable business decisions based on their actual data. Maintain a refined, professional, quiet-luxury tone. Do not use markdown headers (#).
`;

    // Convert UI messages (parts-based format from useChat) to model messages (content-based format for streamText)
    const modelMessages = await convertToModelMessages(messages);

    const result = await streamText({
      model: google('gemini-2.0-flash'),
      system: systemPrompt,
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse({
      onError: (event) => {
        console.error("Stream error event:", event);
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    console.error("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
