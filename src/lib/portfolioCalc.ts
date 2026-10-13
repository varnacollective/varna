/**
 * portfolioCalc.ts — Single Source of Truth for Portfolio-Level Calculations
 *
 * PORTFOLIO SCORE METHODOLOGY (D06):
 *   Definition: Simple arithmetic mean of `final_varna_score` across all active
 *   purchasing partners for the client (i.e., partners that appear in
 *   `supplier_detail_by_client` with orders_inr_ytd_auto > 0).
 *   Confirmed: CLT-001 has 3 purchasing partners (ENT-001=74.3, ENT-002=77.1,
 *   ENT-003=51.3); simple average = 67.57, matching the DB value of 67.6.
 *   Rounding rule: toFixed(1) → one decimal place.
 *   Exclusions: Partners with no orders for this client are excluded (they are
 *   in the directory but not "active purchasing partners").
 *   Cultural pillar (C) is disabled and excluded from scoring.
 *   This is DIFFERENT from the per-partner 50/30/20 weighting (Impact/Readiness/
 *   Risk) which is a within-partner assessment methodology; the portfolio
 *   aggregation here is a simple average ACROSS partners.
 *
 * WAGE COMPLIANCE METHODOLOGY (D01/D02):
 *   wage_ratio = actual wages paid / statutory minimum wage for the applicable
 *   Indian state/category (sourced from assessment_inputs.s3_wages_input_wage_ratio).
 *   - ratio >= 1.00 → meets statutory minimum wage ("Statutory Min Compliant")
 *   - ratio >= 1.10 → typically considered a "living wage" proxy (no universal
 *     India-wide living wage standard exists; this threshold is advisory only)
 *   - ratio < 1.00 → BELOW statutory minimum (non-compliant)
 *   Portfolio average: simple mean across all partners with wage data.
 *   ⚠ METHODOLOGY NOTE: No verified living-wage benchmark for India is embedded
 *   in this codebase. The "living wage" label on the UI refers to the wage ratio
 *   vs. statutory minimum, not a separately verified living wage standard.
 *   This must be confirmed with the Varna team before presenting as "living wage."
 */

export interface WageComplianceSummary {
  /** Simple average wage ratio across all partners with data */
  avgWageRatio: number;
  /** Number of partners that MEET statutory minimum (ratio >= 1.00) */
  statutoryCompliantCount: number;
  /** Number of partners BELOW statutory minimum (ratio < 1.00) */
  belowStatutoryCount: number;
  /** Partners below statutory minimum, for explicit disclosure */
  belowStatutoryPartners: string[];
  /** Total partners with wage data */
  totalWithWageData: number;
}

/**
 * Compute portfolio wage compliance summary.
 * Call this with supplierImpactData from getAuthoritativePartnersForClient().
 * This is the SINGLE function all UI surfaces should call — never compute
 * wage averages independently in individual components.
 */
export function computeWageCompliance(
  supplierImpactData: Array<{ name: string; wageRatio: number }>
): WageComplianceSummary {
  const withData = supplierImpactData.filter(
    (s) => typeof s.wageRatio === "number" && !isNaN(s.wageRatio)
  );

  if (withData.length === 0) {
    return {
      avgWageRatio: 0,
      statutoryCompliantCount: 0,
      belowStatutoryCount: 0,
      belowStatutoryPartners: [],
      totalWithWageData: 0,
    };
  }

  const sum = withData.reduce((acc, s) => acc + s.wageRatio, 0);
  const avgWageRatio = Math.round((sum / withData.length) * 100) / 100; // 2 decimal places

  const belowStatutoryPartners = withData
    .filter((s) => s.wageRatio < 1.0)
    .map((s) => s.name);

  return {
    avgWageRatio,
    statutoryCompliantCount: withData.filter((s) => s.wageRatio >= 1.0).length,
    belowStatutoryCount: belowStatutoryPartners.length,
    belowStatutoryPartners,
    totalWithWageData: withData.length,
  };
}

/**
 * Compute portfolio-level Sutra Verified Score.
 * Simple arithmetic mean of final_varna_score across active purchasing partners.
 * Uses the same set as supplier_detail_by_client (partners with actual orders).
 * Rounds to 1 decimal place.
 *
 * This function matches what the Supabase view client_summary.avg_varna_score
 * computes: it is a SIMPLE AVERAGE of the 3 purchasing partners' scores,
 * NOT a spend-weighted average.
 */
export function computePortfolioScore(
  activePartners: Array<{ final_varna_score: number }>
): number {
  const valid = activePartners.filter(
    (p) => typeof p.final_varna_score === "number" && !isNaN(p.final_varna_score)
  );
  if (valid.length === 0) return 0;
  const sum = valid.reduce((acc, p) => acc + p.final_varna_score, 0);
  return Math.round((sum / valid.length) * 10) / 10;
}

/**
 * SCORE BAND CLASSIFICATION — Single authoritative function (D08).
 * All components (filter dropdowns, partner cards, charts, legends) MUST use
 * this function, not their own re-implementations.
 * Thresholds mirror VarnaScoreBandScale.tsx's SCORE_BANDS array exactly:
 *   Not Ready:    score < 40
 *   Foundational: 40 ≤ score < 55
 *   Emerging:     55 ≤ score < 70
 *   Advanced:     70 ≤ score < 85
 *   Leader:       score ≥ 85
 * Null/undefined scores → "Unscored" (never counted as Not Ready).
 */
export type ScoreBandName =
  | "Not Ready"
  | "Foundational"
  | "Emerging"
  | "Advanced"
  | "Leader"
  | "Unscored";

export function classifyScoreBand(score: number | null | undefined): ScoreBandName {
  if (score === null || score === undefined || isNaN(Number(score))) return "Unscored";
  const s = Number(score);
  if (s >= 85) return "Leader";
  if (s >= 70) return "Advanced";
  if (s >= 55) return "Emerging";
  if (s >= 40) return "Foundational";
  return "Not Ready";
}

export const SCORE_BAND_COLORS: Record<ScoreBandName, string> = {
  Leader: "#4E7C59",
  Advanced: "#5B7594",
  Emerging: "#8C7F6B",
  Foundational: "#D97706",
  "Not Ready": "#B85333",
  Unscored: "#9A948A",
};
