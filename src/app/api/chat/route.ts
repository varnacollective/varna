/**
 * POST /api/chat
 *
 * Security fixes applied:
 *   F10 – Requires a valid signed session (401 if unauthenticated).
 *   F10 – Rate-limited: max 20 req / min per IP.
 *   F10 – Hardcoded client figures removed from system prompt.
 *   F10 – dashboardData from POST body is IGNORED; instead, tenant data is
 *          fetched server-side from Supabase using the verified session clientId.
 *   F10 – AI is instructed to cite exact records and abstain if data is absent.
 */

import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages } from "ai";
import { type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/utils/supabase/admin";
import { createRateLimiter } from "@/lib/rate-limiter";

export const maxDuration = 30;

// ── Rate limiter: 20 req / min per IP ────────────────────────────────────────
const chatRateLimiter = createRateLimiter({ maxRequests: 20, windowMs: 60_000 });

// ── Tenant data fetcher ───────────────────────────────────────────────────────

async function fetchTenantData(
  clientId: string,
  role: string,
  parentGroup: string | null
) {
  const supabase = createAdminClient();

  // For group users, query by parentGroup; for superadmin query all (limited).
  const isGroup = role === "group";
  const isSuperAdmin = role === "superadmin";

  // client_summary
  const summaryQuery = supabase.from("client_summary").select(
    "client_id, client_name, total_spend, total_orders, avg_varna_score, " +
    "avg_e_score, avg_s_score, avg_g_score, avg_c_score, " +
    "total_co2e_avoided_kg, total_artisans_supported, women_workforce_percent, " +
    "total_suppliers, avg_lead_time_days"
  );

  const { data: summary } = isSuperAdmin
    ? await summaryQuery.limit(10)
    : await summaryQuery.eq("client_id", clientId);

  // supplier_detail_by_client
  const supplierQuery = supabase.from("supplier_detail_by_client").select(
    "client_id, enterprise_name, tier, varna_score, e_score, s_score, g_score, c_score, " +
    "total_spend, total_orders, city, state, artisans_employed, women_percent"
  );

  const { data: suppliers } = isGroup
    ? await supplierQuery
        .eq("parent_group", parentGroup ?? clientId)
        .limit(50)
    : isSuperAdmin
    ? await supplierQuery.limit(50)
    : await supplierQuery.eq("client_id", clientId).limit(50);

  // category_spend_by_client
  const categoryQuery = supabase.from("category_spend_by_client").select(
    "client_id, category_name, total_spend, total_orders, avg_varna_score"
  );
  const { data: categorySpend } = isSuperAdmin
    ? await categoryQuery.limit(30)
    : await categoryQuery.eq("client_id", clientId).limit(30);

  // order_register
  const orderQuery = supabase.from("order_register").select(
    "client_id, order_number, order_date, supplier_name, order_value, " +
    "fulfilment_status, evidence_status"
  );
  const { data: orders } = isSuperAdmin
    ? await orderQuery.order("order_date", { ascending: false }).limit(20)
    : await orderQuery
        .eq("client_id", clientId)
        .order("order_date", { ascending: false })
        .limit(20);

  return { summary, suppliers, categorySpend, orders };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── Rate limiting ──────────────────────────────────────────────────────────
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const { allowed, remaining, resetAt } = chatRateLimiter.check(ip);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait before trying again." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  // ── Auth ───────────────────────────────────────────────────────────────────
  const session = await getSession();
  if (!session) {
    return new Response(
      JSON.stringify({ error: "Unauthorised. Please log in to use the assistant." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { messages, dateFilter, currency = "USD", exchangeRate = 83 } =
      await req.json();
    // NOTE: `dashboardData` from the client body is intentionally ignored.

    const activePeriod = dateFilter?.selectedRange || "All Time";
    const dateRangeNote =
      dateFilter?.startDate && dateFilter?.endDate
        ? `(${dateFilter.startDate} to ${dateFilter.endDate})`
        : "";

    // ── Fetch server-side tenant data ─────────────────────────────────────────
    const tenantData = await fetchTenantData(
      session.clientId,
      session.role,
      session.parentGroup
    );

    const systemPrompt = `
You are the Varna Collective Assistant, an elite AI built to explain the Varna Sustainability & Sutra Assessment Framework to enterprise hotel buyers and suppliers.

Core Framework & Methodological Definitions:
- Single-Enterprise Assessment Scoring: Final Score = (Impact 50%) + (Readiness 30%) + (Risk 20%).
  - Impact Pillars: Environmental (E), Social (S), Governance (G), Cultural (C) — each contributing equally within Impact.
  - Evidence Multipliers: Proxy = 0.50×, Self-Reported = 0.75×, Third-Party Verified = 1.00×.
- Currency & Financial Presentation: Primary display currency is ${currency} at ${exchangeRate} INR/${currency}. Present financial values in ${currency} first, optionally followed by INR in parentheses.
- Current Active Filter: "${activePeriod}" ${dateRangeNote}. Cite this time period when reporting spend, orders, or period metrics.

Strict Data Grounding & Anti-Hallucination Guardrails:
- ONLY use the verified tenant data provided below. Do NOT invent, extrapolate, or use prior knowledge about specific partner scores, spend figures, or portfolio metrics.
- If data for a partner or metric is missing or pending, state clearly: "Data is currently pending" or "Not available on record."
- Do NOT make speculative or forward-looking predictions.
- Maintain a refined, professional tone. Do not use markdown headers (#).
- If a question asks for data outside the tenant's verified scope, state: "That information is outside your authorised data scope."

Verified Tenant Context (session: ${session.clientId}, role: ${session.role}):
${JSON.stringify(tenantData, null, 2)}

Instructions:
When explaining scores or roadmap recommendations, cite specific pillar scores (E, S, G, C), evidence status, or specific partner records directly from the Verified Tenant Context above.
`;

    const modelMessages = await convertToModelMessages(messages);

    const result = await streamText({
      model: google("gemini-2.0-flash"),
      system: systemPrompt,
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse({
      headers: { "X-RateLimit-Remaining": String(remaining) },
      onError: (event) => {
        console.error("Stream error event:", event);
        return "An error occurred while generating the response.";
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
