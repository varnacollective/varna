import React from "react";
import { createAdminClient } from "@/utils/supabase/admin";
import { Flag, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import ReviewQueueClientView from "./ReviewQueueClientView";

export const revalidate = 0;

export default async function ReviewQueuePage() {
  const supabase = createAdminClient();

  const { data: flagsData } = await supabase
    .from("review_queue_flags")
    .select(`
      *,
      partner_clients (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false });

  // Fallback demo items if empty
  let flags = flagsData || [];
  if (flags.length === 0) {
    flags = [
      {
        id: "flag-001",
        type: "document_unreadable",
        source_ref: "GST Registration Certificate",
        description: "Uploaded scan is blurred and GSTIN checksum cannot be verified.",
        status: "open",
        assigned_reviewer_id: "Yuvraj S.",
        created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      {
        id: "flag-002",
        type: "wage_ratio_outlier",
        source_ref: "Self-Assessment Wage Section",
        description: "Reported lowest-to-highest wage ratio exceeds regional living wage benchmark threshold.",
        status: "open",
        assigned_reviewer_id: "Deepa N.",
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: "flag-003",
        type: "missing_mandatory_doc",
        source_ref: "Udyam MSME Certificate",
        description: "Partner marked enterprise as Micro-enterprise but did not attach valid Udyam registration document.",
        status: "corrected",
        assigned_reviewer_id: "Yuvraj S.",
        resolution_reason: "Document uploaded via email and linked manually.",
        created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
        resolved_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      },
    ];
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
            <Flag className="w-5 h-5" style={{ color: "var(--sa-accent)" }} />
            <h1 className="sa-page-title">Review Queue &amp; Flags</h1>
          </div>
          <p style={{ fontSize: "13px", color: "var(--sa-muted)", marginTop: "4px" }}>
            Resolve document anomalies, validation flags, and escalated self-assessment submissions.
          </p>
        </div>
      </div>

      <ReviewQueueClientView initialFlags={flags} />
    </div>
  );
}
