import { unstable_cache } from "next/cache";
import { createAnonClient } from "@/utils/supabase/server";
import { getSupplierLogoFallback } from "@/lib/mock-data";

export interface AuthoritativePartner {
  enterprise_id: string;
  enterprise_name: string;
  legal_name?: string;
  logo_path?: string | null;
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  tier: string;
  totalSpend?: number;
  totalOrders?: number;
  hasClientOrders: boolean;
  final_varna_score: number;
  e_pillar_score: number;
  s_pillar_score: number;
  g_pillar_score: number;
  c_pillar_score: number;
  overall_assessor_summary: string;
  sdg_alignments: any[];
  sdg_objects: any[];
  confidence_pct: number;
  confidence_summary: any;
  badges: string[];
  scores_summary: any;
  womenPercent?: number;
  wageRatio?: number;
  artisansEmployed?: number;
}

export interface PartnerTierCount {
  tier: string;
  count: number;
  color: string;
}

export interface AuthoritativePartnersResult {
  partners: AuthoritativePartner[];
  totalPartners: number;
  tierDistribution: PartnerTierCount[];
  supplierImpactData: { name: string; womenPct: number; wageRatio: number }[];
  avgGenderPct: number;
  liveConfidenceData: Record<string, any>;
}

// ─── Cached Global Fetchers (Cookie-Free Anon Client) ───────────────────────

export const getCachedAuthoritativeScores = unstable_cache(
  async () => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("scores_summary")
      .select(`
        enterprise_id, enterprise_name, logo_path, final_varna_score, tier, band,
        e_pillar_score, s_pillar_score, g_pillar_score, c_pillar_score,
        e1_eff_score, e2_eff_score, e3_eff_score, e4_eff_score, e5_eff_score, e6_eff_score,
        s1_eff_score, s2_eff_score, s3_eff_score, s4_eff_score,
        g1_eff_score, g2_eff_score, g3_eff_score,
        c1_eff_score, c2_eff_score, c3_eff_score,
        is_craftled, overall_assessor_summary, sdg_alignments
      `)
      .order("enterprise_id", { ascending: true });
    if (error) console.error("Supabase scores_summary error:", error);
    return data || [];
  },
  ["authoritative_scores_summary_full"],
  { revalidate: 300, tags: ["scores_summary"] }
);

export const getCachedAuthoritativeEnterpriseMaster = unstable_cache(
  async () => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("enterprise_master")
      .select("enterprise_id, enterprise_name, logo_path, is_material_innovation_yn, is_womenled_yn, is_craftled_yn, is_cooperative_or_shg_yn, udyam_number, district, state, country, latitude, longitude")
      .order("enterprise_id", { ascending: true });
    if (error) console.error("Supabase enterprise_master error:", error);
    return data || [];
  },
  ["authoritative_enterprise_master"],
  { revalidate: 300, tags: ["enterprise_master"] }
);

export const getCachedAuthoritativeAssessmentInputs = unstable_cache(
  async () => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("assessment_inputs")
      .select("enterprise_id, enterprise_name_auto, tier_used_auto, s1_employment_input_worker_count, s2_gender_input_pct_women, s3_wages_input_wage_ratio")
      .order("enterprise_id", { ascending: true });
    if (error) console.error("Supabase assessment_inputs error:", error);
    return data || [];
  },
  ["authoritative_assessment_inputs"],
  { revalidate: 300, tags: ["assessment_inputs"] }
);

export const getCachedAuthoritativeConfidenceSummary = unstable_cache(
  async () => {
    const supabase = createAnonClient();
    const { data, error } = await supabase.from("confidence_summary").select("*");
    if (error) console.error("Supabase confidence_summary error:", error);
    return data || [];
  },
  ["authoritative_confidence_summary"],
  { revalidate: 300, tags: ["confidence_summary"] }
);

export const getCachedAuthoritativeConfidenceScoring = unstable_cache(
  async () => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("confidence_scoring")
      .select("supplier, item, score");
    if (error) console.error("Supabase confidence_scoring error:", error);
    return data || [];
  },
  ["authoritative_confidence_scoring"],
  { revalidate: 300, tags: ["confidence_scoring"] }
);

export const getCachedAuthoritativeSustainability = unstable_cache(
  async () => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("supplier_sustainability")
      .select("enterprise_id, environmental_certifications, has_lca, has_sustainability_report");
    if (error) console.error("Supabase supplier_sustainability error:", error);
    return data || [];
  },
  ["authoritative_supplier_sustainability"],
  { revalidate: 300, tags: ["supplier_sustainability"] }
);

export const getCachedAuthoritativeSocial = unstable_cache(
  async () => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("supplier_social")
      .select("enterprise_id, social_certifications, health_safety_description");
    if (error) console.error("Supabase supplier_social error:", error);
    return data || [];
  },
  ["authoritative_supplier_social"],
  { revalidate: 300, tags: ["supplier_social"] }
);

export const getCachedAuthoritativeSdgs = unstable_cache(
  async () => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("supplier_sdgs")
      .select("*")
      .order("sdg_number", { ascending: true });
    if (error) console.error("Supabase supplier_sdgs error:", error);
    return data || [];
  },
  ["authoritative_supplier_sdgs"],
  { revalidate: 300, tags: ["supplier_sdgs"] }
);

// ─── Single Source of Truth Builder ──────────────────────────────────────────

export async function getAuthoritativePartnersForClient(
  clientId: string,
  clientSuppliersLinks: any[] = []
): Promise<AuthoritativePartnersResult> {
  const [
    scoresData,
    enterpriseMasterData,
    assessmentData,
    confidenceSummaryData,
    confidenceScoringData,
    supplierSustainabilityData,
    supplierSocialData,
    supplierSdgsData,
  ] = await Promise.all([
    getCachedAuthoritativeScores(),
    getCachedAuthoritativeEnterpriseMaster(),
    getCachedAuthoritativeAssessmentInputs(),
    getCachedAuthoritativeConfidenceSummary(),
    getCachedAuthoritativeConfidenceScoring(),
    getCachedAuthoritativeSustainability(),
    getCachedAuthoritativeSocial(),
    getCachedAuthoritativeSdgs(),
  ]);

  // Helper: extract badge tags
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

  // Build liveConfidenceData dictionary
  const liveConfidenceData: Record<string, any> = {};

  // Build the Authoritative Partner list across all 10 verified enterprises
  const partners: AuthoritativePartner[] = scoresData.map((scoreRow: any) => {
    const name = scoreRow.enterprise_name || "";
    const lowerSupplier = name.toLowerCase();

    // Check if client has historical orders with this partner
    const linkRow = (clientSuppliersLinks || []).find((l: any) =>
      (scoreRow.enterprise_id && l.enterprise_id === scoreRow.enterprise_id) ||
      (l.enterprise_name_auto && name.toLowerCase().includes(l.enterprise_name_auto.toLowerCase()))
    );

    const hasClientOrders = Boolean(linkRow && (Number(linkRow.orders_inr_ytd_auto) > 0 || Number(linkRow.units_ytd_auto) > 0));
    const totalSpend = linkRow?.orders_inr_ytd_auto != null ? Number(linkRow.orders_inr_ytd_auto) : 0;
    const totalOrders = linkRow?.units_ytd_auto != null ? Number(linkRow.units_ytd_auto) : 0;

    const masterRow = (enterpriseMasterData || []).find((m: any) => {
      if (scoreRow.enterprise_id && m.enterprise_id === scoreRow.enterprise_id) return true;
      if (!m.enterprise_name) return false;
      const mName = m.enterprise_name.trim().toLowerCase();
      const eName = name.trim().toLowerCase();
      return eName === mName || eName.includes(mName) || mName.includes(eName);
    });

    const assessRow = (assessmentData || []).find((a: any) => {
      if (scoreRow.enterprise_id && a.enterprise_id === scoreRow.enterprise_id) return true;
      if (!a.enterprise_name_auto) return false;
      const aName = a.enterprise_name_auto.trim().toLowerCase();
      const eName = name.trim().toLowerCase();
      return eName === aName || eName.includes(aName) || aName.includes(eName);
    });

    const confidenceRow = (confidenceSummaryData || []).find((c: any) => {
      if (!c.supplier) return false;
      const sName = c.supplier.trim().toLowerCase();
      const eName = name.trim().toLowerCase();
      return eName === sName || eName.includes(sName) || sName.includes(eName);
    });

    const supplierSdgs = (supplierSdgsData || []).filter((s: any) =>
      scoreRow.enterprise_id && s.enterprise_id === scoreRow.enterprise_id
    );

    const fallback = lowerSupplier.includes("bare")
      ? { city: "Bengaluru", state: "Karnataka", lat: 12.9767936, lng: 77.590082, country: "India" }
      : lowerSupplier.includes("ukhi")
      ? { city: "Faridabad", state: "Haryana", lat: 28.4031478, lng: 77.3105561, country: "India" }
      : lowerSupplier.includes("kheoni")
      ? { city: "Indore", state: "Madhya Pradesh", lat: 22.7203616, lng: 75.8681996, country: "India" }
      : { city: "Bengaluru", state: "Karnataka", lat: 12.9767936, lng: 77.590082, country: "India" };

    const city = masterRow?.district || fallback.city;
    const state = masterRow?.state || fallback.state;
    const country = masterRow?.country || fallback.country;
    const latitude = masterRow?.latitude ?? fallback.lat;
    const longitude = masterRow?.longitude ?? fallback.lng;
    const logoPath = scoreRow.logo_path || masterRow?.logo_path || getSupplierLogoFallback(name);
    const tier = linkRow?.tier_auto || scoreRow.tier || assessRow?.tier_used_auto || "Micro A";
    const confidencePct = confidenceRow?.confidence_pct ?? 0;

    // Build checklist for this supplier
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
      eScore: scoreRow.e_pillar_score,
      sScore: scoreRow.s_pillar_score,
      gScore: scoreRow.g_pillar_score,
      cScore: scoreRow.c_pillar_score,
      checklist,
    };

    const womenPercent = assessRow?.s2_gender_input_pct_women != null ? Number(assessRow.s2_gender_input_pct_women) : undefined;
    const wageRatio = assessRow?.s3_wages_input_wage_ratio != null ? Number(assessRow.s3_wages_input_wage_ratio) : undefined;
    const artisansEmployed = assessRow?.s1_employment_input_worker_count != null ? Number(assessRow.s1_employment_input_worker_count) : undefined;

    return {
      enterprise_id: scoreRow.enterprise_id,
      enterprise_name: name,
      logo_path: logoPath,
      city,
      state,
      country,
      latitude,
      longitude,
      tier,
      totalSpend,
      totalOrders,
      hasClientOrders,
      final_varna_score: scoreRow.final_varna_score ?? 0,
      e_pillar_score: scoreRow.e_pillar_score ?? 0,
      s_pillar_score: scoreRow.s_pillar_score ?? 0,
      g_pillar_score: scoreRow.g_pillar_score ?? 0,
      c_pillar_score: scoreRow.c_pillar_score ?? 0,
      overall_assessor_summary: scoreRow.overall_assessor_summary || "",
      sdg_alignments: scoreRow.sdg_alignments || [],
      sdg_objects: supplierSdgs,
      confidence_pct: confidencePct,
      confidence_summary: confidenceRow || null,
      badges: extractSupplierBadges(name, scoreRow.enterprise_id),
      scores_summary: scoreRow,
      womenPercent,
      wageRatio,
      artisansEmployed,
    };
  });

  // Calculate tier distribution across all 10 verified partners
  const tierCounts: Record<string, number> = {
    "Micro A": 0,
    "Micro B": 0,
    Small: 0,
    Medium: 0,
  };

  partners.forEach((p) => {
    const t = p.tier;
    if (t.includes("Micro A")) tierCounts["Micro A"]++;
    else if (t.includes("Micro B")) tierCounts["Micro B"]++;
    else if (t.includes("Small")) tierCounts["Small"]++;
    else if (t.includes("Medium")) tierCounts["Medium"]++;
    else tierCounts["Micro A"]++;
  });

  const tierDistribution: PartnerTierCount[] = [
    { tier: "Micro A", count: tierCounts["Micro A"], color: "#55705A" },
    { tier: "Micro B", count: tierCounts["Micro B"], color: "#7D3F1E" },
    { tier: "Small", count: tierCounts["Small"], color: "#6F8391" },
    { tier: "Medium", count: tierCounts["Medium"], color: "#2B3A55" },
  ];

  // Build supplierImpactData for Social Livelihood Impact widget
  const supplierImpactData = (assessmentData && assessmentData.length > 0
    ? assessmentData
    : partners.map(p => ({
        enterprise_name_auto: p.enterprise_name,
        s2_gender_input_pct_women: p.womenPercent || 50,
        s3_wages_input_wage_ratio: p.wageRatio || 1.05,
      }))
  ).map((row: any) => ({
    name: row.enterprise_name_auto || row.name,
    womenPct: Number(row.s2_gender_input_pct_women) || 0,
    wageRatio: Number(row.s3_wages_input_wage_ratio) || 1.05,
  }));

  const validGenderPctValues = supplierImpactData
    .map((s) => s.womenPct)
    .filter((v) => !isNaN(v) && v > 0);

  const avgGenderPct = validGenderPctValues.length > 0
    ? Math.round(validGenderPctValues.reduce((a, b) => a + b, 0) / validGenderPctValues.length)
    : 68;

  return {
    partners,
    totalPartners: partners.length,
    tierDistribution,
    supplierImpactData,
    avgGenderPct,
    liveConfidenceData,
  };
}
