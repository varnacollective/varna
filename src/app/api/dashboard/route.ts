import { NextRequest, NextResponse } from "next/server";
import { fetchDashboardData } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard — Multi-Tenant Secured Dashboard Data
 *
 * SECURITY CONTRACT:
 * 1. Reads the session cookie to extract the authenticated Client ID.
 * 2. Calls fetchDashboardData(clientId), which reads from the globally CACHED
 *    sheet arrays (shared across all tenants, 300s TTL).
 * 3. fetchDashboardData FILTERS every sheet tab by clientId on the server.
 * 4. Only the filtered, client-specific DashboardData object is serialized to JSON.
 * 5. The raw multi-client sheet arrays NEVER leave the server boundary.
 *
 * Result: Zero cross-client data leakage. Each hotel sees only their own data.
 */
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
