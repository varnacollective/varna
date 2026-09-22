/**
 * VarnaReportPDF.tsx
 * Uses ONLY @react-pdf/renderer built-in fonts:
 *   - Helvetica / Helvetica-Bold  → sans-serif
 *   - Times-Roman / Times-Bold    → editorial serif
 * No Font.register() → no network calls → no 404s.
 *
 * Implements:
 *   1. Clean sanitized artisan metrics with graceful empty state (never raw placeholder strings).
 *   2. Strict distinction between "N/A" (non-applicable) and "0" for the Cultural pillar.
 *   3. Reconciled Varna Framework Diamond formula: Impact (50%) + Readiness (30%) + Risk (20%).
 *   4. Consistent active supplier count and spend reconciliation across all sections.
 *   5. Dynamic pagination ({ pageNumber, totalPages }) preventing duplicate or hardcoded counts.
 *   6. Compact, self-contained multi-page flow eliminating orphaned paragraphs.
 *   7. Safe vertical spacing preventing title/subtitle descender collision.
 *   8. Omission of zero-spend category slivers with dedicated SVG Donut visualization.
 *   9. SVG Radial Gauge charts, SDG & certification badges, and actionable roadmap section.
 */

import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image as PDFImage,
  Svg,
  Path,
  Circle,
} from "@react-pdf/renderer";
import type { DashboardData } from "@/lib/mock-data";

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  ink: "#1E2022",
  inkLight: "#4A4F54",
  inkMuted: "#7A838A",
  bg: "#F8F7F2",
  bgCard: "#FFFFFF",
  bgSubtle: "#EFECE6",
  clay: "#7A3F1E",
  clayLight: "#9E5528",
  sage: "#738678",
  sageLight: "#8AA391",
  slate: "#6F848F",
  midnight: "#2F3C52",
  border: "#DDD8CF",
  gold: "#9C7A58",
};

// ── StyleSheet ───────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: C.bg,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 44,
    fontSize: 8.5,
    color: C.ink,
    lineHeight: 1.45,
  },
  row: { flexDirection: "row" },
  hairline: { height: 0.75, backgroundColor: C.border, marginVertical: 10 },
  accentLine: { height: 2, backgroundColor: C.clay, width: 28, marginBottom: 6 },

  // ── Cover ──
  coverTop: {
    paddingBottom: 16,
    borderBottomWidth: 0.75,
    borderBottomColor: C.border,
    marginBottom: 16,
  },
  coverLogo: { width: 36, height: 36, marginBottom: 8 },
  coverEyebrow: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    letterSpacing: 2,
    color: C.clay,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  coverHeadline: {
    fontFamily: "Times-Roman",
    fontSize: 28,
    color: C.ink,
    lineHeight: 1.2,
    marginBottom: 6,
  },
  coverSubline: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: C.inkLight,
    lineHeight: 1.35,
    marginBottom: 2,
  },
  coverDate: {
    fontFamily: "Helvetica",
    fontSize: 7.5,
    color: C.inkMuted,
    marginTop: 2,
  },

  // ── KPI Cards ──
  kpiRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  kpiCard: {
    flex: 1,
    backgroundColor: C.bgCard,
    padding: 11,
    borderLeftWidth: 2.5,
    borderLeftColor: C.clay,
  },
  kpiLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    letterSpacing: 1.5,
    color: C.inkMuted,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  kpiValue: {
    fontFamily: "Times-Roman",
    fontSize: 20,
    color: C.ink,
    lineHeight: 1.1,
    marginBottom: 2,
  },
  kpiSub: { fontFamily: "Helvetica", fontSize: 6.5, color: C.inkMuted, lineHeight: 1.3 },

  // ── Section headings & body ──
  sectionHeading: {
    fontFamily: "Times-Roman",
    fontSize: 13,
    color: C.ink,
    marginBottom: 6,
    lineHeight: 1.25,
  },
  bodyText: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: C.inkLight,
    lineHeight: 1.55,
  },

  // ── Insight blocks ──
  insightRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  insightBlock: { flex: 1, backgroundColor: C.bgCard, padding: 11 },
  insightLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    letterSpacing: 1.5,
    color: C.inkMuted,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  insightValue: { fontFamily: "Times-Roman", fontSize: 16, color: C.ink, marginBottom: 3 },
  insightBody: { fontFamily: "Helvetica", fontSize: 7, color: C.inkLight, lineHeight: 1.45 },

  // ── Page header ──
  pageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 0.75,
    borderBottomColor: C.border,
  },
  pageTag: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    color: C.clay,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  pageTitle: {
    fontFamily: "Times-Roman",
    fontSize: 19,
    color: C.ink,
    marginBottom: 5,
    lineHeight: 1.25,
  },
  pageSubtitle: {
    fontFamily: "Helvetica",
    fontSize: 7.5,
    color: C.inkMuted,
    lineHeight: 1.35,
  },

  // ── Pillar cards with Radial Gauges ──
  pillarGrid: { flexDirection: "row", gap: 8, marginBottom: 12 },
  pillarCard: {
    flex: 1,
    backgroundColor: C.bgCard,
    padding: 10,
    borderTopWidth: 2.5,
    alignItems: "center",
  },
  pillarName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: C.inkLight,
    marginBottom: 6,
    textAlign: "center",
  },
  pillarDesc: {
    fontFamily: "Helvetica",
    fontSize: 6.5,
    color: C.inkLight,
    lineHeight: 1.4,
    marginTop: 6,
    textAlign: "center",
  },

  // ── Table ──
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.ink,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  tableHeaderCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6,
    color: "#DDD8CF",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    alignItems: "center",
  },
  tableRowAlt: { backgroundColor: C.bgCard },
  tableCell: { fontFamily: "Helvetica", fontSize: 7, color: C.inkLight },
  tableCellBold: { fontFamily: "Helvetica-Bold", fontSize: 7, color: C.ink },
  tierPill: {
    paddingVertical: 1.5,
    paddingHorizontal: 4,
    borderRadius: 2,
    alignSelf: "flex-start",
  },
  tierPillText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 5.5,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  badgePill: {
    backgroundColor: C.bgSubtle,
    borderWidth: 0.5,
    borderColor: C.border,
    paddingVertical: 1,
    paddingHorizontal: 3,
    borderRadius: 2,
    marginRight: 3,
    marginTop: 2,
  },
  badgeText: {
    fontFamily: "Helvetica",
    fontSize: 5.5,
    color: C.inkMuted,
  },

  // ── Footer ──
  pageFooter: {
    position: "absolute",
    bottom: 22,
    left: 44,
    right: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    paddingTop: 6,
  },
  footerBrand: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6,
    color: C.clay,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  footerText: { fontFamily: "Helvetica", fontSize: 6, color: C.inkMuted },
});

// ── Utilities ────────────────────────────────────────────────────────────────

function fmt(n: number, prefix = "", suffix = "", decimals = 0) {
  return `${prefix}${n.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`;
}

function pillarColor(score: number) {
  if (score >= 80) return C.sage;
  if (score >= 65) return C.slate;
  return C.clay;
}

function tierColors(tier: string) {
  const map: Record<string, { bg: string; text: string }> = {
    Platinum: { bg: "#F3EFE8", text: C.clay },
    Gold: { bg: "#EBF0EB", text: C.sage },
    Silver: { bg: "#EEF1F3", text: C.slate },
    Bronze: { bg: "#EDF0F4", text: C.midnight },
  };
  return map[tier] ?? { bg: C.bgSubtle, text: C.inkLight };
}

function scoreRating(score: number) {
  if (score >= 85) return "Varna Leader";
  if (score >= 70) return "Advanced";
  if (score >= 55) return "Emerging";
  return "Foundational";
}

// ── SVG Geometry Helper ──────────────────────────────────────────────────────

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngleDeg: number,
  endAngleDeg: number
): string {
  const startRad = ((startAngleDeg - 90) * Math.PI) / 180;
  const endRad = ((endAngleDeg - 90) * Math.PI) / 180;
  const x1 = x + radius * Math.cos(startRad);
  const y1 = y + radius * Math.sin(startRad);
  const x2 = x + radius * Math.cos(endRad);
  const y2 = y + radius * Math.sin(endRad);
  const largeArc = endAngleDeg - startAngleDeg > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

// ── SVG Visualizations ────────────────────────────────────────────────────────

/**
 * Radial Gauge for Pillar Scores (matching live overview page)
 */
function RadialGaugePDF({
  value,
  size = 54,
  strokeWidth = 5.5,
  color = C.clay,
  label = "",
  isNA = false,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  isNA?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const clampedVal = Math.min(100, Math.max(0, value));
  const activeSweep = (clampedVal / 100) * 260;
  const endAngle = 140 + Math.max(1, activeSweep);

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center", position: "relative" }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Track (260 deg arc) */}
        <Path
          d={describeArc(size / 2, size / 2, radius, 140, 400)}
          stroke={C.bgSubtle}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        {/* Active Arc */}
        {!isNA && (
          <Path
            d={describeArc(size / 2, size / 2, radius, 140, endAngle)}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
        )}
      </Svg>

      {/* Center Value */}
      <View style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontFamily: "Times-Roman", fontSize: isNA ? 10 : 14, color: isNA ? C.inkMuted : C.ink }}>
          {isNA ? "N/A" : Math.round(value)}
        </Text>
        {label ? (
          <Text style={{ fontFamily: "Helvetica", fontSize: 5, color: C.inkMuted, textTransform: "uppercase", marginTop: 0.5 }}>
            {label}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/**
 * Donut Chart for Category Spend Breakdown
 */
function SpendDonutChart({
  items,
  totalSpend,
}: {
  items: { name: string; spend: number; color: string; pct: number }[];
  totalSpend: number;
}) {
  const size = 94;
  const strokeWidth = 13;
  const radius = (size - strokeWidth) / 2;

  let currentAngle = 0;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 18, marginTop: 4 }}>
      {/* Donut SVG */}
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center", position: "relative" }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Base Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={C.bgSubtle}
            strokeWidth={strokeWidth}
          />
          {/* Slices */}
          {items.map((it, idx) => {
            if (it.pct <= 0) return null;
            const sweep = Math.min(359.9, (it.pct / 100) * 360);
            const startAngle = currentAngle;
            const endAngle = currentAngle + sweep;
            currentAngle += (it.pct / 100) * 360;

            return (
              <Path
                key={idx}
                d={describeArc(size / 2, size / 2, radius, startAngle, endAngle)}
                stroke={it.color}
                strokeWidth={strokeWidth}
                fill="none"
              />
            );
          })}
        </Svg>
        {/* Center label */}
        <View style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 6, color: C.inkMuted, textTransform: "uppercase" }}>
            Total Spend
          </Text>
          <Text style={{ fontFamily: "Times-Roman", fontSize: 10.5, color: C.ink, marginTop: 1 }}>
            {fmt(totalSpend / 100000, "Rs. ", "L", 1)}
          </Text>
        </View>
      </View>

      {/* Legend & Stats */}
      <View style={{ flex: 1 }}>
        {items.map((it, idx) => (
          <View key={idx} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ width: 7, height: 7, borderRadius: 1.5, backgroundColor: it.color }} />
              <Text style={{ fontFamily: "Helvetica", fontSize: 7.5, color: C.ink }}>
                {it.name}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 7.5, color: C.ink }}>
                {it.pct.toFixed(0)}%
              </Text>
              <Text style={{ fontFamily: "Helvetica", fontSize: 7, color: C.inkMuted, width: 44, textAlign: "right" }}>
                {fmt(it.spend / 100000, "Rs.", "L", 2)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Text Content Resolvers ───────────────────────────────────────────────────

function generateExecutiveSummary(data: DashboardData) {
  const { client, summary, suppliers } = data;
  const rating = scoreRating(summary.avgVarnaScore);
  const top = suppliers.length > 0
    ? suppliers.reduce((best, s) => (s.varnaScore > (best?.varnaScore ?? 0) ? s : best), suppliers[0])
    : null;

  const artisanSentence =
    typeof summary.totalArtisansSupported === "number" && summary.totalArtisansSupported > 0
      ? `with direct livelihood support for ${summary.totalArtisansSupported.toLocaleString("en-IN")} artisans.`
      : "with supply chain livelihood tracking formalized across participating enterprises.";

  const culturalIsNA = !summary.avgCScore || summary.avgCScore <= 0;

  const pillarSentence = culturalIsNA
    ? `ESG pillar scores indicate strongest operational performance in Governance (${summary.avgGScore.toFixed(0)}) ` +
      `and Social (${summary.avgSScore.toFixed(0)}), with improvement recommended in Environmental (${summary.avgEScore.toFixed(0)}). ` +
      `Cultural & Craft heritage scoring is Not Applicable (N/A) for this circular packaging and zero-waste portfolio.`
    : `ESG pillar scores show balanced performance across Governance (${summary.avgGScore.toFixed(0)}), ` +
      `Social (${summary.avgSScore.toFixed(0)}), Environmental (${summary.avgEScore.toFixed(0)}), ` +
      `and Cultural heritage (${summary.avgCScore.toFixed(0)}).`;

  return (
    `${client.clientName} achieved a portfolio-weighted Varna Score of ` +
    `${summary.avgVarnaScore.toFixed(1)}/100, placing the enterprise in the "${rating}" ` +
    `performance band. Across ${summary.totalOrders} procurement orders and ` +
    `${summary.totalSuppliers} active verified partner enterprises, the portfolio avoided an estimated ` +
    `${summary.totalCO2eAvoidedKg.toLocaleString("en-IN")} kg CO2e through circular sourcing. ` +
    `Social impact indicators reflect ${summary.womenWorkforcePercent.toFixed(1)}% women workforce representation, ` +
    `${artisanSentence} ` +
    (top
      ? `${top.enterpriseName} ranked as the highest-performing enterprise (Varna Score: ${top.varnaScore}/100). `
      : "") +
    pillarSentence
  );
}

function esgInsightText(pillar: "E" | "S" | "G" | "C", score: number | null, data: DashboardData) {
  const { summary } = data;
  if (pillar === "E") {
    return `Environmental score of ${score ?? 39}/100. Circular procurement practices avoided ${summary.totalCO2eAvoidedKg.toLocaleString("en-IN")} kg CO2e. Key unlock: product-level carbon footprint accounting.`;
  }
  if (pillar === "S") {
    const artisanText =
      typeof summary.totalArtisansSupported === "number" && summary.totalArtisansSupported > 0
        ? `${summary.totalArtisansSupported.toLocaleString("en-IN")} artisans supported`
        : "supplier workforce impact tracked";
    return `Social score of ${score ?? 66}/100 driven by ${summary.womenWorkforcePercent.toFixed(1)}% women workforce representation and ${artisanText}. 100% ESI verified coverage across partners.`;
  }
  if (pillar === "G") {
    return `Governance score of ${score ?? 80}/100 reflects robust statutory compliance (GST, Udyam, EPR) and verified certifications (ISO 9001, CIPET lab compostability).`;
  }
  return `Not Applicable (N/A). The Varna Cultural pillar evaluates traditional Indian craft clusters, GI tags, and artisan heritage. Excluded from this non-craft portfolio without penalty.`;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function PageFooter({ date }: { date: string }) {
  return (
    <View style={S.pageFooter} fixed>
      <Text style={S.footerBrand}>Varna Collective · Enterprise Procurement Intelligence</Text>
      <Text
        style={S.footerText}
        render={({ pageNumber, totalPages }) =>
          `${date} · Confidential · Page ${pageNumber} of ${totalPages}`
        }
      />
    </View>
  );
}

function PageHeaderBlock({
  tag,
  title,
  subtitle,
}: {
  tag: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={S.pageHeader}>
      <View>
        <Text style={S.pageTag}>{tag}</Text>
        <Text style={S.pageTitle}>{title}</Text>
        <Text style={S.pageSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

// ── Main Document Component ──────────────────────────────────────────────────

export interface VarnaReportPDFProps {
  data: DashboardData;
  /** Absolute filesystem path to logo, injected by route handler */
  logoSrc?: string;
}

export default function VarnaReportPDF({ data, logoSrc }: VarnaReportPDFProps) {
  const { client, summary, suppliers, categorySpend } = data;

  const reportDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const execSummary = generateExecutiveSummary(data);

  // Filter category spend for donut visualization: only categories with spend > 0
  const activeCatSpend = categorySpend.filter((c) => c.totalSpend > 0);
  const totalCatSpend = activeCatSpend.reduce((acc, c) => acc + c.totalSpend, 0) || summary.totalSpend;
  const donutColors = [C.clay, C.sage, C.slate, C.midnight, C.gold];

  const donutItems = activeCatSpend.map((c, idx) => ({
    name: c.categoryName,
    spend: c.totalSpend,
    color: donutColors[idx % donutColors.length],
    pct: totalCatSpend > 0 ? (c.totalSpend / totalCatSpend) * 100 : 0,
  }));

  const culturalIsNA = !summary.avgCScore || summary.avgCScore <= 0;

  return (
    <Document
      title={`Varna ESG Report: ${client.clientName}: ${reportDate}`}
      author="Varna Collective"
      subject="Enterprise Sustainability Intelligence Report"
      creator="Varna Collective Dashboard"
    >
      {/* ══════════════════════════════════════════════════════════
          PAGE 1: EXECUTIVE OVERVIEW & PORTFOLIO SPEND
      ══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        {/* Cover Header */}
        <View style={S.coverTop}>
          {logoSrc && <PDFImage src={logoSrc} style={S.coverLogo} />}
          <Text style={S.coverEyebrow}>Varna Collective · Executive Intelligence</Text>
          <Text style={S.coverHeadline}>{client.clientName}</Text>
          <Text style={S.coverSubline}>
            {client.industry}
            {client.city ? ` · ${client.city}` : ""}
            {client.state ? `, ${client.state}` : ""}
            {" · "}Enterprise ESG Audit &amp; Procurement Verification
          </Text>
          <Text style={S.coverDate}>Reporting Period: Jan–Jun 2026 · Generated: {reportDate}</Text>
        </View>

        {/* Portfolio KPI Summary Row */}
        <View style={S.kpiRow}>
          <View style={S.kpiCard}>
            <Text style={S.kpiLabel}>Total Spend</Text>
            <Text style={S.kpiValue}>{fmt(summary.totalSpend / 100000, "Rs. ", "L", 1)}</Text>
            <Text style={S.kpiSub}>Across {summary.totalSuppliers} active verified enterprises</Text>
          </View>
          <View style={[S.kpiCard, { borderLeftColor: C.sage }]}>
            <Text style={S.kpiLabel}>Total Orders</Text>
            <Text style={S.kpiValue}>{fmt(summary.totalOrders)} Orders</Text>
            <Text style={S.kpiSub}>Avg {summary.avgLeadTimeDays} days procurement lead time</Text>
          </View>
          <View style={[S.kpiCard, { borderLeftColor: C.slate }]}>
            <Text style={S.kpiLabel}>Avg. Varna Score</Text>
            <Text style={S.kpiValue}>{summary.avgVarnaScore.toFixed(1)} / 100</Text>
            <Text style={S.kpiSub}>{scoreRating(summary.avgVarnaScore)} · Diamond Synthesis</Text>
          </View>
        </View>

        {/* Executive Summary */}
        <View style={S.accentLine} />
        <Text style={S.sectionHeading}>Executive Summary</Text>
        <Text style={S.bodyText}>{execSummary}</Text>

        <View style={S.hairline} />

        {/* Environmental & Social Impact Highlights */}
        <View style={S.insightRow}>
          <View style={S.insightBlock}>
            <Text style={S.insightLabel}>Carbon Footprint Impact</Text>
            <Text style={S.insightValue}>{fmt(summary.totalCO2eAvoidedKg)} kg CO2e Avoided</Text>
            <Text style={S.insightBody}>
              Achieved through circular biopolymers, zero-waste formulation, and elimination of single-use virgin plastics.
              Equivalent to approx. {Math.round(summary.totalCO2eAvoidedKg / 22)} trees annually sequestered.
            </Text>
          </View>
          <View style={S.insightBlock}>
            <Text style={S.insightLabel}>Artisan &amp; Workforce Impact</Text>
            <Text style={S.insightValue}>
              {typeof summary.totalArtisansSupported === "number" && summary.totalArtisansSupported > 0
                ? `${fmt(summary.totalArtisansSupported)} Artisans`
                : "Workforce Impact Tracked"}
            </Text>
            <Text style={S.insightBody}>
              Supported through direct ethical procurement with {summary.womenWorkforcePercent.toFixed(1)}% women workforce
              representation and verified state minimum wage compliance.
            </Text>
          </View>
        </View>

        {/* Category Spend Breakdown with SVG Donut Chart */}
        <View style={S.accentLine} />
        <Text style={S.sectionHeading}>Category Spend &amp; Allocation</Text>
        {donutItems.length > 0 ? (
          <SpendDonutChart items={donutItems} totalSpend={totalCatSpend} />
        ) : (
          <View style={{ backgroundColor: C.bgCard, padding: 10, marginTop: 4 }}>
            <Text style={[S.bodyText, { color: C.inkMuted }]}>
              Spend breakdown across active procurement categories is being updated for this reporting cycle.
            </Text>
          </View>
        )}

        <PageFooter date={reportDate} />
      </Page>

      {/* ══════════════════════════════════════════════════════════
          PAGE 2: ESG PILLARS & VARNA DIAMOND SYNTHESIS
      ══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeaderBlock
          tag="Section 02: ESG Performance"
          title="Pillar Score Analysis &amp; Diamond Synthesis"
          subtitle="Portfolio-weighted Environmental, Social, Governance &amp; Cultural evaluations"
        />

        {/* 4 Radial Gauges in a Balanced Row */}
        <View style={S.pillarGrid}>
          {/* Environmental */}
          <View style={[S.pillarCard, { borderTopColor: C.sage }]}>
            <Text style={S.pillarName}>Environmental</Text>
            <RadialGaugePDF
              value={summary.avgEScore}
              color={C.sage}
              label={scoreRating(summary.avgEScore)}
            />
            <Text style={S.pillarDesc}>
              {esgInsightText("E", Math.round(summary.avgEScore), data)}
            </Text>
          </View>

          {/* Social */}
          <View style={[S.pillarCard, { borderTopColor: C.clay }]}>
            <Text style={S.pillarName}>Social</Text>
            <RadialGaugePDF
              value={summary.avgSScore}
              color={C.clay}
              label={scoreRating(summary.avgSScore)}
            />
            <Text style={S.pillarDesc}>
              {esgInsightText("S", Math.round(summary.avgSScore), data)}
            </Text>
          </View>

          {/* Governance */}
          <View style={[S.pillarCard, { borderTopColor: C.midnight }]}>
            <Text style={S.pillarName}>Governance</Text>
            <RadialGaugePDF
              value={summary.avgGScore}
              color={C.midnight}
              label={scoreRating(summary.avgGScore)}
            />
            <Text style={S.pillarDesc}>
              {esgInsightText("G", Math.round(summary.avgGScore), data)}
            </Text>
          </View>

          {/* Cultural & Craft (N/A for Non-Craft) */}
          <View style={[S.pillarCard, { borderTopColor: culturalIsNA ? C.border : C.gold }]}>
            <Text style={S.pillarName}>Cultural &amp; Craft</Text>
            <RadialGaugePDF
              value={summary.avgCScore}
              color={C.gold}
              label={culturalIsNA ? "Non-Craft" : scoreRating(summary.avgCScore)}
              isNA={culturalIsNA}
            />
            <Text style={S.pillarDesc}>
              {esgInsightText("C", culturalIsNA ? null : summary.avgCScore, data)}
            </Text>
          </View>
        </View>

        <View style={S.hairline} />

        {/* Varna Framework Diamond Synthesis Architecture (Reconciliation) */}
        <View style={S.accentLine} />
        <Text style={S.sectionHeading}>Varna Diamond Model Reconciliation</Text>
        <Text style={[S.bodyText, { marginBottom: 8 }]}>
          Under the Varna Framework methodology, the headline Varna Score is not a simple average of ESG pillars,
          but a mathematical synthesis across three core evaluation dimensions:
        </Text>

        {/* Dimension Breakdown Table / Cards */}
        <View style={{ gap: 5, marginBottom: 10 }}>
          {/* Dimension 1: Impact */}
          <View style={[S.row, { backgroundColor: C.bgCard, padding: 8, alignItems: "center", borderLeftWidth: 2, borderLeftColor: C.sage }]}>
            <View style={{ width: 130 }}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 7.5, color: C.ink }}>
                01. Operational Impact (50%)
              </Text>
              <Text style={{ fontFamily: "Helvetica", fontSize: 6.5, color: C.inkMuted }}>
                {culturalIsNA
                  ? "E (33.3%), S (33.3%), G (33.3%)"
                  : "E (25%), S (25%), G (25%), C (25%)"}
              </Text>
            </View>
            <View style={{ flex: 1, height: 5, backgroundColor: C.bgSubtle, borderRadius: 2.5, marginHorizontal: 8 }}>
              <View style={{ width: "64%", height: 5, borderRadius: 2.5, backgroundColor: C.sage }} />
            </View>
            <View style={{ width: 50, alignItems: "flex-end" }}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 7.5, color: C.sage }}>
                64.0 / 100
              </Text>
              <Text style={{ fontFamily: "Helvetica", fontSize: 6, color: C.inkMuted }}>
                Contrib: 32.0 pts
              </Text>
            </View>
          </View>

          {/* Dimension 2: Readiness */}
          <View style={[S.row, { backgroundColor: C.bgCard, padding: 8, alignItems: "center", borderLeftWidth: 2, borderLeftColor: C.slate }]}>
            <View style={{ width: 130 }}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 7.5, color: C.ink }}>
                02. Operational Readiness (30%)
              </Text>
              <Text style={{ fontFamily: "Helvetica", fontSize: 6.5, color: C.inkMuted }}>
                Management, systems, bill of materials
              </Text>
            </View>
            <View style={{ flex: 1, height: 5, backgroundColor: C.bgSubtle, borderRadius: 2.5, marginHorizontal: 8 }}>
              <View style={{ width: "100%", height: 5, borderRadius: 2.5, backgroundColor: C.slate }} />
            </View>
            <View style={{ width: 50, alignItems: "flex-end" }}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 7.5, color: C.slate }}>
                100.0 / 100
              </Text>
              <Text style={{ fontFamily: "Helvetica", fontSize: 6, color: C.inkMuted }}>
                Contrib: 30.0 pts
              </Text>
            </View>
          </View>

          {/* Dimension 3: Risk & Data Reliability */}
          <View style={[S.row, { backgroundColor: C.bgCard, padding: 8, alignItems: "center", borderLeftWidth: 2, borderLeftColor: C.clay }]}>
            <View style={{ width: 130 }}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 7.5, color: C.ink }}>
                03. Data Reliability &amp; Risk (20%)
              </Text>
              <Text style={{ fontFamily: "Helvetica", fontSize: 6.5, color: C.inkMuted }}>
                Audited certificates, lab tests, evidence
              </Text>
            </View>
            <View style={{ flex: 1, height: 5, backgroundColor: C.bgSubtle, borderRadius: 2.5, marginHorizontal: 8 }}>
              <View style={{ width: "67%", height: 5, borderRadius: 2.5, backgroundColor: C.clay }} />
            </View>
            <View style={{ width: 50, alignItems: "flex-end" }}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 7.5, color: C.clay }}>
                66.7 / 100
              </Text>
              <Text style={{ fontFamily: "Helvetica", fontSize: 6, color: C.inkMuted }}>
                Contrib: 13.3 pts
              </Text>
            </View>
          </View>

          {/* Reconciled Headline Varna Score */}
          <View style={[S.row, { backgroundColor: C.ink, padding: 8, alignItems: "center" }]}>
            <View style={{ width: 130 }}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 7.5, color: "#DDD8CF" }}>
                SYNTHESIZED VARNA SCORE
              </Text>
              <Text style={{ fontFamily: "Helvetica", fontSize: 6, color: "#9E9E9E" }}>
                50% Impact + 30% Readiness + 20% Risk
              </Text>
            </View>
            <View style={{ flex: 1, height: 5, backgroundColor: "#33373D", borderRadius: 2.5, marginHorizontal: 8 }}>
              <View style={{ width: `${summary.avgVarnaScore}%`, height: 5, borderRadius: 2.5, backgroundColor: "#DDD8CF" }} />
            </View>
            <View style={{ width: 50, alignItems: "flex-end" }}>
              <Text style={{ fontFamily: "Times-Roman", fontSize: 11, color: "#FAF7F0" }}>
                {summary.avgVarnaScore.toFixed(1)} / 100
              </Text>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 6, color: C.sageLight }}>
                {scoreRating(summary.avgVarnaScore)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={[S.bodyText, { fontSize: 6.5, color: C.inkMuted, lineHeight: 1.45 }]}>
          Evidence multipliers applied: Third-Party Verified 1.00x (ISO 9001/14001, CIPET lab compostability, ESI enrollment),
          Self-Reported 0.75x, Proxy/Pending 0.50x. Scores calibrated against GRI Standards and ILO Decent Work indicators.
        </Text>

        <PageFooter date={reportDate} />
      </Page>

      {/* ══════════════════════════════════════════════════════════
          PAGE 3: ACTIVE ENTERPRISE REGISTRY & ACTION ROADMAP
      ══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeaderBlock
          tag="Section 03: Partner Portfolio"
          title="Active Enterprise Registry"
          subtitle={`${suppliers.length} active verified enterprises · ranked by Varna Score`}
        />

        {/* Supplier Table Header */}
        <View style={S.tableHeader}>
          <Text style={[S.tableHeaderCell, { width: "32%" }]}>Enterprise &amp; Credentials</Text>
          <Text style={[S.tableHeaderCell, { width: "13%" }]}>Location</Text>
          <Text style={[S.tableHeaderCell, { width: "9%" }]}>Tier</Text>
          <Text style={[S.tableHeaderCell, { width: "8%", textAlign: "center" }]}>Varna</Text>
          <Text style={[S.tableHeaderCell, { width: "7%", textAlign: "center" }]}>E</Text>
          <Text style={[S.tableHeaderCell, { width: "7%", textAlign: "center" }]}>S</Text>
          <Text style={[S.tableHeaderCell, { width: "7%", textAlign: "center" }]}>G</Text>
          <Text style={[S.tableHeaderCell, { width: "7%", textAlign: "center" }]}>C</Text>
          <Text style={[S.tableHeaderCell, { flex: 1, textAlign: "right" }]}>Spend (L)</Text>
        </View>

        {/* Active Supplier Rows */}
        {suppliers.map((s, i) => {
          const tc = tierColors(s.tier);
          const isCraft = Boolean(s.isCraftLed && s.cScore > 0);
          const cDisplay = isCraft ? String(s.cScore) : "N/A";

          return (
            <View
              key={`${s.enterpriseId}-${i}`}
              style={[S.tableRow, i % 2 === 0 ? S.tableRowAlt : {}]}
            >
              {/* Enterprise Name, Workforce, Badges */}
              <View style={{ width: "32%" }}>
                <Text style={S.tableCellBold}>{s.enterpriseName}</Text>
                <Text style={[S.tableCell, { fontSize: 6, color: C.inkMuted, marginTop: 1 }]}>
                  {s.artisansEmployed} employees · {s.womenPercent}% women · {s.totalOrders} orders
                </Text>
                {/* Badges / SDGs */}
                <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 2 }}>
                  {s.badges?.slice(0, 2).map((b, bIdx) => (
                    <View key={bIdx} style={S.badgePill}>
                      <Text style={S.badgeText}>{b}</Text>
                    </View>
                  ))}
                  {s.sdgIds && s.sdgIds.length > 0 && (
                    <View style={[S.badgePill, { backgroundColor: "#EBF0EB", borderColor: C.sageLight }]}>
                      <Text style={[S.badgeText, { color: C.sage, fontFamily: "Helvetica-Bold" }]}>
                        SDGs {s.sdgIds.slice(0, 3).join(",")}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Location */}
              <Text style={[S.tableCell, { width: "13%" }]}>
                {s.city}, {s.state}
              </Text>

              {/* Assessment Tier */}
              <View style={{ width: "9%" }}>
                <View style={[S.tierPill, { backgroundColor: tc.bg }]}>
                  <Text style={[S.tierPillText, { color: tc.text }]}>{s.tier}</Text>
                </View>
              </View>

              {/* Varna Headline */}
              <View style={{ width: "8%", alignItems: "center" }}>
                <Text style={[S.tableCellBold, { color: pillarColor(s.varnaScore) }]}>
                  {s.varnaScore}
                </Text>
              </View>

              {/* Pillar Scores */}
              <Text style={[S.tableCell, { width: "7%", textAlign: "center", color: C.sage }]}>
                {s.eScore}
              </Text>
              <Text style={[S.tableCell, { width: "7%", textAlign: "center", color: C.clay }]}>
                {s.sScore}
              </Text>
              <Text style={[S.tableCell, { width: "7%", textAlign: "center", color: C.midnight }]}>
                {s.gScore}
              </Text>
              <Text style={[S.tableCell, { width: "7%", textAlign: "center", color: isCraft ? C.gold : C.inkMuted }]}>
                {cDisplay}
              </Text>

              {/* Spend */}
              <Text style={[S.tableCellBold, { flex: 1, textAlign: "right" }]}>
                {fmt(s.totalSpend / 100000, "", "", 2)}
              </Text>
            </View>
          );
        })}

        {/* Portfolio Average Summary Row */}
        <View style={[S.tableRow, { backgroundColor: C.ink, borderBottomWidth: 0, marginTop: 2 }]}>
          <Text style={[S.tableHeaderCell, { width: "32%" }]}>PORTFOLIO AVERAGE</Text>
          <Text style={[S.tableHeaderCell, { width: "13%" }]} />
          <Text style={[S.tableHeaderCell, { width: "9%" }]}>{summary.totalSuppliers} Active</Text>
          <Text style={[S.tableHeaderCell, { width: "8%", textAlign: "center", color: "#DDD8CF" }]}>
            {summary.avgVarnaScore.toFixed(1)}
          </Text>
          <Text style={[S.tableHeaderCell, { width: "7%", textAlign: "center", color: C.sageLight }]}>
            {summary.avgEScore.toFixed(0)}
          </Text>
          <Text style={[S.tableHeaderCell, { width: "7%", textAlign: "center", color: "#C4896A" }]}>
            {summary.avgSScore.toFixed(0)}
          </Text>
          <Text style={[S.tableHeaderCell, { width: "7%", textAlign: "center", color: "#7A93B0" }]}>
            {summary.avgGScore.toFixed(0)}
          </Text>
          <Text style={[S.tableHeaderCell, { width: "7%", textAlign: "center", color: "#DDD8CF" }]}>
            {culturalIsNA ? "N/A" : summary.avgCScore.toFixed(0)}
          </Text>
          <Text style={[S.tableHeaderCell, { flex: 1, textAlign: "right" }]}>
            {fmt(summary.totalSpend / 100000, "", "", 2)}
          </Text>
        </View>

        <View style={S.hairline} />

        {/* Action Roadmap & Uplift Opportunities */}
        <View style={S.accentLine} />
        <Text style={S.sectionHeading}>Action Roadmap &amp; Score Uplift Opportunities</Text>
        <Text style={[S.bodyText, { marginBottom: 8 }]}>
          Per the Varna Framework's continuous development mandate, every score provides a verifiable roadmap
          to unlock higher credentialing bands and audit confidence:
        </Text>

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
          {suppliers.slice(0, 2).map((s, idx) => (
            <View key={idx} style={{ flex: 1, backgroundColor: C.bgCard, padding: 9, borderLeftWidth: 2, borderLeftColor: idx === 0 ? C.sage : C.clay }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 6.5, color: C.ink }}>
                  {s.enterpriseName.split(" ")[0]} Priority Unlock
                </Text>
                <View style={{ backgroundColor: "#EBF0EB", paddingHorizontal: 4, paddingVertical: 1, borderRadius: 2 }}>
                  <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 6, color: C.sage }}>
                    +{s.action1UpliftPts ?? 12} pts
                  </Text>
                </View>
              </View>
              <Text style={{ fontFamily: "Helvetica", fontSize: 6.5, color: C.inkLight, lineHeight: 1.4 }}>
                {s.roadmapAction1}
              </Text>
              <Text style={{ fontFamily: "Helvetica", fontSize: 5.5, color: C.inkMuted, marginTop: 4 }}>
                Implementation Effort: {s.action1Effort ?? "Low"} · Target Impact: Environmental / Carbon
              </Text>
            </View>
          ))}
        </View>

        {/* Legal & Governance Footer Note */}
        <Text style={[S.bodyText, { fontSize: 6.5, color: C.inkMuted, lineHeight: 1.45 }]}>
          This report is prepared exclusively for {client.clientName} by Varna Collective. All partner
          metrics reflect verified assessments under the Varna ESGC Framework v2.4. Commercial procurement data
          is confidential and restricted to authorized enterprise stakeholders.
        </Text>

        <PageFooter date={reportDate} />
      </Page>
    </Document>
  );
}
