import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SuppliersClient from "./SuppliersClient";

export default async function SuppliersServerPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("varna_session");

  if (!sessionCookie?.value) {
    redirect("/");
  }

  const supabase = await createClient();

  let session: { clientId: string; clientName: string };
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    redirect("/");
  }

  const clientId = session.clientId;

  try {
    // 1. Fetch scores_summary (all active suppliers)
    const { data: scoresData, error: scoresError } = await supabase
      .from("scores_summary")
      .select("enterprise_id, enterprise_name, final_varna_score, e_pillar_score, s_pillar_score, g_pillar_score, c_pillar_score, overall_assessor_summary, sdg_alignments");

    if (scoresError) {
      console.error("Supabase scores_summary error:", scoresError);
    }

    // 2. Fetch confidence_summary
    const { data: confidenceSummaryData, error: confidenceSummaryError } = await supabase
      .from("confidence_summary")
      .select("*");

    if (confidenceSummaryError) {
      console.error("Supabase confidence_summary error:", confidenceSummaryError);
    }

    // 3. Fetch confidence_scoring (for detailed checklists)
    const { data: confidenceScoringData, error: confidenceScoringError } = await supabase
      .from("confidence_scoring")
      .select("*");

    if (confidenceScoringError) {
      console.error("Supabase confidence_scoring error:", confidenceScoringError);
    }

    // 4. Merge scores_summary and confidence_summary in JS/TS by matching enterprise_name to supplier
    const mergedSuppliers = (scoresData || []).map((scoreRow: any) => {
      const name = scoreRow.enterprise_name || "";

      // Match enterprise_name (scores_summary) to supplier (confidence_summary)
      const confidenceRow = (confidenceSummaryData || []).find((c: any) => {
        if (!c.supplier) return false;
        const sName = c.supplier.trim().toLowerCase();
        const eName = name.trim().toLowerCase();
        return eName === sName || eName.includes(sName) || sName.includes(eName);
      });

      return {
        enterprise_id: scoreRow.enterprise_id,
        enterprise_name: name,
        final_varna_score: scoreRow.final_varna_score ?? 0,
        e_pillar_score: scoreRow.e_pillar_score ?? 0,
        s_pillar_score: scoreRow.s_pillar_score ?? 0,
        g_pillar_score: scoreRow.g_pillar_score ?? 0,
        c_pillar_score: scoreRow.c_pillar_score ?? 0,
        overall_assessor_summary: scoreRow.overall_assessor_summary || "",
        sdg_alignments: scoreRow.sdg_alignments || [],
        confidence_pct: confidenceRow?.confidence_pct ?? 0,
        confidence_summary: confidenceRow || null,
      };
    });

    // 5. Build liveConfidenceData dictionary for checklist hover cards
    const liveConfidenceData: Record<string, any> = {};

    mergedSuppliers.forEach((supplierRow: any) => {
      const name = supplierRow.enterprise_name;
      const confidencePct = supplierRow.confidence_pct;

      const scoringRows = (confidenceScoringData || []).filter((c: any) => {
        if (!c.supplier) return false;
        const sName = c.supplier.trim().toLowerCase();
        const eName = name.trim().toLowerCase();
        return eName === sName || eName.includes(sName) || sName.includes(eName);
      });

      const checklist = scoringRows.map((c: any) => {
        let status = "missing";
        const numericScore = parseFloat(c.score) || 0;
        
        if (numericScore === 1) status = "verified";
        else if (numericScore > 0 && numericScore < 1) {
          if (c.item.toLowerCase().includes("certificate")) {
            status = "lapsed";
          } else {
            status = "partial";
          }
        }

        return {
          item: c.item,
          status,
          score: numericScore,
        };
      });

      const passedCount = checklist.filter((c: any) => c.score === 1).length;
      const totalChecks = checklist.length;
      
      liveConfidenceData[name] = {
        supplierName: name,
        score: confidencePct,
        totalConfirmed: `${passedCount} of ${totalChecks} tracked data points confirmed`,
        status: confidencePct >= 60 ? "Verified" : "Lapsed",
        eScore: supplierRow.e_pillar_score,
        sScore: supplierRow.s_pillar_score,
        gScore: supplierRow.g_pillar_score,
        cScore: supplierRow.c_pillar_score,
        checklist,
      };
    });

    return <SuppliersClient suppliersData={mergedSuppliers} liveConfidenceData={liveConfidenceData} />;
  } catch (error) {
    console.error("Suppliers Server Component error:", error);
    redirect("/");
  }
}
