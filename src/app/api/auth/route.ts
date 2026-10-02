import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, password } = body;

    if (!clientId || !password) {
      return NextResponse.json(
        { error: "Client ID and password are required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // ── Single authoritative lookup: client_credentials table ──────────────
    // All accounts (CLT-*, GRP-*, superadmin) must have a row here.
    // Try uppercase first (CLT-001, GRP-001), then exact case (superadmin).
    const upperClientId = clientId.trim().toUpperCase();
    const exactClientId = clientId.trim();

    let credRow: Record<string, any> | null = null;

    const { data: upper } = await supabase
      .from("client_credentials")
      .select("*")
      .eq("client_id", upperClientId)
      .maybeSingle();

    if (upper) {
      credRow = upper;
    } else if (exactClientId !== upperClientId) {
      // Only do second query if the case-normalized version differs
      const { data: exact } = await supabase
        .from("client_credentials")
        .select("*")
        .eq("client_id", exactClientId)
        .maybeSingle();
      credRow = exact ?? null;
    }

    if (!credRow) {
      return NextResponse.json(
        { error: "Invalid Client ID or password. Please check and try again." },
        { status: 401 }
      );
    }

    if (credRow.password !== password) {
      return NextResponse.json(
        { error: "Invalid password. Please check and try again." },
        { status: 401 }
      );
    }

    // ── Determine account type ──────────────────────────────────────────────
    // is_superadmin column is optional for backward compat — fall back to
    // matching client_id = 'superadmin' until the column is added to the table.
    const isSuperAdmin =
      Boolean(credRow.is_superadmin) ||
      credRow.client_id.toLowerCase() === "superadmin";

    const isGroup =
      !isSuperAdmin &&
      (Boolean(credRow.is_group) || credRow.client_id.startsWith("GRP-"));

    const redirectUrl = isSuperAdmin
      ? "/superadmin"
      : isGroup
      ? "/group-dashboard"
      : "/dashboard";

    // ── Set cookies & respond ───────────────────────────────────────────────
    const response = NextResponse.json({
      success: true,
      isSuperAdmin,
      isGroup,
      redirectUrl,
      client: {
        clientId: credRow.client_id,
        clientName: credRow.client_name || credRow.client_id,
        industry: isSuperAdmin
          ? "Platform Administration"
          : isGroup
          ? "Hospitality Group"
          : credRow.property_type || "Hospitality",
        isGroup,
        parentGroup: credRow.parent_group || null,
      },
    });

    if (isSuperAdmin) {
      response.cookies.set("varna_superadmin_session", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      });
    }

    response.cookies.set(
      "varna_session",
      JSON.stringify({
        clientId: credRow.client_id,
        clientName: credRow.client_name || credRow.client_id,
        role: isSuperAdmin ? "superadmin" : isGroup ? "group" : "client",
        isGroup,
        parentGroup: credRow.parent_group || null,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      }
    );

    return response;
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
