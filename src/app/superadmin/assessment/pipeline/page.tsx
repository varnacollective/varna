import React from "react";
import { createAdminClient } from "@/utils/supabase/admin";
import { GitBranch } from "lucide-react";
import PipelineClientView from "./PipelineClientView";

export const revalidate = 0;

export default async function AssessmentPipelinePage() {
  const supabase = createAdminClient();

  // Fetch assessment_pipeline joined with supplier & client
  const { data: pipelineData } = await supabase
    .from("assessment_pipeline")
    .select(`
      *,
      partner_suppliers (
        id,
        enterprise_name,
        brand_name,
        contact_person,
        contact_email
      ),
      partner_clients (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
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
            <GitBranch className="w-5 h-5" style={{ color: "var(--sa-accent)" }} />
            <h1 className="sa-page-title">Assessment Pipeline</h1>
          </div>
          <p style={{ fontSize: "13px", color: "var(--sa-muted)", marginTop: "4px" }}>
            Track partner progression across onboarding, self-assessment submission, evidence verification, and scoring.
          </p>
        </div>
      </div>

      <PipelineClientView initialPipeline={pipelineData || []} />
    </div>
  );
}
