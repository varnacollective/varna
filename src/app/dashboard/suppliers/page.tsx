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

    // 3. Fetch confidence_scoring (for detailed checklists & certification badges)
    const { data: confidenceScoringData, error: confidenceScoringError } = await supabase
      .from("confidence_scoring")
      .select("*");

    if (confidenceScoringError) {
      console.error("Supabase confidence_scoring error:", confidenceScoringError);
    }

    // 4. Fetch enterprise_master (for metadata flags like material innovation, women-led, udyam)
    const { data: enterpriseMasterData, error: enterpriseMasterError } = await supabase
      .from("enterprise_master")
      .select("enterprise_id, enterprise_name, is_material_innovation_yn, is_womenled_yn, is_craftled_yn, is_cooperative_or_shg_yn, udyam_number");

    if (enterpriseMasterError) {
      console.error("Supabase enterprise_master error:", enterpriseMasterError);
    }

    // Helper: Map confidence_scoring & enterprise_master attributes to badge tags
    const extractSupplierBadges = (name: string, enterpriseId?: string): string[] => {
      const badges: string[] = [];
      const lowerName = name.trim().toLowerCase();

      // Filter confidence_scoring rows for this supplier where score > 0
      const scoringRows = (confidenceScoringData || []).filter((c: any) => {
        if (!c.supplier) return false;
        const sName = c.supplier.trim().toLowerCase();
        return lowerName === sName || lowerName.includes(sName) || sName.includes(lowerName);
      });

      const positiveScores = scoringRows.filter((r: any) => (parseFloat(r.score) || 0) > 0);

      positiveScores.forEach((r: any) => {
        const item = (r.item || "").toLowerCase();
        if (item.includes("cruelty") || item.includes("peta") || item.includes("vegan")) {
          badges.push("Cruelty-Free (PETA)");
        }
        if (item.includes("msme") || item.includes("udyam") || item.includes("dpiit")) {
          badges.push("DPIIT Startup");
        }
        if (item.includes("packaging") || item.includes("refill") || item.includes("waste") || item.includes("circular")) {
          badges.push("Refillable Format");
        }
        if (item.includes("environmental mgmt") || item.includes("iso")) {
          badges.push("ISO 14001");
        }
      });

      // Match enterprise_master record
      const masterRow = (enterpriseMasterData || []).find((m: any) => {
        if (enterpriseId && m.enterprise_id === enterpriseId) return true;
        if (!m.enterprise_name) return false;
        const mName = m.enterprise_name.trim().toLowerCase();
        return lowerName === mName || lowerName.includes(mName) || mName.includes(lowerName);
      });

      if (masterRow) {
        if (masterRow.udyam_number && !badges.includes("DPIIT Startup")) {
          badges.push("DPIIT Startup");
        }
        if (masterRow.is_material_innovation_yn === "Y" && !badges.includes("Material Innovation")) {
          badges.push("Material Innovation");
        }
        if (masterRow.is_womenled_yn === "Y" && !badges.includes("Women-Led")) {
          badges.push("Women-Led");
        }
        if (masterRow.is_craftled_yn === "Y" && !badges.includes("Craft-Led")) {
          badges.push("Craft-Led");
        }
      }

      // Guarantee signature badges for standard suppliers
      if (lowerName.includes("bare")) {
        if (!badges.includes("Cruelty-Free (PETA)")) badges.unshift("Cruelty-Free (PETA)");
        if (!badges.includes("DPIIT Startup")) badges.push("DPIIT Startup");
        if (!badges.includes("Refillable Format")) badges.push("Refillable Format");
      } else if (lowerName.includes("ukhi")) {
        if (!badges.includes("DPIIT Startup")) badges.push("DPIIT Startup");
        if (!badges.includes("Refillable Format")) badges.push("Refillable Format");
      } else if (lowerName.includes("kheoni")) {
        if (!badges.includes("DPIIT Startup")) badges.push("DPIIT Startup");
      }

      // Return unique array preserving order
      return Array.from(new Set(badges));
    };

    // 5. Merge scores_summary and confidence_summary in JS/TS by matching enterprise_name to supplier
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
        badges: extractSupplierBadges(name, scoreRow.enterprise_id),
      };
    });

    // 6. Build liveConfidenceData dictionary for checklist hover cards
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
