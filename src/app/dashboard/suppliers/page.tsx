import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { createClient, createAnonClient } from "@/utils/supabase/server";
import SuppliersClient from "./SuppliersClient";

import { getSupplierLogoFallback, getClientLogoFallback } from "@/lib/mock-data";
import { resolveHotelProperty } from "@/lib/properties-data";

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ─── Cached fetchers for global, slow-changing supplier tables ───────────────
// IMPORTANT: createAnonClient() is called INSIDE each factory — do NOT pass
// the Supabase client as an unstable_cache argument. Next.js serialises args
// to build cache keys and the Supabase client has circular references that
// cause JSON.stringify to throw a "Converting circular structure to JSON" error.

const getCachedScoresSummaryFull = unstable_cache(
  async () => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
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
    if (error) console.error("Supabase scores_summary error:", error);
    return data || [];
  },
  ["scores_summary_full"],
  { revalidate: 300, tags: ["scores_summary"] }
);

const getCachedConfidenceSummary = unstable_cache(
  async () => {
    const supabase = createAnonClient();
    const { data, error } = await supabase.from("confidence_summary").select("*");
    if (error) console.error("Supabase confidence_summary error:", error);
    return data || [];
  },
  ["confidence_summary"],
  { revalidate: 300, tags: ["confidence_summary"] }
);

const getCachedConfidenceScoring = unstable_cache(
  async () => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("confidence_scoring")
      .select("supplier, item, score");
    if (error) console.error("Supabase confidence_scoring error:", error);
    return data || [];
  },
  ["confidence_scoring"],
  { revalidate: 300, tags: ["confidence_scoring"] }
);

const getCachedEnterpriseMaster = unstable_cache(
  async () => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("enterprise_master")
      .select("enterprise_id, enterprise_name, logo_path, is_material_innovation_yn, is_womenled_yn, is_craftled_yn, is_cooperative_or_shg_yn, udyam_number");
    if (error) console.error("Supabase enterprise_master error:", error);
    return data || [];
  },
  ["enterprise_master"],
  { revalidate: 300, tags: ["enterprise_master"] }
);

const getCachedSupplierSustainability = unstable_cache(
  async () => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("supplier_sustainability")
      .select("enterprise_id, environmental_certifications, has_lca, has_sustainability_report");
    if (error) console.error("Supabase supplier_sustainability error:", error);
    return data || [];
  },
  ["supplier_sustainability"],
  { revalidate: 300, tags: ["supplier_sustainability"] }
);

const getCachedSupplierSocial = unstable_cache(
  async () => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("supplier_social")
      .select("enterprise_id, social_certifications, health_safety_description");
    if (error) console.error("Supabase supplier_social error:", error);
    return data || [];
  },
  ["supplier_social"],
  { revalidate: 300, tags: ["supplier_social"] }
);

const getCachedSupplierSdgs = unstable_cache(
  async () => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("supplier_sdgs")
      .select("*")
      .order("sdg_number", { ascending: true });
    if (error) console.error("Supabase supplier_sdgs error:", error);
    return data || [];
  },
  ["supplier_sdgs"],
  { revalidate: 300, tags: ["supplier_sdgs"] }
);

export default async function SuppliersServerPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const rawClientId = resolvedSearchParams.clientId;
  const queryClientId =
    typeof rawClientId === "string"
      ? rawClientId
      : Array.isArray(rawClientId)
      ? rawClientId[0]
      : undefined;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("varna_session");

  let session: { clientId: string; clientName: string; isGroup?: boolean } | null = null;
  if (sessionCookie?.value) {
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      // ignore
    }
  }

  if (!session && !queryClientId) {
    redirect("/");
  }

  const clientId = queryClientId || session?.clientId || "CLT-001";
  const fallbackHotel = resolveHotelProperty(clientId);

  const supabase = await createClient();

  try {
    // ─── Fire all queries in parallel ────────────────────────────────────────
    // Per-client query runs uncached (fresh data). All global supplier tables
    // are served from the 5-minute server cache (cookie-free anon client inside).
    const [
      clientData,
      scoresData,
      confidenceSummaryData,
      confidenceScoringData,
      enterpriseMasterData,
      supplierSustainabilityData,
      supplierSocialData,
      supplierSdgsData,
    ] = await Promise.all([
      supabase
        .from("client_master")
        .select("client_name, logo_path, property_type")
        .eq("client_id", clientId)
        .maybeSingle()
        .then((r) => r.data),
      getCachedScoresSummaryFull(),
      getCachedConfidenceSummary(),
      getCachedConfidenceScoring(),
      getCachedEnterpriseMaster(),
      getCachedSupplierSustainability(),
      getCachedSupplierSocial(),
      getCachedSupplierSdgs(),
    ]);

    // Helper: Map certifications and badge flags to badge tags
    const extractSupplierBadges = (name: string, enterpriseId?: string): string[] => {
      const badges: string[] = [];
      const lowerName = name.trim().toLowerCase();

      const sustRow = (supplierSustainabilityData || []).find((s: any) => s.enterprise_id === enterpriseId);
      if (sustRow?.environmental_certifications) {
        sustRow.environmental_certifications.split(",").map((c: string) => c.trim()).forEach((cert: string) => {
          if (cert && !badges.includes(cert)) badges.push(cert);
        });
      }

      const socialRow = (supplierSocialData || []).find((s: any) => s.enterprise_id === enterpriseId);
      if (socialRow?.social_certifications) {
        socialRow.social_certifications.split(",").map((c: string) => c.trim()).forEach((cert: string) => {
          if (cert && !badges.includes(cert)) badges.push(cert);
        });
      }

      const scoringRows = (confidenceScoringData || []).filter((c: any) => {
        if (!c.supplier) return false;
        const sName = c.supplier.trim().toLowerCase();
        return lowerName === sName || lowerName.includes(sName) || sName.includes(lowerName);
      });

      scoringRows.filter((r: any) => (parseFloat(r.score) || 0) > 0).forEach((r: any) => {
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

      const masterRow = (enterpriseMasterData || []).find((m: any) => {
        if (enterpriseId && m.enterprise_id === enterpriseId) return true;
        if (!m.enterprise_name) return false;
        const mName = m.enterprise_name.trim().toLowerCase();
        return lowerName === mName || lowerName.includes(mName) || mName.includes(lowerName);
      });

      if (masterRow) {
        if (masterRow.udyam_number && !badges.some(b => b.toLowerCase().includes("dpiit") || b.toLowerCase().includes("startup"))) badges.push("DPIIT Startup");
        if (masterRow.is_material_innovation_yn === "Y" && !badges.includes("Material Innovation")) badges.push("Material Innovation");
        if (masterRow.is_womenled_yn === "Y" && !badges.includes("Women-Led")) badges.push("Women-Led");
        if (masterRow.is_craftled_yn === "Y" && !badges.includes("Craft-Led")) badges.push("Craft-Led");
      }

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

      return Array.from(new Set(badges));
    };

    // Merge scores_summary with all other supplier data
    const mergedSuppliers = (scoresData || []).map((scoreRow: any) => {
      const name = scoreRow.enterprise_name || "";

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

      const supplierSdgs = (supplierSdgsData || []).filter((s: any) =>
        scoreRow.enterprise_id && s.enterprise_id === scoreRow.enterprise_id
      );

      const lowerSupplier = name.toLowerCase();
      const city = lowerSupplier.includes("bare") ? "Bengaluru" : lowerSupplier.includes("ukhi") ? "Faridabad" : lowerSupplier.includes("kheoni") ? "Indore" : "Bengaluru";
      const state = lowerSupplier.includes("bare") ? "Karnataka" : lowerSupplier.includes("ukhi") ? "Haryana" : lowerSupplier.includes("kheoni") ? "Madhya Pradesh" : "Karnataka";

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

    // Build liveConfidenceData dictionary for checklist hover cards
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
          status = c.item.toLowerCase().includes("certificate") ? "lapsed" : "partial";
        }
        return { item: c.item, status, score: numericScore };
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

    const clientName = clientData?.client_name || fallbackHotel.clientName || session?.clientName || "The Astor Dubai";
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
