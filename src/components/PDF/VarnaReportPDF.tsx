/**
 * VarnaReportPDF.tsx
 * Uses ONLY @react-pdf/renderer built-in fonts:
 *   - Helvetica / Helvetica-Bold  → replaces Inter
 *   - Times-Roman / Times-Bold    → replaces Cormorant
 * No Font.register() → no network calls → no 404s.
 *
 * Accept a `logoSrc` absolute filesystem path injected by the route handler.
 */

import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image as PDFImage,
} from "@react-pdf/renderer";
import type { DashboardData } from "@/lib/mock-data";

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  ink: "#1E2022",
  inkLight: "#4A4F54",
  inkMuted: "#7A838A",
  bg: "#F8F7F2",
  bgCard: "#FFFFFF",
  bgSubtle: "#F0EEE8",
  clay: "#7A3F1E",
  sage: "#738678",
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
    paddingTop: 40,
    paddingBottom: 52,
    paddingHorizontal: 48,
    fontSize: 9,
    color: C.ink,
    lineHeight: 1.5,
  },
  row: { flexDirection: "row" },
  hairline: { height: 0.75, backgroundColor: C.border, marginVertical: 14 },
  accentLine: { height: 2, backgroundColor: C.clay, width: 28, marginBottom: 8 },

  // ── Cover ──
  coverTop: {
    paddingBottom: 28,
    borderBottomWidth: 0.75,
    borderBottomColor: C.border,
    marginBottom: 24,
  },
  coverLogo: { width: 40, height: 40, marginBottom: 10 },
  coverEyebrow: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 2.5,
    color: C.clay,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  coverHeadline: {
    fontFamily: "Times-Roman",
    fontSize: 32,
    color: C.ink,
    lineHeight: 1.2,
    marginBottom: 4,
  },
  coverSubline: { fontFamily: "Helvetica", fontSize: 10, color: C.inkLight },
  coverDate: { fontFamily: "Helvetica", fontSize: 8, color: C.inkMuted, marginTop: 4 },

  // ── KPI Cards ──
  kpiRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  kpiCard: {
    flex: 1,
    backgroundColor: C.bgCard,
    padding: 14,
    borderLeftWidth: 2.5,
    borderLeftColor: C.clay,
  },
  kpiLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    letterSpacing: 1.8,
    color: C.inkMuted,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  kpiValue: {
    fontFamily: "Times-Roman",
    fontSize: 24,
    color: C.ink,
    lineHeight: 1.1,
    marginBottom: 3,
  },
  kpiSub: { fontFamily: "Helvetica", fontSize: 7, color: C.inkMuted, lineHeight: 1.35 },

  // ── Section headings & body ──
  sectionHeading: {
    fontFamily: "Times-Roman",
    fontSize: 16,
    color: C.ink,
    marginBottom: 8,
  },
  bodyText: {
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: C.inkLight,
    lineHeight: 1.7,
  },

  // ── Insight blocks ──
  insightRow: { flexDirection: "row", gap: 14, marginBottom: 16 },
  insightBlock: { flex: 1, backgroundColor: C.bgCard, padding: 14 },
  insightLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    letterSpacing: 1.6,
    color: C.inkMuted,
    textTransform: "uppercase",
    marginBottom: 5,
  },
  insightValue: { fontFamily: "Times-Roman", fontSize: 18, color: C.ink, marginBottom: 4 },
  insightBody: { fontFamily: "Helvetica", fontSize: 7.5, color: C.inkLight, lineHeight: 1.6 },

  // ── Page header (P2, P3) ──
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
    paddingBottom: 10,
    borderBottomWidth: 0.75,
    borderBottomColor: C.border,
  },
  pageTag: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    color: C.clay,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  pageTitle: { fontFamily: "Times-Roman", fontSize: 20, color: C.ink, marginTop: 2 },
  pageSubtitle: { fontFamily: "Helvetica", fontSize: 7.5, color: C.inkMuted, marginTop: 2 },

  // ── Pillar cards ──
  pillarGrid: { flexDirection: "row", gap: 10, marginBottom: 16 },
  pillarCard: { flex: 1, backgroundColor: C.bgCard, padding: 14, borderTopWidth: 3 },
  pillarName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: C.inkLight,
    marginBottom: 7,
  },
  pillarScoreLarge: { fontFamily: "Times-Roman", fontSize: 34, lineHeight: 1, marginBottom: 3 },
  pillarScoreLabel: { fontFamily: "Helvetica", fontSize: 6.5, color: C.inkMuted, marginBottom: 9 },
  pillarBarBg: { height: 3, backgroundColor: C.bgSubtle, borderRadius: 2, marginBottom: 9 },
  pillarBarFill: { height: 3, borderRadius: 2 },
  pillarDesc: { fontFamily: "Helvetica", fontSize: 7, color: C.inkLight, lineHeight: 1.55 },

  // ── Table ──
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.ink,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    color: "#DDD8CF",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  tableRowAlt: { backgroundColor: C.bgCard },
  tableCell: { fontFamily: "Helvetica", fontSize: 7.5, color: C.inkLight },
  tableCellBold: { fontFamily: "Helvetica-Bold", fontSize: 7.5, color: C.ink },
  tierPill: {
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 2,
    alignSelf: "flex-start",
  },
  tierPillText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  // ── Footer ──
  pageFooter: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  footerBrand: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    color: C.clay,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  footerText: { fontFamily: "Helvetica", fontSize: 6.5, color: C.inkMuted },
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

function executiveSummary(data: DashboardData) {
  const { client, summary, suppliers } = data;
  const rating = scoreRating(summary.avgVarnaScore);
  const top = suppliers.reduce(
    (best, s) => (s.varnaScore > (best?.varnaScore ?? 0) ? s : best),
    suppliers[0]
  );
  return (
    `${client.clientName} achieved a portfolio-weighted Varna Score of ` +
    `${summary.avgVarnaScore.toFixed(1)}/100, placing the enterprise in the "${rating}" ` +
    `performance band. Across ${summary.totalOrders} procurement orders and ` +
    `${summary.totalSuppliers} active supplier enterprises, the portfolio avoided an estimated ` +
    `${summary.totalCO2eAvoidedKg.toLocaleString("en-IN")} kg CO2e through circular sourcing. ` +
    `Social impact indicators show ${summary.womenWorkforcePercent.toFixed(1)}% women workforce ` +
    `representation, with direct livelihood support for ` +
    `${summary.totalArtisansSupported.toLocaleString("en-IN")} artisans. ` +
    (top
      ? `${top.enterpriseName} ranked as the highest-performing enterprise (Varna Score: ${top.varnaScore}/100). `
      : "") +
    `ESG pillar scores indicate strongest performance in Social (${summary.avgSScore.toFixed(0)}) ` +
    `and Cultural (${summary.avgCScore.toFixed(0)}), with improvement recommended in ` +
    `Environmental (${summary.avgEScore.toFixed(0)}) and Governance (${summary.avgGScore.toFixed(0)}).`
  );
}

function esgInsight(pillar: "E" | "S" | "G" | "C", score: number, data: DashboardData) {
  const { summary } = data;
  if (pillar === "E")
    return `Environmental score of ${score}/100. Carbon footprint reduction through circular procurement — ${summary.totalCO2eAvoidedKg.toLocaleString("en-IN")} kg CO2e avoided. Improvement levers include material sustainability and water usage across tier-3 suppliers.`;
  if (pillar === "S")
    return `Social performance of ${score}/100 driven by ${summary.womenWorkforcePercent.toFixed(1)}% women workforce and ${summary.totalArtisansSupported.toLocaleString("en-IN")} artisans supported. Wage-ratio compliance and safety audits remain areas of active monitoring.`;
  if (pillar === "G")
    return `Governance at ${score}/100 indicates strong legal compliance among platinum-tier suppliers, with evidence multipliers applied where third-party audit certification is pending renewal.`;
  return `Cultural heritage score of ${score}/100 captures GI-certified craft processes and climate-vulnerable community sourcing, reflecting Varna's artisan-first procurement mandate.`;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Footer({ page, total, date }: { page: number; total: number; date: string }) {
  return (
    <View style={S.pageFooter} fixed>
      <Text style={S.footerBrand}>Varna Collective · Procurement Intelligence</Text>
      <Text style={S.footerText}>
        {date} · Confidential · Page {page} of {total}
      </Text>
    </View>
  );
}

function PageHeader({ tag, title, subtitle }: { tag: string; title: string; subtitle: string }) {
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

function PillarCard({
  name,
  score,
  color,
  description,
}: {
  name: string;
  score: number;
  color: string;
  description: string;
}) {
  return (
    <View style={[S.pillarCard, { borderTopColor: color }]}>
      <Text style={S.pillarName}>{name}</Text>
      <Text style={[S.pillarScoreLarge, { color }]}>{score}</Text>
      <Text style={S.pillarScoreLabel}>/ 100  {scoreRating(score)}</Text>
      <View style={S.pillarBarBg}>
        <View style={[S.pillarBarFill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
      <Text style={S.pillarDesc}>{description}</Text>
    </View>
  );
}

// ── Main Document ────────────────────────────────────────────────────────────

export interface VarnaReportPDFProps {
  data: DashboardData;
  /** Absolute filesystem path to logo, e.g. path.join(process.cwd(), 'public/varna-logo.svg') */
  logoSrc?: string;
}

export default function VarnaReportPDF({ data, logoSrc }: VarnaReportPDFProps) {
  const { client, summary, suppliers, categorySpend } = data;

  const reportDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const execSummary = executiveSummary(data);
  const topSuppliers = [...suppliers].sort((a, b) => b.varnaScore - a.varnaScore).slice(0, 12);
  const TOTAL_PAGES = 3;

  return (
    <Document
      title={`Varna ESG Report — ${client.clientName} — ${reportDate}`}
      author="Varna Collective"
      subject="Enterprise Sustainability Intelligence Report"
      creator="Varna Collective Dashboard"
    >
      {/* ══════════════════════════════════════════════════════════
          PAGE 1 — COVER & EXECUTIVE SUMMARY
      ══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <View style={S.coverTop}>
          {logoSrc && <PDFImage src={logoSrc} style={S.coverLogo} />}
          <Text style={S.coverEyebrow}>Varna Collective · Enterprise ESG Report</Text>
          <Text style={S.coverHeadline}>{client.clientName}</Text>
          <Text style={S.coverSubline}>
            {client.industry}
            {client.city ? ` · ${client.city}` : ""}
            {client.state ? `, ${client.state}` : ""}
          </Text>
          <Text style={S.coverDate}>Report Date: {reportDate}</Text>
        </View>

        {/* KPI Row */}
        <View style={S.kpiRow}>
          <View style={S.kpiCard}>
            <Text style={S.kpiLabel}>Total Spend</Text>
            <Text style={S.kpiValue}>{fmt(summary.totalSpend / 100000, "Rs.", "L", 1)}</Text>
            <Text style={S.kpiSub}>Across {summary.totalSuppliers} vetted artisanal enterprises</Text>
          </View>
          <View style={[S.kpiCard, { borderLeftColor: C.sage }]}>
            <Text style={S.kpiLabel}>Total Orders</Text>
            <Text style={S.kpiValue}>{fmt(summary.totalOrders)}</Text>
            <Text style={S.kpiSub}>Avg {summary.avgLeadTimeDays} day lead time</Text>
          </View>
          <View style={[S.kpiCard, { borderLeftColor: C.slate }]}>
            <Text style={S.kpiLabel}>Avg. Varna Score</Text>
            <Text style={S.kpiValue}>{summary.avgVarnaScore.toFixed(1)}</Text>
            <Text style={S.kpiSub}>{scoreRating(summary.avgVarnaScore)} · weighted composite</Text>
          </View>
        </View>

        <View style={S.accentLine} />
        <Text style={S.sectionHeading}>Executive Summary</Text>
        <Text style={S.bodyText}>{execSummary}</Text>

        <View style={S.hairline} />

        <View style={S.insightRow}>
          <View style={S.insightBlock}>
            <Text style={S.insightLabel}>Carbon Avoidance</Text>
            <Text style={S.insightValue}>{fmt(summary.totalCO2eAvoidedKg)} kg CO2e</Text>
            <Text style={S.insightBody}>
              Equivalent to approx. {Math.round(summary.totalCO2eAvoidedKg / 22)} trees annually
              sequestered through circular procurement practices.
            </Text>
          </View>
          <View style={S.insightBlock}>
            <Text style={S.insightLabel}>Artisan Livelihoods</Text>
            <Text style={S.insightValue}>{fmt(summary.totalArtisansSupported)} artisans</Text>
            <Text style={S.insightBody}>
              Supported through direct ethical procurement with{" "}
              {summary.womenWorkforcePercent.toFixed(1)}% women workforce representation.
            </Text>
          </View>
        </View>

        {categorySpend.length > 0 && (
          <>
            <View style={S.accentLine} />
            <Text style={[S.sectionHeading, { fontSize: 12, marginBottom: 6 }]}>
              Category Spend Breakdown
            </Text>
            {categorySpend.slice(0, 6).map((cat, i) => (
              <View key={i} style={[S.row, { marginBottom: 6, alignItems: "center", gap: 8 }]}>
                <View style={{ width: "38%" }}>
                  <Text style={[S.bodyText, { color: C.ink }]}>{cat.categoryName}</Text>
                </View>
                <View style={{ flex: 1, height: 3, backgroundColor: C.bgSubtle, borderRadius: 2 }}>
                  <View
                    style={{
                      height: 3,
                      borderRadius: 2,
                      backgroundColor: C.clay,
                      width: `${Math.min(
                        100,
                        (cat.totalSpend / (categorySpend[0]?.totalSpend || 1)) * 100
                      )}%`,
                    }}
                  />
                </View>
                <View style={{ width: "20%", alignItems: "flex-end" }}>
                  <Text style={[S.bodyText, { color: C.inkLight }]}>
                    {fmt(cat.totalSpend / 100000, "Rs.", "L", 1)}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        <Footer page={1} total={TOTAL_PAGES} date={reportDate} />
      </Page>

      {/* ══════════════════════════════════════════════════════════
          PAGE 2 — ESG PILLAR PERFORMANCE
      ══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeader
          tag="Section 02 — ESG Performance"
          title="Pillar Score Analysis"
          subtitle="Portfolio-weighted Environmental, Social, Governance & Cultural scores"
        />

        <View style={S.pillarGrid}>
          <PillarCard
            name="Environmental"
            score={Math.round(summary.avgEScore)}
            color={C.sage}
            description={esgInsight("E", Math.round(summary.avgEScore), data)}
          />
          <PillarCard
            name="Social"
            score={Math.round(summary.avgSScore)}
            color={C.clay}
            description={esgInsight("S", Math.round(summary.avgSScore), data)}
          />
        </View>
        <View style={S.pillarGrid}>
          <PillarCard
            name="Governance"
            score={Math.round(summary.avgGScore)}
            color={C.midnight}
            description={esgInsight("G", Math.round(summary.avgGScore), data)}
          />
          <PillarCard
            name="Cultural & Craft"
            score={Math.round(summary.avgCScore)}
            color={C.gold}
            description={esgInsight("C", Math.round(summary.avgCScore), data)}
          />
        </View>

        <View style={S.hairline} />

        <Text style={[S.sectionHeading, { fontSize: 13, marginBottom: 10 }]}>
          Pillar Score Comparative Summary
        </Text>

        {[
          { label: "Environmental", score: summary.avgEScore, color: C.sage, weight: "30%" },
          { label: "Social", score: summary.avgSScore, color: C.clay, weight: "30%" },
          { label: "Governance", score: summary.avgGScore, color: C.midnight, weight: "20%" },
          { label: "Cultural & Craft", score: summary.avgCScore, color: C.gold, weight: "20%" },
        ].map((p, i) => (
          <View
            key={i}
            style={[
              S.row,
              { alignItems: "center", gap: 10, marginBottom: 9, backgroundColor: C.bgCard, padding: 10 },
            ]}
          >
            <View style={{ width: 84 }}>
              <Text style={S.insightLabel}>{p.label}</Text>
              <Text style={[S.bodyText, { fontSize: 7, color: C.inkMuted }]}>
                Weight: {p.weight}
              </Text>
            </View>
            <View style={{ flex: 1, height: 6, backgroundColor: C.bgSubtle, borderRadius: 3 }}>
              <View
                style={{ width: `${p.score}%`, height: 6, borderRadius: 3, backgroundColor: p.color }}
              />
            </View>
            <View style={{ width: 32, alignItems: "flex-end" }}>
              <Text style={[S.tableCellBold, { color: p.color }]}>{p.score.toFixed(0)}</Text>
            </View>
            <View style={{ width: 72 }}>
              <Text style={[S.bodyText, { fontSize: 7, color: C.inkMuted }]}>
                {scoreRating(p.score)}
              </Text>
            </View>
          </View>
        ))}

        <View style={S.hairline} />

        <Text style={[S.bodyText, { fontSize: 7, color: C.inkMuted, lineHeight: 1.5 }]}>
          Scores are calculated using Varna's proprietary ESGC methodology, applying evidence
          multipliers (Self-Reported 0.75x, Third-Party Verified 1.0x, Proxy 0.50x) and pillar
          weightings calibrated against GRI Standards and ILO Decent Work criteria.
        </Text>

        <Footer page={2} total={TOTAL_PAGES} date={reportDate} />
      </Page>

      {/* ══════════════════════════════════════════════════════════
          PAGE 3 — SUPPLIER PORTFOLIO
      ══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <PageHeader
          tag="Section 03 — Supplier Portfolio"
          title="Active Enterprise Registry"
          subtitle={`${suppliers.length} verified artisanal enterprises · ranked by Varna Score`}
        />

        {/* Table Header */}
        <View style={S.tableHeader}>
          <Text style={[S.tableHeaderCell, { width: "30%" }]}>Enterprise</Text>
          <Text style={[S.tableHeaderCell, { width: "15%" }]}>Location</Text>
          <Text style={[S.tableHeaderCell, { width: "10%" }]}>Tier</Text>
          <Text style={[S.tableHeaderCell, { width: "9%", textAlign: "center" }]}>Varna</Text>
          <Text style={[S.tableHeaderCell, { width: "7%", textAlign: "center" }]}>E</Text>
          <Text style={[S.tableHeaderCell, { width: "7%", textAlign: "center" }]}>S</Text>
          <Text style={[S.tableHeaderCell, { width: "7%", textAlign: "center" }]}>G</Text>
          <Text style={[S.tableHeaderCell, { width: "7%", textAlign: "center" }]}>C</Text>
          <Text style={[S.tableHeaderCell, { flex: 1, textAlign: "right" }]}>Spend (L)</Text>
        </View>

        {topSuppliers.map((s, i) => {
          const tc = tierColors(s.tier);
          return (
            <View
              key={`${s.enterpriseId}-${i}`}
              style={[S.tableRow, i % 2 === 0 ? S.tableRowAlt : {}]}
            >
              <View style={{ width: "30%" }}>
                <Text style={S.tableCellBold}>{s.enterpriseName}</Text>
                <Text style={[S.tableCell, { fontSize: 6.5, color: C.inkMuted }]}>
                  {s.artisansEmployed} artisans · {s.womenPercent}% women
                </Text>
              </View>
              <Text style={[S.tableCell, { width: "15%" }]}>
                {s.city}, {s.state}
              </Text>
              <View style={{ width: "10%" }}>
                <View style={[S.tierPill, { backgroundColor: tc.bg }]}>
                  <Text style={[S.tierPillText, { color: tc.text }]}>{s.tier}</Text>
                </View>
              </View>
              <View style={{ width: "9%", alignItems: "center" }}>
                <Text style={[S.tableCellBold, { color: pillarColor(s.varnaScore) }]}>
                  {s.varnaScore}
                </Text>
              </View>
              <Text style={[S.tableCell, { width: "7%", textAlign: "center", color: C.sage }]}>
                {s.eScore}
              </Text>
              <Text style={[S.tableCell, { width: "7%", textAlign: "center", color: C.clay }]}>
                {s.sScore}
              </Text>
              <Text style={[S.tableCell, { width: "7%", textAlign: "center", color: C.midnight }]}>
                {s.gScore}
              </Text>
              <Text style={[S.tableCell, { width: "7%", textAlign: "center", color: C.gold }]}>
                {s.cScore}
              </Text>
              <Text style={[S.tableCellBold, { flex: 1, textAlign: "right" }]}>
                {fmt(s.totalSpend / 100000, "", "", 1)}
              </Text>
            </View>
          );
        })}

        {/* Totals row */}
        <View style={[S.tableRow, { backgroundColor: C.ink, borderBottomWidth: 0, marginTop: 2 }]}>
          <Text style={[S.tableHeaderCell, { width: "30%" }]}>PORTFOLIO AVERAGE</Text>
          <Text style={[S.tableHeaderCell, { width: "15%" }]} />
          <Text style={[S.tableHeaderCell, { width: "10%" }]}>{summary.totalSuppliers} active</Text>
          <Text style={[S.tableHeaderCell, { width: "9%", textAlign: "center", color: "#DDD8CF" }]}>
            {summary.avgVarnaScore.toFixed(1)}
          </Text>
          <Text style={[S.tableHeaderCell, { width: "7%", textAlign: "center", color: "#8AA391" }]}>
            {summary.avgEScore.toFixed(0)}
          </Text>
          <Text style={[S.tableHeaderCell, { width: "7%", textAlign: "center", color: "#C4896A" }]}>
            {summary.avgSScore.toFixed(0)}
          </Text>
          <Text style={[S.tableHeaderCell, { width: "7%", textAlign: "center", color: "#7A93B0" }]}>
            {summary.avgGScore.toFixed(0)}
          </Text>
          <Text style={[S.tableHeaderCell, { width: "7%", textAlign: "center", color: "#BFAB93" }]}>
            {summary.avgCScore.toFixed(0)}
          </Text>
          <Text style={[S.tableHeaderCell, { flex: 1, textAlign: "right" }]}>
            {fmt(summary.totalSpend / 100000, "", "", 1)}
          </Text>
        </View>

        <View style={S.hairline} />

        <Text style={[S.bodyText, { fontSize: 7, color: C.inkMuted, lineHeight: 1.5 }]}>
          This report is prepared exclusively for {client.clientName} by Varna Collective and
          contains commercially sensitive procurement intelligence. Not for distribution without
          prior written consent. Scores are composite assessments per the Varna ESGC framework v2.4.
        </Text>

        <Footer page={3} total={TOTAL_PAGES} date={reportDate} />
      </Page>
    </Document>
  );
}
