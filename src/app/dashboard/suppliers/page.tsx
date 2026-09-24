import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SuppliersClient from "./SuppliersClient";

import { getSupplierLogoFallback, getClientLogoFallback } from "@/lib/mock-data";

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
    // 0. Fetch Client Master
    const { data: clientData } = await supabase
      .from("client_master")
      .select("client_name, logo_path, property_type")
      .eq("client_id", clientId)
      .single();

    // 1. Fetch scores_summary (all active suppliers with complete sub-criteria)
    const { data: scoresData, error: scoresError } = await supabase
      .from("scores_summary")
      .select(`
        enterprise_id, enterprise_name, logo_path, final_varna_score,
        e_pillar_score, s_pillar_score, g_pillar_score, c_pillar_score,
        e1_eff_score, e2_eff_score, e3_eff_score, e4_eff_score, e5_eff_score, e6_eff_score,
        s1_eff_score, s2_eff_score, s3_eff_score, s4_eff_score,
        g1_eff_score, g2_eff_score, g3_eff_score,
        c1_eff_score, c2_eff_score, c3_eff_score,
        is_craftled, overall_assessor_summary, sdg_alignments
      `);

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
      .select("enterprise_id, enterprise_name, logo_path, is_material_innovation_yn, is_womenled_yn, is_craftled_yn, is_cooperative_or_shg_yn, udyam_number");

    if (enterpriseMasterError) {
      console.error("Supabase enterprise_master error:", enterpriseMasterError);
    }

    // 5. Fetch supplier_sustainability
    const { data: supplierSustainabilityData, error: sustError } = await supabase
      .from("supplier_sustainability")
      .select("enterprise_id, environmental_certifications, has_lca, has_sustainability_report");

    if (sustError) {
      console.error("Supabase supplier_sustainability error:", sustError);
    }

    // 6. Fetch supplier_social
    const { data: supplierSocialData, error: socialError } = await supabase
      .from("supplier_social")
      .select("enterprise_id, social_certifications, health_safety_description");

    if (socialError) {
      console.error("Supabase supplier_social error:", socialError);
    }

    // Helper: Map confidence_scoring, enterprise_master, supplier_sustainability & supplier_social attributes to badge tags
    const extractSupplierBadges = (name: string, enterpriseId?: string): string[] => {
      const badges: string[] = [];
      const lowerName = name.trim().toLowerCase();

      // Match supplier_sustainability record
      const sustRow = (supplierSustainabilityData || []).find((s: any) => s.enterprise_id === enterpriseId);
      if (sustRow?.environmental_certifications) {
        const envCerts = sustRow.environmental_certifications.split(",").map((c: string) => c.trim());
        envCerts.forEach((cert: string) => {
          if (cert && !badges.includes(cert)) badges.push(cert);
        });
      }

      // Match supplier_social record
      const socialRow = (supplierSocialData || []).find((s: any) => s.enterprise_id === enterpriseId);
      if (socialRow?.social_certifications) {
        const socCerts = socialRow.social_certifications.split(",").map((c: string) => c.trim());
        socCerts.forEach((cert: string) => {
          if (cert && !badges.includes(cert)) badges.push(cert);
        });
      }

      // Filter confidence_scoring rows for this supplier where score > 0
      const scoringRows = (confidenceScoringData || []).filter((c: any) => {
        if (!c.supplier) return false;
        const sName = c.supplier.trim().toLowerCase();
        return lowerName === sName || lowerName.includes(sName) || sName.includes(lowerName);
      });

      const positiveScores = scoringRows.filter((r: any) => (parseFloat(r.score) || 0) > 0);

      positiveScores.forEach((r: any) => {
        const item = (r.item || "").toLowerCase();
        if ((item.includes("cruelty") || item.includes("peta") || item.includes("vegan")) && !badges.some(b => b.toLowerCase().includes("cruelty") || b.toLowerCase().includes("peta"))) {
          badges.push("Cruelty-Free (PETA)");
        }
        if ((item.includes("msme") || item.includes("udyam") || item.includes("dpiit")) && !badges.some(b => b.toLowerCase().includes("dpiit") || b.toLowerCase().includes("startup"))) {
          badges.push("DPIIT Startup");
        }
        if ((item.includes("packaging") || item.includes("refill") || item.includes("waste") || item.includes("circular")) && !badges.some(b => b.toLowerCase().includes("refill"))) {
          badges.push("Refillable Format");
        }
        if (item.includes("environmental mgmt") || (item.includes("iso") && !badges.some(b => b.includes("ISO")))) {
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
        if (masterRow.udyam_number && !badges.some(b => b.toLowerCase().includes("dpiit") || b.toLowerCase().includes("startup"))) {
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
        if (!badges.some(b => b.toLowerCase().includes("cruelty") || b.toLowerCase().includes("peta"))) badges.unshift("Cruelty-Free (PETA)");
        if (!badges.some(b => b.toLowerCase().includes("dpiit") || b.toLowerCase().includes("startup"))) badges.push("DPIIT Startup");
        if (!badges.some(b => b.toLowerCase().includes("refill"))) badges.push("Refillable Format");
      } else if (lowerName.includes("ukhi")) {
        if (!badges.some(b => b.toLowerCase().includes("dpiit") || b.toLowerCase().includes("startup"))) badges.push("DPIIT Startup");
        if (!badges.some(b => b.toLowerCase().includes("refill"))) badges.push("Refillable Format");
      } else if (lowerName.includes("kheoni")) {
        if (!badges.some(b => b.toLowerCase().includes("dpiit") || b.toLowerCase().includes("startup"))) badges.push("DPIIT Startup");
      }

      // Return unique array preserving order
      return Array.from(new Set(badges));
    };

    // 7. Fetch supplier_sdgs
    const { data: supplierSdgsData, error: sdgsError } = await supabase
      .from("supplier_sdgs")
      .select("*")
      .order("sdg_number", { ascending: true });

    if (sdgsError) {
      console.error("Supabase supplier_sdgs error:", sdgsError);
    }

    // 6. Merge scores_summary, confidence_summary, enterprise_master, and supplier_sdgs
    const mergedSuppliers = (scoresData || []).map((scoreRow: any) => {
      const name = scoreRow.enterprise_name || "";

      // Match enterprise_name (scores_summary) to supplier (confidence_summary)
      const confidenceRow = (confidenceSummaryData || []).find((c: any) => {
        if (!c.supplier) return false;
        const sName = c.supplier.trim().toLowerCase();
        const eName = name.trim().toLowerCase();
        return eName === sName || eName.includes(sName) || sName.includes(eName);
      });

      const masterRow = (enterpriseMasterData || []).find((m: any) => {
        if (scoreRow.enterprise_id && m.enterprise_id === scoreRow.enterprise_id) return true;
        if (!m.enterprise_name) return false;
        const mName = m.enterprise_name.trim().toLowerCase();
        const eName = name.trim().toLowerCase();
        return eName === mName || eName.includes(mName) || mName.includes(eName);
      });
      const logoPath = scoreRow.logo_path || masterRow?.logo_path || getSupplierLogoFallback(name);

      const supplierSdgs = (supplierSdgsData || []).filter((s: any) => {
        if (scoreRow.enterprise_id && s.enterprise_id === scoreRow.enterprise_id) return true;
        return false;
      });

      const lowerSupplier = name.toLowerCase();
      const city = lowerSupplier.includes("bare")
        ? "Bengaluru"
        : lowerSupplier.includes("ukhi")
        ? "Faridabad"
        : lowerSupplier.includes("kheoni")
        ? "Indore"
        : "Bengaluru";

      const state = lowerSupplier.includes("bare")
        ? "Karnataka"
        : lowerSupplier.includes("ukhi")
        ? "Haryana"
        : lowerSupplier.includes("kheoni")
        ? "Madhya Pradesh"
        : "Karnataka";

      return {
        enterprise_id: scoreRow.enterprise_id,
        enterprise_name: name,
        logo_path: logoPath,
        city,
        state,
        final_varna_score: scoreRow.final_varna_score ?? 0,
        e_pillar_score: scoreRow.e_pillar_score ?? 0,
        s_pillar_score: scoreRow.s_pillar_score ?? 0,
        g_pillar_score: scoreRow.g_pillar_score ?? 0,
        c_pillar_score: scoreRow.c_pillar_score ?? 0,
        overall_assessor_summary: scoreRow.overall_assessor_summary || "",
        sdg_alignments: scoreRow.sdg_alignments || [],
        sdg_objects: supplierSdgs,
        confidence_pct: confidenceRow?.confidence_pct ?? 0,
        confidence_summary: confidenceRow || null,
        badges: extractSupplierBadges(name, scoreRow.enterprise_id),
        scores_summary: scoreRow,
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

      const totalScoreSum = scoringRows.reduce((acc: number, c: any) => acc + (parseFloat(c.score) || 0), 0);
      const scorePointsStr = totalScoreSum > 0 ? (totalScoreSum % 1 === 0 ? totalScoreSum.toString() : totalScoreSum.toFixed(2)) : "0";

      liveConfidenceData[name] = {
        supplierName: name,
        score: confidencePct,
        totalConfirmed: `${scorePointsStr} of 18 tracked data points confirmed`,
        status: confidencePct >= 60 ? "Verified" : "Self-Reported",
        eScore: supplierRow.e_pillar_score,
        sScore: supplierRow.s_pillar_score,
        gScore: supplierRow.g_pillar_score,
        cScore: supplierRow.c_pillar_score,
        checklist,
      };
    });

    const clientName = clientData?.client_name || session.clientName || "The Astor Dubai";
    const logoPath = clientData?.logo_path || getClientLogoFallback(clientName);

    return (
      <SuppliersClient
        suppliersData={mergedSuppliers}
        liveConfidenceData={liveConfidenceData}
        clientName={clientName}
        logoPath={logoPath}
      />
    );
  } catch (error) {
    console.error("Suppliers Server Component error:", error);
    redirect("/");
  }
}
