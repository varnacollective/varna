import { NextRequest, NextResponse } from "next/server";
import { fetchDashboardData } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Read the session cookie
    const sessionCookie = request.cookies.get("varna_session");

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    let session: { clientId: string; clientName: string };
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json(
        { error: "Invalid session." },
        { status: 401 }
      );
    }

    const data = await fetchDashboardData(session.clientId);

    if (!data) {
      return NextResponse.json(
        { error: "No data found for this client." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch dashboard data." },
      { status: 500 }
    );
  }
}
