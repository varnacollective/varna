export interface SubCriterionDefinition {
  code: string;
  name: string;
  pillarKey: "E" | "S" | "G" | "C";
  pillarName: string;
  color: string;
}

export interface SubCriterionItem {
  code: string;
  name: string;
  score: number | null | undefined;
  color?: string;
  isUnassessed?: boolean;
}

export const SUB_CRITERIA_DEFINITIONS: Record<string, SubCriterionDefinition> = {
  E1: { code: "E1", name: "Carbon Impact", pillarKey: "E", pillarName: "Environmental", color: "#4C7355" },
  E2: { code: "E2", name: "Material Sustainability", pillarKey: "E", pillarName: "Environmental", color: "#4C7355" },
  E3: { code: "E3", name: "Circularity", pillarKey: "E", pillarName: "Environmental", color: "#4C7355" },
  E4: { code: "E4", name: "Water Management", pillarKey: "E", pillarName: "Environmental", color: "#4C7355" },
  E5: { code: "E5", name: "Pollution Control", pillarKey: "E", pillarName: "Environmental", color: "#4C7355" },
  E6: { code: "E6", name: "Packaging", pillarKey: "E", pillarName: "Environmental", color: "#4C7355" },

  S1: { code: "S1", name: "Employment & Livelihood Impact", pillarKey: "S", pillarName: "Social", color: "#B85333" },
  S2: { code: "S2", name: "Gender Inclusion", pillarKey: "S", pillarName: "Social", color: "#B85333" },
  S3: { code: "S3", name: "Working Conditions & Fair Wages", pillarKey: "S", pillarName: "Social", color: "#B85333" },
  S4: { code: "S4", name: "Health, Safety & Wellbeing", pillarKey: "S", pillarName: "Social", color: "#B85333" },

  G1: { code: "G1", name: "Legal & Regulatory Compliance", pillarKey: "G", pillarName: "Governance", color: "#36424A" },
  G2: { code: "G2", name: "Business Ethics & Honest Dealing", pillarKey: "G", pillarName: "Governance", color: "#36424A" },
  G3: { code: "G3", name: "Responsible Sourcing Basics", pillarKey: "G", pillarName: "Governance", color: "#36424A" },

  C1: { code: "C1", name: "Craft Authenticity & Process Integrity", pillarKey: "C", pillarName: "Cultural", color: "#7A3F1E" },
  C2: { code: "C2", name: "Skill Rarity & GI Status", pillarKey: "C", pillarName: "Cultural", color: "#7A3F1E" },
  C3: { code: "C3", name: "Climate-Vulnerable Community Context", pillarKey: "C", pillarName: "Cultural", color: "#7A3F1E" },
};

export interface SubCriterionConfig {
  code: string;
  name: string;
  color: string;
  dbKey: string;
  candidateKeys: string[];
}

export const PILLAR_SUB_CRITERIA_CONFIG: Record<
  "Environmental" | "Social" | "Governance" | "Cultural",
  SubCriterionConfig[]
> = {
  Environmental: [
    {
      code: "E1",
      name: "Carbon Impact",
      color: "#4C7355",
      dbKey: "e1_eff_score",
      candidateKeys: ["e1_eff_score", "e1_carbon_auto", "E1 Eff Score", "E1 Carbon (auto)", "e1", "car"],
    },
    {
      code: "E2",
      name: "Material Sustainability",
      color: "#4C7355",
      dbKey: "e2_eff_score",
      candidateKeys: ["e2_eff_score", "e2_material_pct_auto", "E2 Eff Score", "E2 Material% (auto)", "e2", "mat"],
    },
    {
      code: "E3",
      name: "Circularity",
      color: "#4C7355",
      dbKey: "e3_eff_score",
      candidateKeys: ["e3_eff_score", "e3_circularity_auto", "E3 Eff Score", "E3 Circularity (auto)", "e3", "cir"],
    },
    {
      code: "E4",
      name: "Water Management",
      color: "#4C7355",
      dbKey: "e4_eff_score",
      candidateKeys: ["e4_eff_score", "e4_water_auto", "E4 Eff Score", "E4 Water (auto)", "e4", "wat"],
    },
    {
      code: "E5",
      name: "Pollution Control",
      color: "#4C7355",
      dbKey: "e5_eff_score",
      candidateKeys: ["e5_eff_score", "e5_pollution_auto", "E5 Eff Score", "E5 Pollution (auto)", "e5", "pol"],
    },
    {
      code: "E6",
      name: "Packaging",
      color: "#4C7355",
      dbKey: "e6_eff_score",
      candidateKeys: ["e6_eff_score", "e6_packaging_auto", "E6 Eff Score", "E6 Packaging (auto)", "e6", "pac"],
    },
  ],
  Social: [
    {
      code: "S1",
      name: "Employment & Livelihood Impact",
      color: "#B85333",
      dbKey: "s1_eff_score",
      candidateKeys: ["s1_eff_score", "s1_employment_auto", "S1 Eff Score", "S1 Employment (auto)", "s1", "emp"],
    },
    {
      code: "S2",
      name: "Gender Inclusion",
      color: "#B85333",
      dbKey: "s2_eff_score",
      candidateKeys: ["s2_eff_score", "s2_gender_auto", "S2 Eff Score", "S2 Gender (auto)", "s2", "gen"],
    },
    {
      code: "S3",
      name: "Working Conditions & Fair Wages",
      color: "#B85333",
      dbKey: "s3_eff_score",
      candidateKeys: ["s3_eff_score", "s3_wages_auto", "S3 Eff Score", "S3 Wages (auto)", "s3", "wor"],
    },
    {
      code: "S4",
      name: "Health, Safety & Wellbeing",
      color: "#B85333",
      dbKey: "s4_eff_score",
      candidateKeys: ["s4_eff_score", "s4_health_auto", "S4 Eff Score", "S4 Health (auto)", "s4", "hea"],
    },
  ],
  Governance: [
    {
      code: "G1",
      name: "Legal & Regulatory Compliance",
      color: "#36424A",
      dbKey: "g1_eff_score",
      candidateKeys: ["g1_eff_score", "g1_legal_auto", "G1 Eff Score", "G1 Legal (auto)", "g1", "leg"],
    },
    {
      code: "G2",
      name: "Business Ethics & Honest Dealing",
      color: "#36424A",
      dbKey: "g2_eff_score",
      candidateKeys: ["g2_eff_score", "g2_ethics_auto", "G2 Eff Score", "G2 Ethics (auto)", "g2", "bus"],
    },
    {
      code: "G3",
      name: "Responsible Sourcing Basics",
      color: "#36424A",
      dbKey: "g3_eff_score",
      candidateKeys: ["g3_eff_score", "g3_sourcing_auto", "G3 Eff Score", "G3 Sourcing (auto)", "g3", "res"],
    },
  ],
  Cultural: [
    {
      code: "C1",
      name: "Craft Authenticity & Process Integrity",
      color: "#7A3F1E",
      dbKey: "c1_eff_score",
      candidateKeys: ["c1_eff_score", "c1_craft_authenticity_auto", "c1_craft_auth_auto", "C1 Eff Score", "C1 Craft Authenticity (auto)", "c1", "cra"],
    },
    {
      code: "C2",
      name: "Skill Rarity & GI Status",
      color: "#7A3F1E",
      dbKey: "c2_eff_score",
      candidateKeys: ["c2_eff_score", "c2_skill_rarity_auto", "C2 Eff Score", "C2 Skill Rarity (auto)", "c2", "ski"],
    },
    {
      code: "C3",
      name: "Climate-Vulnerable Community Context",
      color: "#7A3F1E",
      dbKey: "c3_eff_score",
      candidateKeys: ["c3_eff_score", "c3_climatevulnerable_auto", "C3 Eff Score", "C3 Climate Vulnerable (auto)", "c3", "cli"],
    },
  ],
};

function lookupValue(obj: Record<string, any> | null | undefined, keys: string[]): any {
  if (!obj || typeof obj !== "object") return undefined;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") {
      return obj[k];
    }
  }
  // Check common nested properties
  if (obj.scores_summary && typeof obj.scores_summary === "object") {
    for (const k of keys) {
      if (obj.scores_summary[k] !== undefined && obj.scores_summary[k] !== null && obj.scores_summary[k] !== "") {
        return obj.scores_summary[k];
      }
    }
  }
  if (obj.scoresSummary && typeof obj.scoresSummary === "object") {
    for (const k of keys) {
      if (obj.scoresSummary[k] !== undefined && obj.scoresSummary[k] !== null && obj.scoresSummary[k] !== "") {
        return obj.scoresSummary[k];
      }
    }
  }
  if (obj.supplier_detail_by_client && typeof obj.supplier_detail_by_client === "object") {
    for (const k of keys) {
      if (obj.supplier_detail_by_client[k] !== undefined && obj.supplier_detail_by_client[k] !== null && obj.supplier_detail_by_client[k] !== "") {
        return obj.supplier_detail_by_client[k];
      }
    }
  }
  return undefined;
}

export function getSubCriteriaForPillar(
  pillarKey: "E" | "S" | "G" | "C",
  scores: Record<string, number | undefined | null>
): SubCriterionItem[] {
  const normPillar: "Environmental" | "Social" | "Governance" | "Cultural" =
    pillarKey === "E" ? "Environmental" :
    pillarKey === "S" ? "Social" :
    pillarKey === "G" ? "Governance" : "Cultural";

  const config = PILLAR_SUB_CRITERIA_CONFIG[normPillar] || [];

  return config.map((cfg) => {
    const rawVal = lookupValue(scores, cfg.candidateKeys);
    const isUnassessed =
      normPillar === "Cultural" &&
      (rawVal === null || rawVal === undefined || rawVal === "N/A" || rawVal === "n/a" || Number(rawVal) === 0 || isNaN(Number(rawVal)));

    const score =
      !isUnassessed && rawVal !== null && rawVal !== undefined && !isNaN(Number(rawVal))
        ? Number(rawVal)
        : null;

    return {
      code: cfg.code,
      name: cfg.name,
      score,
      color: cfg.color,
      isUnassessed,
    };
  });
}

/**
 * Extracts partner-specific sub-criteria items from a scores_summary row or partner record.
 * Normalizes lookups across scores_summary and supplier_detail_by_client columns.
 */
export function getPartnerPillarBreakdown(
  pillarName: "Environmental" | "Social" | "Governance" | "Cultural" | "Carbon Impact" | string,
  scoresSummary?: Record<string, any> | null,
  _partnerIdOrName?: string
): { items: SubCriterionItem[]; pillarScore: number | null } {
  // Normalize pillar name
  const normPillar: "Environmental" | "Social" | "Governance" | "Cultural" =
    pillarName.toLowerCase().includes("env") ? "Environmental" :
    pillarName.toLowerCase().includes("soc") ? "Social" :
    pillarName.toLowerCase().includes("gov") ? "Governance" : "Cultural";

  const config = PILLAR_SUB_CRITERIA_CONFIG[normPillar] || [];
  const effectiveRow = scoresSummary ?? null;

  // Extract pillar score with flexible lookup
  const pillarScoreKeys =
    normPillar === "Environmental" ? ["e_pillar_score", "e_score_auto", "eScore", "e_score"] :
    normPillar === "Social" ? ["s_pillar_score", "s_score_auto", "sScore", "s_score"] :
    normPillar === "Governance" ? ["g_pillar_score", "g_score_auto", "gScore", "g_score"] :
    ["c_pillar_score", "c_score_auto", "cScore", "c_score"];

  const rawPillarScore = lookupValue(effectiveRow, pillarScoreKeys);
  const pillarScore =
    rawPillarScore !== null && rawPillarScore !== undefined && !isNaN(Number(rawPillarScore))
      ? Number(rawPillarScore)
      : null;

  // Extract sub-criteria items using flexible normalized candidate keys
  const items: SubCriterionItem[] = config.map((cfg) => {
    const rawVal = lookupValue(effectiveRow, cfg.candidateKeys);
    const isUnassessed =
      normPillar === "Cultural" &&
      (rawVal === null || rawVal === undefined || rawVal === "N/A" || rawVal === "n/a" || Number(rawVal) === 0 || isNaN(Number(rawVal)));

    const score =
      !isUnassessed && rawVal !== null && rawVal !== undefined && !isNaN(Number(rawVal))
        ? Number(rawVal)
        : null;

    return {
      code: cfg.code,
      name: cfg.name,
      score,
      color: cfg.color,
      isUnassessed,
    };
  });

  return { items, pillarScore };
}
