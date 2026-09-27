import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import GroupReportPDFDocument from "@/components/PDF/GroupReportPDFDocument";
import { fetchHotelReportData, fetchGroupReportData } from "@/lib/group-reports-data";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("varna_session");

  const { searchParams } = new URL(request.url);
  const queryClientId = searchParams.get("clientId");
  const isAllHotels = searchParams.get("all") === "true";

  let parentGroup = "Meridian Hospitality Group (DEMO)";

  if (sessionCookie?.value) {
    try {
      const session = JSON.parse(sessionCookie.value);
      if (session.parentGroup) {
        parentGroup = session.parentGroup;
      }
    } catch {
      // Ignore parse failure; continue with defaults or query param
    }
  }

  const supabase = await createClient();

  const reportDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const dateSlug = new Date().toISOString().slice(0, 10);

  try {
    if (isAllHotels || (!queryClientId && !sessionCookie)) {
      // ── Generate Consolidated All Hotels Report ──
      const groupData = await fetchGroupReportData(supabase, parentGroup);

      if (!groupData || groupData.hotels.length === 0) {
        return NextResponse.json(
          { error: "No properties found for this portfolio." },
          { status: 404 }
        );
      }

      const element = React.createElement(GroupReportPDFDocument, {
        groupData,
        reportDate,
      });

      const buffer = await renderToBuffer(element as React.ReactElement<any>);
      const filename = `varna-group-esg-report-meridian-portfolio-${dateSlug}.pdf`;

      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": buffer.byteLength.toString(),
          "Cache-Control": "no-store",
        },
      });
    } else {
      // ── Generate Individual Hotel Report ──
      const targetClientId = queryClientId || "CLT-004";
      const hotelData = await fetchHotelReportData(supabase, targetClientId);

      if (!hotelData) {
        return NextResponse.json(
          { error: `Property data not found for client ID ${targetClientId}.` },
          { status: 404 }
        );
      }

      const element = React.createElement(GroupReportPDFDocument, {
        singleHotelData: hotelData,
        reportDate,
      });

      const buffer = await renderToBuffer(element as React.ReactElement<any>);
      const slug = hotelData.client.clientName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const filename = `varna-esg-report-${slug}-${dateSlug}.pdf`;

      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": buffer.byteLength.toString(),
          "Cache-Control": "no-store",
        },
      });
    }
  } catch (err) {
    console.error("[Group PDF Export] renderToBuffer error:", err);
    return NextResponse.json(
      { error: "Failed to generate report PDF", detail: String(err) },
      { status: 500 }
    );
  }
}
