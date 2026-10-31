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
}

export const SUB_CRITERIA_DEFINITIONS: Record<string, SubCriterionDefinition> = {
  E1: { code: "CAR", name: "Carbon Impact", pillarKey: "E", pillarName: "Environmental", color: "#4C7355" },
  E2: { code: "MAT", name: "Material Sustainability", pillarKey: "E", pillarName: "Environmental", color: "#4C7355" },
  E3: { code: "CIR", name: "Circularity", pillarKey: "E", pillarName: "Environmental", color: "#4C7355" },
  E4: { code: "WAT", name: "Water Management", pillarKey: "E", pillarName: "Environmental", color: "#4C7355" },
  E5: { code: "POL", name: "Pollution Control", pillarKey: "E", pillarName: "Environmental", color: "#4C7355" },
  E6: { code: "PAC", name: "Packaging", pillarKey: "E", pillarName: "Environmental", color: "#4C7355" },

  S1: { code: "EMP", name: "Employment & Livelihood Impact", pillarKey: "S", pillarName: "Social", color: "#B85333" },
  S2: { code: "GEN", name: "Gender Inclusion", pillarKey: "S", pillarName: "Social", color: "#B85333" },
  S3: { code: "WOR", name: "Working Conditions & Fair Wages", pillarKey: "S", pillarName: "Social", color: "#B85333" },
  S4: { code: "HEA", name: "Health, Safety & Wellbeing", pillarKey: "S", pillarName: "Social", color: "#B85333" },

  G1: { code: "LEG", name: "Legal & Regulatory Compliance", pillarKey: "G", pillarName: "Governance", color: "#36424A" },
  G2: { code: "BUS", name: "Business Ethics & Honest Dealing", pillarKey: "G", pillarName: "Governance", color: "#36424A" },
  G3: { code: "RES", name: "Responsible Sourcing Basics", pillarKey: "G", pillarName: "Governance", color: "#36424A" },

  C1: { code: "CRA", name: "Craft Authenticity & Process Integrity", pillarKey: "C", pillarName: "Cultural", color: "#7A3F1E" },
  C2: { code: "SKI", name: "Skill Rarity & GI Status", pillarKey: "C", pillarName: "Cultural", color: "#7A3F1E" },
  C3: { code: "CLI", name: "Climate-Vulnerable Community Context", pillarKey: "C", pillarName: "Cultural", color: "#7A3F1E" },
};

export const PILLAR_SUB_CRITERIA_CONFIG = {
  Environmental: [
    { code: "CAR", dbKey: "e1_eff_score", name: "Carbon Impact", color: "#4C7355" },
    { code: "MAT", dbKey: "e2_eff_score", name: "Material Sustainability", color: "#4C7355" },
    { code: "CIR", dbKey: "e3_eff_score", name: "Circularity", color: "#4C7355" },
    { code: "WAT", dbKey: "e4_eff_score", name: "Water Management", color: "#4C7355" },
    { code: "POL", dbKey: "e5_eff_score", name: "Pollution Control", color: "#4C7355" },
    { code: "PAC", dbKey: "e6_eff_score", name: "Packaging", color: "#4C7355" },
  ],
  Social: [
    { code: "EMP", dbKey: "s1_eff_score", name: "Employment & Livelihood Impact", color: "#B85333" },
    { code: "GEN", dbKey: "s2_eff_score", name: "Gender Inclusion", color: "#B85333" },
    { code: "WOR", dbKey: "s3_eff_score", name: "Working Conditions & Fair Wages", color: "#B85333" },
    { code: "HEA", dbKey: "s4_eff_score", name: "Health, Safety & Wellbeing", color: "#B85333" },
  ],
  Governance: [
    { code: "LEG", dbKey: "g1_eff_score", name: "Legal & Regulatory Compliance", color: "#36424A" },
    { code: "BUS", dbKey: "g2_eff_score", name: "Business Ethics & Honest Dealing", color: "#36424A" },
    { code: "RES", dbKey: "g3_eff_score", name: "Responsible Sourcing Basics", color: "#36424A" },
  ],
  Cultural: [
    { code: "CRA", dbKey: "c1_eff_score", name: "Craft Authenticity & Process Integrity", color: "#7A3F1E" },
    { code: "SKI", dbKey: "c2_eff_score", name: "Skill Rarity & GI Status", color: "#7A3F1E" },
    { code: "CLI", dbKey: "c3_eff_score", name: "Climate-Vulnerable Community Context", color: "#7A3F1E" },
  ],
};

/**
 * KNOWN_SUPPLIER_SCORES removed (Fix F11).
 * All scores must be read from the canonical `scores_summary` table in Supabase.
 * Use server-side queries in Server Components or Route Handlers — never hardcode
 * pillar/sub-criteria scores in the frontend.
 *
 * Canonical Sutra formula (server-side only):
 *   Final Varna Score = (0.50 × Impact) + (0.30 × Readiness) + (0.20 × Risk)
 *   Evidence multipliers: Proxy=0.50, Self-Reported=0.75, Third-Party Verified=1.00
 *
 * DB columns: readiness_score, risk_score, impact_score, final_varna_score,
 *             e_pillar_score, s_pillar_score, g_pillar_score, c_pillar_score,
 *             e1_eff_score … e6_eff_score, s1_eff_score … s4_eff_score,
 *             g1_eff_score … g3_eff_score, c1_eff_score … c3_eff_score
 */

export function getSubCriteriaForPillar(
  pillarKey: "E" | "S" | "G" | "C",
  scores: Record<string, number | undefined | null>
): SubCriterionItem[] {
  const codes = Object.keys(SUB_CRITERIA_DEFINITIONS).filter(
    (code) => SUB_CRITERIA_DEFINITIONS[code].pillarKey === pillarKey
  );

  return codes.map((code) => {
    const def = SUB_CRITERIA_DEFINITIONS[code];
    const scoreKey = code.toLowerCase();
    const rawVal = scores[scoreKey] ?? scores[code] ?? scores[def.code.toLowerCase()];
    const score = rawVal != null && !isNaN(Number(rawVal)) ? Number(rawVal) : null;
    return {
      code: def.code,
      name: def.name,
      score,
      color: def.color,
    };
  });
}

/**
 * Extracts partner-specific sub-criteria items from a scores_summary row.
 *
 * The `scoresSummary` MUST come from a server-side Supabase query of the
 * `scores_summary` table — never from hardcoded frontend fallbacks.
 * If the row is missing, items will have score=null (displayed as "–" in UI).
 */
export function getPartnerPillarBreakdown(
  pillarName: "Environmental" | "Social" | "Governance" | "Cultural" | "Carbon Impact" | string,
  scoresSummary?: Record<string, any> | null,
  _partnerIdOrName?: string  // kept for API compatibility, no longer used for mock lookup
): { items: SubCriterionItem[]; pillarScore: number | null } {
  // Normalize pillar name: in DB the 4th pillar is Cultural, in UI sometimes called Carbon Impact
  const normPillar: "Environmental" | "Social" | "Governance" | "Cultural" =
    pillarName.toLowerCase().includes("env") ? "Environmental" :
    pillarName.toLowerCase().includes("soc") ? "Social" :
    pillarName.toLowerCase().includes("gov") ? "Governance" : "Cultural";

  const config = PILLAR_SUB_CRITERIA_CONFIG[normPillar] || [];

  // Use only the passed scoresSummary — no hardcoded fallback.
  const effectiveRow = scoresSummary ?? null;

  // Extract pillar score
  const pillarScoreKey =
    normPillar === "Environmental" ? "e_pillar_score" :
    normPillar === "Social" ? "s_pillar_score" :
    normPillar === "Governance" ? "g_pillar_score" : "c_pillar_score";

  const rawPillarScore = effectiveRow?.[pillarScoreKey];
  const pillarScore =
    rawPillarScore !== null && rawPillarScore !== undefined && !isNaN(Number(rawPillarScore))
      ? Number(rawPillarScore)
      : null;

  // Extract sub-criteria items
  const items: SubCriterionItem[] = config.map((cfg) => {
    let rawVal: any = effectiveRow?.[cfg.dbKey];
    if (rawVal === undefined || rawVal === null) {
      // check alternate keys like e1, s1, g1, c1
      const shortCode = cfg.dbKey.split("_")[0];
      rawVal = effectiveRow?.[shortCode];
    }

    const score =
      rawVal !== null && rawVal !== undefined && !isNaN(Number(rawVal))
        ? Number(rawVal)
        : null;

    return {
      code: cfg.code,
      name: cfg.name,
      score,
      color: cfg.color,
    };
  });

  return { items, pillarScore };
}
