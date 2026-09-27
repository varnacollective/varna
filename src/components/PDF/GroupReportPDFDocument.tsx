import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image as PDFImage,
} from "@react-pdf/renderer";
import type { HotelReportData, GroupRollupData, HotelSupplierReportItem } from "@/lib/group-reports-data";
import { scoreBand, scoreColor } from "@/lib/group-reports-data";

// ── Color Palette ─────────────────────────────────────────────────────────────
const C = {
  ink: "#1A1F26",
  inkLight: "#4A4F54",
  inkMuted: "#6E7781",
  bg: "#FAF8F5",
  bgCard: "#FFFFFF",
  bgSubtle: "#F0ECE1",
  clay: "#7A3F1E",
  clayLight: "#9E5528",
  rust: "#B85333",
  sage: "#556B55",
  sageLight: "#738678",
  slate: "#6F848F",
  midnight: "#2F3C52",
  border: "#DDD8CF",
  gold: "#A89C82",
};

// ── Stylesheet ────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: C.bg,
    paddingTop: 32,
    paddingBottom: 44,
    paddingHorizontal: 36,
    fontSize: 8,
    color: C.ink,
    lineHeight: 1.4,
  },
  row: { flexDirection: "row" },
  hairline: { height: 0.5, backgroundColor: C.border, marginVertical: 8 },
  accentBar: { height: 2, backgroundColor: C.clay, width: 24, marginBottom: 5 },

  // Header & Cover
  headerBlock: {
    paddingBottom: 10,
    borderBottomWidth: 0.75,
    borderBottomColor: C.border,
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  brandLogoTile: {
    width: 28,
    height: 28,
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  brandLogoText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: C.clay,
  },
  brandEyebrow: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    letterSpacing: 1.8,
    color: C.rust,
    textTransform: "uppercase",
  },
  reportTitle: {
    fontFamily: "Times-Roman",
    fontSize: 22,
    color: C.ink,
    marginBottom: 3,
  },
  reportSubtitle: {
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: C.inkLight,
  },
  metaLine: {
    fontFamily: "Helvetica",
    fontSize: 7,
    color: C.inkMuted,
    marginTop: 3,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 8,
    marginTop: 4,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  sectionTitle: {
    fontFamily: "Times-Bold",
    fontSize: 11,
    color: C.ink,
  },
  sectionTag: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6,
    color: C.clay,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },

  // KPI Grid
  kpiRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  kpiCard: {
    flex: 1,
    backgroundColor: C.bgCard,
    padding: 8,
    borderLeftWidth: 2.5,
    borderLeftColor: C.clay,
    borderRadius: 2,
  },
  kpiLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6,
    letterSpacing: 1,
    color: C.inkMuted,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  kpiValue: {
    fontFamily: "Times-Roman",
    fontSize: 16,
    color: C.ink,
    lineHeight: 1.1,
  },
  kpiSub: {
    fontFamily: "Helvetica",
    fontSize: 6,
    color: C.inkMuted,
    marginTop: 2,
  },

  // Narrative / Text Box
  narrativeBox: {
    backgroundColor: C.bgCard,
    padding: 9,
    borderLeftWidth: 2,
    borderLeftColor: C.sage,
    marginBottom: 10,
    borderRadius: 2,
  },
  narrativeText: {
    fontFamily: "Helvetica",
    fontSize: 7.5,
    color: C.inkLight,
    lineHeight: 1.45,
  },

  // Pillar Grid
  pillarGrid: { flexDirection: "row", gap: 7, marginBottom: 10 },
  pillarCard: {
    flex: 1,
    backgroundColor: C.bgCard,
    padding: 8,
    borderTopWidth: 2.5,
    borderRadius: 2,
  },
  pillarName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: C.ink,
    marginBottom: 4,
  },
  pillarScoreValue: {
    fontFamily: "Times-Roman",
    fontSize: 14,
    color: C.ink,
    marginBottom: 2,
  },
  pillarBarTrack: {
    height: 4,
    backgroundColor: C.bgSubtle,
    borderRadius: 2,
    overflow: "hidden",
    marginVertical: 4,
  },
  pillarBarFill: {
    height: 4,
    borderRadius: 2,
  },
  pillarDesc: {
    fontFamily: "Helvetica",
    fontSize: 6,
    color: C.inkMuted,
    lineHeight: 1.35,
    marginTop: 3,
  },

  // Table
  table: {
    backgroundColor: C.bgCard,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: C.border,
    marginBottom: 10,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.midnight,
    paddingVertical: 4.5,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  tableHeaderCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 5.5,
    color: "#FAF8F5",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: "#FDFBF7",
  },
  tableRowTotal: {
    backgroundColor: C.bgSubtle,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  tableCell: {
    fontFamily: "Helvetica",
    fontSize: 6.5,
    color: C.inkLight,
  },
  tableCellBold: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    color: C.ink,
  },

  // Pills / Badges
  badge: {
    paddingVertical: 1.5,
    paddingHorizontal: 4,
    borderRadius: 2,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 5.5,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 14,
    left: 36,
    right: 36,
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    paddingTop: 5,
  },
  footerDisclaimer: {
    fontFamily: "Helvetica",
    fontSize: 5.5,
    color: C.inkMuted,
    lineHeight: 1.3,
  },
  footerBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  footerBrand: {
    fontFamily: "Helvetica-Bold",
    fontSize: 5.5,
    color: C.clay,
    letterSpacing: 0.5,
  },
  footerPageNum: {
    fontFamily: "Helvetica",
    fontSize: 5.5,
    color: C.inkMuted,
  },
});

// ── Sub-Components ────────────────────────────────────────────────────────────

function PageFooterBlock({ date }: { date: string }) {
  return (
    <View style={S.footer} fixed>
      <Text style={S.footerDisclaimer}>
        Varna scores are not certifications. They are evidence-based assessments of the information and documentation provided to Varna at the time of review.
      </Text>
      <View style={S.footerBottomRow}>
        <Text style={S.footerBrand}>
          VARNA COLLECTIVE · ENTERPRISE ESG AUDIT &amp; PROCUREMENT VERIFICATION
        </Text>
        <Text
          style={S.footerPageNum}
          render={({ pageNumber, totalPages }) => `Generated: ${date} · Page ${pageNumber} of ${totalPages}`}
        />
      </View>
    </View>
  );
}

function BandPill({ band }: { band: string }) {
  let bg = "#F0ECE1";
  let text = C.ink;
  if (band === "Varna Leader") {
    bg = "#E8EFE8";
    text = "#3D523D";
  } else if (band === "Advanced") {
    bg = "#E8EEF2";
    text = "#3B5262";
  } else if (band === "Emerging") {
    bg = "#F3EFE6";
    text = "#6B5E43";
  } else if (band === "Foundational") {
    bg = "#F7EAE5";
    text = "#8A3C23";
  } else if (band === "Not Ready") {
    bg = "#F5E5DF";
    text = "#6E2D12";
  }

  return (
    <View style={[S.badge, { backgroundColor: bg }]}>
      <Text style={[S.badgeText, { color: text }]}>{band}</Text>
    </View>
  );
}

// ── Single Hotel Report Page Flow ─────────────────────────────────────────────

function renderHotelPages(data: HotelReportData, reportDate: string, isConsolidated: boolean = false, index: number = 0) {
  const { client, summary, subCriteria, categorySpend, suppliers, orders, executiveSummary } = data;
  const isCraftNA = !summary.cScore || summary.cScore <= 0;

  return (
    <React.Fragment key={client.clientId}>
      {/* ──────────────────────────────────────────────────────────
          HOTEL PAGE 1: COVER & EXECUTIVE PERFORMANCE SUMMARY
      ────────────────────────────────────────────────────────── */}
      <Page size="A4" style={S.page}>
        <View style={S.headerBlock}>
          <View style={S.brandRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
              <View style={S.brandLogoTile}>
                <Text style={S.brandLogoText}>{client.clientName.charAt(0)}</Text>
              </View>
              <View>
                <Text style={S.brandEyebrow}>VARNA COLLECTIVE · ESG INTELLIGENCE</Text>
                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9, color: C.ink }}>
                  {client.parentGroup || "GRP-001 Portfolio"}
                </Text>
              </View>
            </View>
            <BandPill band={summary.band} />
          </View>

          <Text style={S.reportTitle}>{client.clientName}</Text>
          <Text style={S.reportSubtitle}>
            Sustainability &amp; Procurement Impact Report · {client.propertyType} · {client.city}, {client.country}
          </Text>
          <Text style={S.metaLine}>
            Reporting Period: Jan–Jun 2026 · Client ID: {client.clientId} · Generated on {reportDate}
          </Text>
        </View>

        {/* 4 Headline KPI Cards */}
        <View style={S.kpiRow}>
          <View style={S.kpiCard}>
            <Text style={S.kpiLabel}>Total Spend</Text>
            <Text style={S.kpiValue}>₹{(summary.totalSpend / 100000).toFixed(2)}L</Text>
            <Text style={S.kpiSub}>Across {summary.activeSuppliersCount} verified partners</Text>
          </View>
          <View style={[S.kpiCard, { borderLeftColor: C.sage }]}>
            <Text style={S.kpiLabel}>Total Orders</Text>
            <Text style={S.kpiValue}>{summary.totalOrders} Orders</Text>
            <Text style={S.kpiSub}>{summary.totalUnits.toLocaleString("en-IN")} units procured</Text>
          </View>
          <View style={[S.kpiCard, { borderLeftColor: scoreColor(summary.varnaScore) }]}>
            <Text style={S.kpiLabel}>Varna Score</Text>
            <Text style={S.kpiValue}>{summary.varnaScore.toFixed(1)} / 100</Text>
            <Text style={S.kpiSub}>{summary.band} · Diamond Model</Text>
          </View>
          <View style={[S.kpiCard, { borderLeftColor: C.slate }]}>
            <Text style={S.kpiLabel}>Active Partners</Text>
            <Text style={S.kpiValue}>{summary.activeSuppliersCount} Enterprises</Text>
            <Text style={S.kpiSub}>100% ESG Audited</Text>
          </View>
        </View>

        {/* Executive Summary Narrative */}
        <View style={S.narrativeBox}>
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 6.5, color: C.clay, textTransform: "uppercase", marginBottom: 3 }}>
            Executive Overview &amp; Auditor Finding
          </Text>
          <Text style={S.narrativeText}>{executiveSummary}</Text>
        </View>

        {/* Carbon Impact Highlights */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
          <View style={[S.kpiCard, { flex: 1, borderLeftColor: C.sage }]}>
            <Text style={S.kpiLabel}>Carbon Footprint Abatement</Text>
            <Text style={[S.kpiValue, { fontSize: 13 }]}>{summary.co2eAvoidedKg.toLocaleString("en-IN")} kg CO2e Avoided</Text>
            <Text style={S.kpiSub}>
              Equivalent to approx. {summary.treesEquivalent} mature trees annually sequestered
              {summary.carKmAvoided ? ` or ${summary.carKmAvoided.toLocaleString("en-IN")} km of passenger car travel eliminated` : ""}.
            </Text>
          </View>
          <View style={[S.kpiCard, { flex: 1, borderLeftColor: C.rust }]}>
            <Text style={S.kpiLabel}>Social Livelihood Impact</Text>
            <Text style={[S.kpiValue, { fontSize: 13 }]}>{summary.womenWorkforcePercent}% Women Workforce</Text>
            <Text style={S.kpiSub}>
              Partners pay an average of {summary.avgWageRatio}× the statutory state minimum wage with formal contracts.
            </Text>
          </View>
        </View>

        {/* Spend by Product Category */}
        <View style={S.sectionHeader}>
          <Text style={S.sectionTitle}>Spend by Product Category</Text>
          <Text style={S.sectionTag}>Procurement Allocation</Text>
        </View>

        {categorySpend.length > 0 ? (
          <View style={S.table}>
            <View style={S.tableHeader}>
              <Text style={[S.tableHeaderCell, { width: "45%" }]}>Product Category</Text>
              <Text style={[S.tableHeaderCell, { width: "25%", textAlign: "right" }]}>Spend (INR)</Text>
              <Text style={[S.tableHeaderCell, { width: "15%", textAlign: "right" }]}>% of Total</Text>
              <Text style={[S.tableHeaderCell, { width: "15%", textAlign: "center" }]}>Share Bar</Text>
            </View>
            {categorySpend.map((c, i) => (
              <View key={i} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
                <Text style={[S.tableCellBold, { width: "45%" }]}>{c.categoryName}</Text>
                <Text style={[S.tableCell, { width: "25%", textAlign: "right" }]}>₹{c.spend.toLocaleString("en-IN")}</Text>
                <Text style={[S.tableCell, { width: "15%", textAlign: "right" }]}>{c.percentage.toFixed(1)}%</Text>
                <View style={{ width: "15%", paddingHorizontal: 4 }}>
                  <View style={{ height: 4, backgroundColor: C.bgSubtle, borderRadius: 2 }}>
                    <View style={{ height: 4, width: `${Math.min(100, Math.max(5, c.percentage))}%`, backgroundColor: C.clay, borderRadius: 2 }} />
                  </View>
                </View>
              </View>
            ))}
            <View style={[S.tableRow, S.tableRowTotal]}>
              <Text style={[S.tableCellBold, { width: "45%" }]}>Total Category Spend</Text>
              <Text style={[S.tableCellBold, { width: "25%", textAlign: "right" }]}>₹{summary.totalSpend.toLocaleString("en-IN")}</Text>
              <Text style={[S.tableCellBold, { width: "15%", textAlign: "right" }]}>100.0%</Text>
              <Text style={[S.tableCell, { width: "15%" }]} />
            </View>
          </View>
        ) : (
          <View style={[S.narrativeBox, { borderLeftColor: C.border }]}>
            <Text style={S.narrativeText}>
              Category spend allocation details are being compiled for this reporting cycle. Total recorded spend: ₹{summary.totalSpend.toLocaleString("en-IN")} across {summary.activeSuppliersCount} active partner enterprises.
            </Text>
          </View>
        )}

        <PageFooterBlock date={reportDate} />
      </Page>

      {/* ──────────────────────────────────────────────────────────
          HOTEL PAGE 2: ESG PERFORMANCE & SUB-CRITERIA BREAKDOWN
      ────────────────────────────────────────────────────────── */}
      <Page size="A4" style={S.page}>
        <View style={S.sectionHeader}>
          <View>
            <Text style={S.sectionTag}>SECTION 02: ESG PERFORMANCE</Text>
            <Text style={S.sectionTitle}>Pillar Evaluation &amp; Sub-Criteria Breakdown</Text>
          </View>
          <Text style={{ fontFamily: "Helvetica", fontSize: 6.5, color: C.inkMuted }}>
            {client.clientName} · Score: {summary.varnaScore.toFixed(1)}/100
          </Text>
        </View>

        {/* 4 ESG Pillars */}
        <View style={S.pillarGrid}>
          {/* E */}
          <View style={[S.pillarCard, { borderTopColor: C.sage }]}>
            <Text style={S.pillarName}>Environmental</Text>
            <Text style={S.pillarScoreValue}>{summary.eScore.toFixed(1)} / 100</Text>
            <View style={S.pillarBarTrack}>
              <View style={[S.pillarBarFill, { width: `${Math.min(100, summary.eScore)}%`, backgroundColor: C.sage }]} />
            </View>
            <BandPill band={scoreBand(summary.eScore)} />
            <Text style={S.pillarDesc}>
              Resource use, carbon intensity, material sustainability and circular packaging standards.
            </Text>
          </View>

          {/* S */}
          <View style={[S.pillarCard, { borderTopColor: C.rust }]}>
            <Text style={S.pillarName}>Social</Text>
            <Text style={S.pillarScoreValue}>{summary.sScore.toFixed(1)} / 100</Text>
            <View style={S.pillarBarTrack}>
              <View style={[S.pillarBarFill, { width: `${Math.min(100, summary.sScore)}%`, backgroundColor: C.rust }]} />
            </View>
            <BandPill band={scoreBand(summary.sScore)} />
            <Text style={S.pillarDesc}>
              Employment contracts, fair living wages, gender inclusion and artisan workforce welfare.
            </Text>
          </View>

          {/* G */}
          <View style={[S.pillarCard, { borderTopColor: C.slate }]}>
            <Text style={S.pillarName}>Governance</Text>
            <Text style={S.pillarScoreValue}>{summary.gScore.toFixed(1)} / 100</Text>
            <View style={S.pillarBarTrack}>
              <View style={[S.pillarBarFill, { width: `${Math.min(100, summary.gScore)}%`, backgroundColor: C.slate }]} />
            </View>
            <BandPill band={scoreBand(summary.gScore)} />
            <Text style={S.pillarDesc}>
              Statutory registration, certifications (ISO, CIPET), compliance and business ethics.
            </Text>
          </View>

          {/* C */}
          <View style={[S.pillarCard, { borderTopColor: isCraftNA ? C.border : C.gold }]}>
            <Text style={S.pillarName}>Cultural &amp; Craft</Text>
            <Text style={S.pillarScoreValue}>{isCraftNA ? "N/A" : `${summary.cScore?.toFixed(1)} / 100`}</Text>
            <View style={S.pillarBarTrack}>
              <View style={[S.pillarBarFill, { width: isCraftNA ? "0%" : `${Math.min(100, summary.cScore || 0)}%`, backgroundColor: C.gold }]} />
            </View>
            <BandPill band={isCraftNA ? "Not Applicable" : scoreBand(summary.cScore || 0)} />
            <Text style={S.pillarDesc}>
              {isCraftNA
                ? "Traditional craft clusters, GI tags and heritage skills. Excluded without penalty."
                : "Traditional artisan clusters, GI status preservation and community resilience."}
            </Text>
          </View>
        </View>

        {/* Sub-Criteria Breakdown Table */}
        <View style={S.sectionHeader}>
          <Text style={S.sectionTitle}>Sub-Criteria Diagnostic Table</Text>
          <Text style={S.sectionTag}>GRI &amp; Varna 2.4 Calibrated</Text>
        </View>

        <View style={S.table}>
          <View style={S.tableHeader}>
            <Text style={[S.tableHeaderCell, { width: "10%" }]}>Code</Text>
            <Text style={[S.tableHeaderCell, { width: "45%" }]}>Evaluation Parameter</Text>
            <Text style={[S.tableHeaderCell, { width: "20%" }]}>Pillar</Text>
            <Text style={[S.tableHeaderCell, { width: "12%", textAlign: "right" }]}>Score</Text>
            <Text style={[S.tableHeaderCell, { width: "13%", textAlign: "center" }]}>Status</Text>
          </View>

          {/* Environmental sub-criteria */}
          {subCriteria.e.map((item, i) => (
            <View key={`e-${i}`} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
              <Text style={[S.tableCellBold, { width: "10%", color: C.sage }]}>{item.code}</Text>
              <Text style={[S.tableCell, { width: "45%" }]}>{item.name}</Text>
              <Text style={[S.tableCell, { width: "20%", color: C.sage }]}>Environmental</Text>
              <Text style={[S.tableCellBold, { width: "12%", textAlign: "right" }]}>
                {item.score !== null ? item.score.toFixed(1) : "—"}
              </Text>
              <View style={{ width: "13%", alignItems: "center" }}>
                <BandPill band={item.score !== null ? scoreBand(item.score) : "Pending"} />
              </View>
            </View>
          ))}

          {/* Social sub-criteria */}
          {subCriteria.s.map((item, i) => (
            <View key={`s-${i}`} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
              <Text style={[S.tableCellBold, { width: "10%", color: C.rust }]}>{item.code}</Text>
              <Text style={[S.tableCell, { width: "45%" }]}>{item.name}</Text>
              <Text style={[S.tableCell, { width: "20%", color: C.rust }]}>Social</Text>
              <Text style={[S.tableCellBold, { width: "12%", textAlign: "right" }]}>
                {item.score !== null ? item.score.toFixed(1) : "—"}
              </Text>
              <View style={{ width: "13%", alignItems: "center" }}>
                <BandPill band={item.score !== null ? scoreBand(item.score) : "Pending"} />
              </View>
            </View>
          ))}

          {/* Governance sub-criteria */}
          {subCriteria.g.map((item, i) => (
            <View key={`g-${i}`} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
              <Text style={[S.tableCellBold, { width: "10%", color: C.slate }]}>{item.code}</Text>
              <Text style={[S.tableCell, { width: "45%" }]}>{item.name}</Text>
              <Text style={[S.tableCell, { width: "20%", color: C.slate }]}>Governance</Text>
              <Text style={[S.tableCellBold, { width: "12%", textAlign: "right" }]}>
                {item.score !== null ? item.score.toFixed(1) : "—"}
              </Text>
              <View style={{ width: "13%", alignItems: "center" }}>
                <BandPill band={item.score !== null ? scoreBand(item.score) : "Pending"} />
              </View>
            </View>
          ))}

          {/* Cultural sub-criteria if available */}
          {!isCraftNA &&
            subCriteria.c.map((item, i) => (
              <View key={`c-${i}`} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
                <Text style={[S.tableCellBold, { width: "10%", color: C.gold }]}>{item.code}</Text>
                <Text style={[S.tableCell, { width: "45%" }]}>{item.name}</Text>
                <Text style={[S.tableCell, { width: "20%", color: C.gold }]}>Cultural</Text>
                <Text style={[S.tableCellBold, { width: "12%", textAlign: "right" }]}>
                  {item.score !== null ? item.score.toFixed(1) : "—"}
                </Text>
                <View style={{ width: "13%", alignItems: "center" }}>
                  <BandPill band={item.score !== null ? scoreBand(item.score) : "Pending"} />
                </View>
              </View>
            ))}
        </View>

        <PageFooterBlock date={reportDate} />
      </Page>

      {/* ──────────────────────────────────────────────────────────
          HOTEL PAGE 3: ACTIVE PARTNERS & ORDER REGISTRY
      ────────────────────────────────────────────────────────── */}
      <Page size="A4" style={S.page}>
        <View style={S.sectionHeader}>
          <View>
            <Text style={S.sectionTag}>SECTION 03: PROCUREMENT PORTFOLIO</Text>
            <Text style={S.sectionTitle}>Active Partner Registry &amp; Order History</Text>
          </View>
          <Text style={{ fontFamily: "Helvetica", fontSize: 6.5, color: C.inkMuted }}>
            {suppliers.length} Verified Partner Enterprises
          </Text>
        </View>

        {/* Active Partners Table */}
        <View style={S.table}>
          <View style={S.tableHeader}>
            <Text style={[S.tableHeaderCell, { width: "34%" }]}>Partner Enterprise</Text>
            <Text style={[S.tableHeaderCell, { width: "14%" }]}>Location</Text>
            <Text style={[S.tableHeaderCell, { width: "10%" }]}>Tier</Text>
            <Text style={[S.tableHeaderCell, { width: "10%", textAlign: "center" }]}>Varna</Text>
            <Text style={[S.tableHeaderCell, { width: "14%", textAlign: "center" }]}>Confidence</Text>
            <Text style={[S.tableHeaderCell, { width: "18%", textAlign: "right" }]}>YTD Spend</Text>
          </View>
          {suppliers.map((s, i) => (
            <View key={i} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
              <View style={{ width: "34%" }}>
                <Text style={S.tableCellBold}>{s.enterpriseName}</Text>
                <Text style={{ fontFamily: "Helvetica", fontSize: 5.5, color: C.inkMuted }}>{s.category}</Text>
              </View>
              <Text style={[S.tableCell, { width: "14%" }]}>
                {s.city}
                {s.state ? `, ${s.state}` : ""}
              </Text>
              <Text style={[S.tableCell, { width: "10%" }]}>{s.tier}</Text>
              <View style={{ width: "10%", alignItems: "center" }}>
                <Text style={[S.tableCellBold, { color: scoreColor(s.varnaScore) }]}>{s.varnaScore}</Text>
              </View>
              <View style={{ width: "14%", alignItems: "center" }}>
                <View style={{ backgroundColor: "#EBF0EB", paddingHorizontal: 4, paddingVertical: 1, borderRadius: 2 }}>
                  <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 6, color: C.sage }}>{s.confidencePct}% verified</Text>
                </View>
              </View>
              <Text style={[S.tableCellBold, { width: "18%", textAlign: "right" }]}>₹{s.spend.toLocaleString("en-IN")}</Text>
            </View>
          ))}
          <View style={[S.tableRow, S.tableRowTotal]}>
            <Text style={[S.tableCellBold, { width: "34%" }]}>Portfolio Total</Text>
            <Text style={[S.tableCell, { width: "14%" }]} />
            <Text style={[S.tableCell, { width: "10%" }]}>{suppliers.length} active</Text>
            <Text style={[S.tableCellBold, { width: "10%", textAlign: "center" }]}>{summary.varnaScore.toFixed(1)}</Text>
            <Text style={[S.tableCell, { width: "14%" }]} />
            <Text style={[S.tableCellBold, { width: "18%", textAlign: "right" }]}>₹{summary.totalSpend.toLocaleString("en-IN")}</Text>
          </View>
        </View>

        {/* Social Impact Breakdown Table */}
        <View style={S.sectionHeader}>
          <Text style={S.sectionTitle}>Social Livelihood &amp; Workforce Disclosure</Text>
          <Text style={S.sectionTag}>Fair Wages &amp; Gender Inclusion</Text>
        </View>

        <View style={S.table}>
          <View style={S.tableHeader}>
            <Text style={[S.tableHeaderCell, { width: "40%" }]}>Enterprise</Text>
            <Text style={[S.tableHeaderCell, { width: "25%", textAlign: "center" }]}>Women Workforce %</Text>
            <Text style={[S.tableHeaderCell, { width: "35%", textAlign: "right" }]}>Wage Multiple vs Min Wage</Text>
          </View>
          {suppliers.map((s, i) => (
            <View key={i} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
              <Text style={[S.tableCellBold, { width: "40%" }]}>{s.enterpriseName}</Text>
              <View style={{ width: "25%", alignItems: "center" }}>
                <Text style={S.tableCell}>{s.womenPercent}%</Text>
              </View>
              <Text style={[S.tableCellBold, { width: "35%", textAlign: "right", color: C.clay }]}>
                {s.wageRatio.toFixed(2)}× statutory minimum
              </Text>
            </View>
          ))}
          <View style={[S.tableRow, S.tableRowTotal]}>
            <Text style={[S.tableCellBold, { width: "40%" }]}>Portfolio Weighted Average</Text>
            <Text style={[S.tableCellBold, { width: "25%", textAlign: "center" }]}>{summary.womenWorkforcePercent}%</Text>
            <Text style={[S.tableCellBold, { width: "35%", textAlign: "right", color: C.clay }]}>
              {summary.avgWageRatio.toFixed(2)}× statutory minimum
            </Text>
          </View>
        </View>

        {/* Order History Table */}
        <View style={S.sectionHeader}>
          <Text style={S.sectionTitle}>Procurement Order Register</Text>
          <Text style={S.sectionTag}>Reporting Period Fulfillment</Text>
        </View>

        <View style={S.table}>
          <View style={S.tableHeader}>
            <Text style={[S.tableHeaderCell, { width: "22%" }]}>Order / PO #</Text>
            <Text style={[S.tableHeaderCell, { width: "16%" }]}>Date</Text>
            <Text style={[S.tableHeaderCell, { width: "32%" }]}>Enterprise</Text>
            <Text style={[S.tableHeaderCell, { width: "16%", textAlign: "right" }]}>Order Value</Text>
            <Text style={[S.tableHeaderCell, { width: "14%", textAlign: "center" }]}>Status</Text>
          </View>
          {orders.map((o, i) => (
            <View key={i} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
              <Text style={[S.tableCellBold, { width: "22%" }]}>{o.orderId}</Text>
              <Text style={[S.tableCell, { width: "16%" }]}>{o.orderDate}</Text>
              <Text style={[S.tableCell, { width: "32%" }]}>{o.enterpriseName}</Text>
              <Text style={[S.tableCellBold, { width: "16%", textAlign: "right" }]}>₹{o.valueInr.toLocaleString("en-IN")}</Text>
              <View style={{ width: "14%", alignItems: "center" }}>
                <View style={{ backgroundColor: "#EBF0EB", paddingHorizontal: 4, paddingVertical: 1, borderRadius: 2 }}>
                  <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 5.5, color: C.sage }}>{o.status}</Text>
                </View>
              </View>
            </View>
          ))}
          <View style={[S.tableRow, S.tableRowTotal]}>
            <Text style={[S.tableCellBold, { width: "22%" }]}>Total Orders ({orders.length})</Text>
            <Text style={[S.tableCell, { width: "16%" }]} />
            <Text style={[S.tableCell, { width: "32%" }]} />
            <Text style={[S.tableCellBold, { width: "16%", textAlign: "right" }]}>₹{summary.totalSpend.toLocaleString("en-IN")}</Text>
            <Text style={[S.tableCellBold, { width: "14%", textAlign: "center", color: C.sage }]}>100% Verified</Text>
          </View>
        </View>

        <PageFooterBlock date={reportDate} />
      </Page>
    </React.Fragment>
  );
}

// ── Master Group Document ─────────────────────────────────────────────────────

export interface GroupReportPDFDocumentProps {
  /** If provided, renders consolidated all-hotels report */
  groupData?: GroupRollupData;
  /** If provided alone, renders single hotel report */
  singleHotelData?: HotelReportData;
  reportDate?: string;
}

export default function GroupReportPDFDocument({
  groupData,
  singleHotelData,
  reportDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }),
}: GroupReportPDFDocumentProps) {
  // Case 1: Single Hotel Report
  if (singleHotelData && !groupData) {
    return (
      <Document
        title={`Varna ESG Report - ${singleHotelData.client.clientName}`}
        author="Varna Collective"
        subject="Sustainability & Procurement Impact Report"
      >
        {renderHotelPages(singleHotelData, reportDate, false, 0)}
      </Document>
    );
  }

  // Case 2: Consolidated All Hotels Report
  const hotels = groupData?.hotels || (singleHotelData ? [singleHotelData] : []);
  const parentGroup = groupData?.parentGroup || "Meridian Hotels & Resorts (GRP-001 Portfolio)";

  return (
    <Document
      title={`Consolidated Group ESG Report - ${parentGroup}`}
      author="Varna Collective"
      subject="Group Portfolio Sustainability & Procurement Impact Report"
    >
      {/* ──────────────────────────────────────────────────────────
          COVER PAGE: GROUP PORTFOLIO ROLLUP & LEADERBOARD
      ────────────────────────────────────────────────────────── */}
      <Page size="A4" style={S.page}>
        <View style={S.headerBlock}>
          <View style={S.brandRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
              <View style={[S.brandLogoTile, { backgroundColor: C.clay, borderColor: C.clay }]}>
                <Text style={[S.brandLogoText, { color: "#FFFFFF" }]}>M</Text>
              </View>
              <View>
                <Text style={S.brandEyebrow}>VARNA COLLECTIVE · CONSOLIDATED GROUP DOSSIER</Text>
                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9, color: C.ink }}>
                  GRP-001 Portfolio Overview
                </Text>
              </View>
            </View>
            <BandPill band="Portfolio Dossier" />
          </View>

          <Text style={S.reportTitle}>Meridian Hotels &amp; Resorts</Text>
          <Text style={S.reportSubtitle}>
            Consolidated ESG Performance &amp; Sustainable Procurement Portfolio Report
          </Text>
          <Text style={S.metaLine}>
            Reporting Period: Jan–Jun 2026 · Total Properties: {hotels.length} · Generated on {reportDate}
          </Text>
        </View>

        {/* Group Rollup KPI Grid */}
        <View style={S.kpiRow}>
          <View style={S.kpiCard}>
            <Text style={S.kpiLabel}>Combined Spend</Text>
            <Text style={S.kpiValue}>₹{((groupData?.totalSpend || 0) / 100000).toFixed(2)}L</Text>
            <Text style={S.kpiSub}>Across {hotels.length} operating properties</Text>
          </View>
          <View style={[S.kpiCard, { borderLeftColor: C.sage }]}>
            <Text style={S.kpiLabel}>Total Orders</Text>
            <Text style={S.kpiValue}>{groupData?.totalOrders || 0} Orders</Text>
            <Text style={S.kpiSub}>Verified sustainable supply chains</Text>
          </View>
          <View style={[S.kpiCard, { borderLeftColor: scoreColor(groupData?.avgVarnaScore || 61.9) }]}>
            <Text style={S.kpiLabel}>Portfolio Score</Text>
            <Text style={S.kpiValue}>{(groupData?.avgVarnaScore || 61.9).toFixed(1)} / 100</Text>
            <Text style={S.kpiSub}>{scoreBand(groupData?.avgVarnaScore || 61.9)} · Diamond Model</Text>
          </View>
          <View style={[S.kpiCard, { borderLeftColor: C.slate }]}>
            <Text style={S.kpiLabel}>CO2e Avoided</Text>
            <Text style={S.kpiValue}>{(groupData?.totalCo2eAvoidedKg || 0).toLocaleString("en-IN")} kg</Text>
            <Text style={S.kpiSub}>~{groupData?.treesEquivalent || 0} trees equivalent</Text>
          </View>
        </View>

        {/* Executive Rollup Narrative */}
        <View style={S.narrativeBox}>
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 6.5, color: C.clay, textTransform: "uppercase", marginBottom: 3 }}>
            Portfolio Synthesis &amp; Governance Statement
          </Text>
          <Text style={S.narrativeText}>
            This consolidated report provides comprehensive auditor-verified ESG disclosures for all {hotels.length} properties operating under Meridian Hotels &amp; Resorts (GRP-001 Portfolio).
            Across ₹{((groupData?.totalSpend || 0) / 100000).toFixed(2)} Lakhs in procurement spend and {groupData?.totalOrders || 0} purchase orders, the group eliminated {(groupData?.totalCo2eAvoidedKg || 0).toLocaleString("en-IN")} kg CO2e in conventional supply emissions.
            Portfolio pillar evaluations demonstrate balanced performance in Governance ({(groupData?.avgG || 66).toFixed(1)}), Environmental ({(groupData?.avgE || 62).toFixed(1)}), and Social ({(groupData?.avgS || 58).toFixed(1)}).
            Individual property disclosures follow this summary with full sub-criteria breakdowns and partner registries.
          </Text>
        </View>

        {/* Table of Contents & Hotel Leaderboard */}
        <View style={S.sectionHeader}>
          <Text style={S.sectionTitle}>Portfolio Hotel Directory &amp; Table of Contents</Text>
          <Text style={S.sectionTag}>Ranked by Varna Score</Text>
        </View>

        <View style={S.table}>
          <View style={S.tableHeader}>
            <Text style={[S.tableHeaderCell, { width: "6%" }]}>#</Text>
            <Text style={[S.tableHeaderCell, { width: "32%" }]}>Property Name</Text>
            <Text style={[S.tableHeaderCell, { width: "16%" }]}>Location</Text>
            <Text style={[S.tableHeaderCell, { width: "10%", textAlign: "center" }]}>Varna</Text>
            <Text style={[S.tableHeaderCell, { width: "12%", textAlign: "center" }]}>Band</Text>
            <Text style={[S.tableHeaderCell, { width: "14%", textAlign: "right" }]}>Spend</Text>
            <Text style={[S.tableHeaderCell, { width: "10%", textAlign: "center" }]}>Section</Text>
          </View>
          {hotels.map((h, i) => (
            <View key={h.client.clientId} style={[S.tableRow, i % 2 === 1 ? S.tableRowAlt : {}]}>
              <Text style={[S.tableCellBold, { width: "6%" }]}>{i + 1}</Text>
              <View style={{ width: "32%" }}>
                <Text style={S.tableCellBold}>{h.client.clientName}</Text>
                <Text style={{ fontFamily: "Helvetica", fontSize: 5.5, color: C.inkMuted }}>{h.client.propertyType}</Text>
              </View>
              <Text style={[S.tableCell, { width: "16%" }]}>{h.client.city}, {h.client.country}</Text>
              <View style={{ width: "10%", alignItems: "center" }}>
                <Text style={[S.tableCellBold, { color: scoreColor(h.summary.varnaScore) }]}>
                  {h.summary.varnaScore.toFixed(1)}
                </Text>
              </View>
              <View style={{ width: "12%", alignItems: "center" }}>
                <BandPill band={h.summary.band} />
              </View>
              <Text style={[S.tableCellBold, { width: "14%", textAlign: "right" }]}>
                ₹{(h.summary.totalSpend / 100000).toFixed(2)}L
              </Text>
              <View style={{ width: "10%", alignItems: "center" }}>
                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 6, color: C.clay }}>
                  Pages {i * 3 + 2}–{i * 3 + 4}
                </Text>
              </View>
            </View>
          ))}
          <View style={[S.tableRow, S.tableRowTotal]}>
            <Text style={[S.tableCellBold, { width: "6%" }]}>Σ</Text>
            <Text style={[S.tableCellBold, { width: "32%" }]}>Portfolio Rollup ({hotels.length} Properties)</Text>
            <Text style={[S.tableCell, { width: "16%" }]} />
            <Text style={[S.tableCellBold, { width: "10%", textAlign: "center" }]}>{(groupData?.avgVarnaScore || 61.9).toFixed(1)}</Text>
            <View style={{ width: "12%", alignItems: "center" }}>
              <BandPill band={scoreBand(groupData?.avgVarnaScore || 61.9)} />
            </View>
            <Text style={[S.tableCellBold, { width: "14%", textAlign: "right" }]}>
              ₹{((groupData?.totalSpend || 0) / 100000).toFixed(2)}L
            </Text>
            <Text style={[S.tableCell, { width: "10%" }]} />
          </View>
        </View>

        <PageFooterBlock date={reportDate} />
      </Page>

      {/* ──────────────────────────────────────────────────────────
          HOTEL DETAILED SECTIONS (3 PAGES PER HOTEL)
      ────────────────────────────────────────────────────────── */}
      {hotels.map((hotel, idx) => renderHotelPages(hotel, reportDate, true, idx))}
    </Document>
  );
}
