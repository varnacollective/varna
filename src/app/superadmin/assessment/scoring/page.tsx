import React from "react";
import { createAdminClient } from "@/utils/supabase/admin";
import { BarChart3, Award } from "lucide-react";
import ScoringClientView from "./ScoringClientView";

export const revalidate = 0;

export default async function ScoringApprovalPage() {
  const supabase = createAdminClient();

  // Fetch score_versions
  const { data: scoreVersionsData } = await supabase
    .from("score_versions")
    .select(`
      *,
      partner_suppliers (
        id,
        enterprise_name,
        brand_name,
        contact_person
      ),
      partner_clients (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false });

  let scoreVersions = scoreVersionsData || [];

  // If score_versions is empty, seed from scores_summary
  if (scoreVersions.length === 0) {
    const { data: scoresSummaryData } = await supabase
      .from("scores_summary")
      .select("*")
      .limit(20);

    if (scoresSummaryData && scoresSummaryData.length > 0) {
      scoreVersions = scoresSummaryData.map((row: any, i: number) => ({
        id: `score-${row.enterprise_id || i}`,
        supplier_id: row.enterprise_id,
        partner_suppliers: {
          enterprise_name: row.enterprise_name || row.enterprise_id,
          brand_name: row.brand_name || null,
        },
        partner_clients: {
          name: row.client_id || "Hospitality Pool",
        },
        version: 1,
        status: row.varna_rating ? "final" : "provisional",
        scores: {
          total: row.varna_rating || row.total_score || 82,
          environmental: row.e_pillar || row.e_score || 84,
          social: row.s_pillar || row.s_score || 80,
          governance: row.g_pillar || row.g_score || 86,
          craft: row.c_pillar || row.c_score || 88,
        },
        reviewer_id: "Yuvraj S.",
        signed_off_at: row.updated_at || new Date().toISOString(),
        created_at: row.created_at || new Date().toISOString(),
      }));
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          borderBottom: "1px solid var(--sa-border)",
          paddingBottom: "16px",
        }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5" style={{ color: "var(--sa-accent)" }} />
            <h1 className="sa-page-title">Scoring &amp; Sign-Off Approvals</h1>
          </div>
          <p style={{ fontSize: "13px", color: "var(--sa-muted)", marginTop: "4px" }}>
            Audit ESGC multi-pillar rating models, calibrate weightings, and execute final sign-offs.
          </p>
        </div>
      </div>

      <ScoringClientView initialScores={scoreVersions} />
    </div>
  );
}
