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
  score: number;
  color: string;
}

export const SUB_CRITERIA_DEFINITIONS: Record<string, SubCriterionDefinition> = {
  E1: { code: "E1", name: "Carbon Footprint Audit", pillarKey: "E", pillarName: "Environmental", color: "#556B55" },
  E2: { code: "E2", name: "Sustainable Raw Materials", pillarKey: "E", pillarName: "Environmental", color: "#556B55" },
  E3: { code: "E3", name: "Circularity & Waste Reduction", pillarKey: "E", pillarName: "Environmental", color: "#556B55" },
  E4: { code: "E4", name: "Water Conservation & Recycling", pillarKey: "E", pillarName: "Environmental", color: "#556B55" },
  E5: { code: "E5", name: "Non-Toxic & Chemical Safety", pillarKey: "E", pillarName: "Environmental", color: "#556B55" },
  E6: { code: "E6", name: "Zero Waste Packaging Standards", pillarKey: "E", pillarName: "Environmental", color: "#556B55" },

  S1: { code: "S1", name: "Fair Employment Contracts", pillarKey: "S", pillarName: "Social", color: "#B85333" },
  S2: { code: "S2", name: "Gender Inclusion & Equity", pillarKey: "S", pillarName: "Social", color: "#B85333" },
  S3: { code: "S3", name: "Fair Living Wage Compliance", pillarKey: "S", pillarName: "Social", color: "#B85333" },
  S4: { code: "S4", name: "Workplace Health & Safety", pillarKey: "S", pillarName: "Social", color: "#B85333" },

  G1: { code: "G1", name: "Legal & Regulatory Compliance", pillarKey: "G", pillarName: "Governance", color: "#2A3644" },
  G2: { code: "G2", name: "Ethics & Responsible Sourcing", pillarKey: "G", pillarName: "Governance", color: "#2A3644" },
  G3: { code: "G3", name: "Supply Chain Audit Transparency", pillarKey: "G", pillarName: "Governance", color: "#2A3644" },

  C1: { code: "C1", name: "Craft Authenticity & Heritage", pillarKey: "C", pillarName: "Cultural", color: "#A89C82" },
  C2: { code: "C2", name: "Rare Skill Preservation", pillarKey: "C", pillarName: "Cultural", color: "#A89C82" },
  C3: { code: "C3", name: "Climate Vulnerability Mitigation", pillarKey: "C", pillarName: "Cultural", color: "#A89C82" },
};

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
    const score = scores[scoreKey] ?? scores[code] ?? 60;
    return {
      code: def.code,
      name: def.name,
      score: typeof score === "number" ? Math.round(score) : 60,
      color: def.color,
    };
  });
}
