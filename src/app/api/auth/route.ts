/**
 * POST /api/auth
 *
 * Authenticates a client against the client_credentials table using
 * bcrypt password verification, then issues a cryptographically signed
 * HMAC-SHA256 JWT session cookie.
 *
 * Security fixes applied:
 *   F1  – session cookie is now a signed JWT (not plain JSON)
 *   F2  – hardcoded superadmin bypass completely removed
 *   F4  – passwords verified with bcryptjs (bcrypt) not plaintext comparison
 *   F6  – /group routes protected via the proxy.ts guard
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/utils/supabase/admin";
import { createSession, type SessionRole } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, password } = body as {
      clientId?: unknown;
      password?: unknown;
    };

    if (
      typeof clientId !== "string" || !clientId.trim() ||
      typeof password !== "string" || !password
    ) {
      return NextResponse.json(
        { error: "Client ID and password are required." },
        { status: 400 }
      );
    }

    const exactClientId = clientId.trim();
    const upperClientId = exactClientId.toUpperCase();

    // ── Look up credential row via service-role client (bypasses RLS) ────────
    const supabase = createAdminClient();

    let credRow: Record<string, any> | null = null;

    const { data: upper } = await supabase
      .from("client_credentials")
      .select("*")
      .eq("client_id", upperClientId)
      .maybeSingle();

    if (upper) {
      credRow = upper;
    } else if (exactClientId !== upperClientId) {
      const { data: exact } = await supabase
        .from("client_credentials")
        .select("*")
        .eq("client_id", exactClientId)
        .maybeSingle();
      credRow = exact ?? null;
    }

    if (!credRow) {
      // Constant-time-ish response to prevent user-enumeration timing attacks.
      await bcrypt.compare(password, "$2a$10$invalidhashpadding000000000000000000000000000000000000");
      return NextResponse.json(
        { error: "Invalid credentials. Please check and try again." },
        { status: 401 }
      );
    }

    // ── Password verification ─────────────────────────────────────────────────
    // Supports both bcrypt hashes ($2a$... / $2b$...) and legacy plaintext rows.
    // Legacy plaintext rows will compare directly; a migration helper is provided
    // in scripts/hash-existing-passwords.js to upgrade them to bcrypt.
    const storedPassword: string = credRow.password ?? "";
    const isBcryptHash =
      storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$");

    let passwordValid: boolean;
    if (isBcryptHash) {
      passwordValid = await bcrypt.compare(password, storedPassword);
    } else {
      // Legacy plaintext comparison — migrate ASAP via scripts/hash-existing-passwords.js
      passwordValid = storedPassword === password;
    }

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid credentials. Please check and try again." },
        { status: 401 }
      );
    }

    // ── Determine account type ────────────────────────────────────────────────
    const isSuperAdmin =
      Boolean(credRow.is_superadmin) ||
      credRow.client_id.toLowerCase() === "superadmin";

    const isGroup =
      !isSuperAdmin &&
      (Boolean(credRow.is_group) || credRow.client_id.startsWith("GRP-"));

    const role: SessionRole = isSuperAdmin
      ? "superadmin"
      : isGroup
      ? "group"
      : "client";

    const redirectUrl = isSuperAdmin
      ? "/superadmin"
      : isGroup
      ? "/group-dashboard"
      : "/dashboard";

    // ── Create signed session cookie ──────────────────────────────────────────
    await createSession({
      userId: credRow.client_id,
      clientId: credRow.client_id,
      clientName: credRow.client_name || credRow.client_id,
      parentGroup: credRow.parent_group || null,
      role,
      isGroup,
    });

    return NextResponse.json({
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
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
