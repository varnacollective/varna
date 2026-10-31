/**
 * proxy.ts – Varna Collective Route Guard
 *
 * Deny-by-default protection for:
 *   • /superadmin/*  → requires a valid signed session with role === 'superadmin'
 *   • /dashboard/*   → requires any valid signed session
 *   • /group/*       → requires a valid signed session with role === 'group' OR 'superadmin'
 *   • /group-dashboard/* → same as /group
 *
 * NOTE: This file performs OPTIMISTIC checks only (as per Next.js 16 guidance).
 * Full cryptographic verification happens inside each Route Handler / Server Action.
 *
 * The signed session cookie (`varna_session`) is a HMAC-SHA256 JWT produced by
 * src/lib/session.ts using AUTH_SECRET.  We verify it here using `jose`
 * (Edge-compatible, no Node.js crypto module needed).
 */

import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// ── Types ────────────────────────────────────────────────────────────────────

type SessionRole = "superadmin" | "client" | "group";

interface SessionPayload {
  userId: string;
  clientId: string;
  clientName: string;
  parentGroup: string | null;
  role: SessionRole;
  isGroup: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getEncodedSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? "";
  if (secret.length < 32) {
    // Proxy still runs; unauthenticated paths will just not match the cookie,
    // so every protected route will redirect.  This is fail-safe, not fail-open.
    console.error("[proxy] AUTH_SECRET is missing or too short!");
  }
  return new TextEncoder().encode(secret);
}

async function verifySession(
  request: NextRequest
): Promise<SessionPayload | null> {
  const token = request.cookies.get("varna_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getEncodedSecret(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    // Expired, tampered, or signed with wrong key → treat as unauthenticated.
    return null;
  }
}

// ── Main proxy function ───────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run on protected routes (see matcher below).
  const session = await verifySession(request);

  // ── /superadmin ──────────────────────────────────────────────────────────
  if (pathname.startsWith("/superadmin")) {
    if (!session || session.role !== "superadmin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // ── /dashboard ───────────────────────────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // ── /group and /group-dashboard ──────────────────────────────────────────
  if (pathname.startsWith("/group") || pathname.startsWith("/group-dashboard")) {
    if (!session || (session.role !== "group" && session.role !== "superadmin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

// ── Matcher ───────────────────────────────────────────────────────────────────
// Explicitly match all protected path prefixes. The proxy runs ONLY on these.

export const config = {
  matcher: [
    "/superadmin",
    "/superadmin/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/group",
    "/group/:path*",
    "/group-dashboard",
    "/group-dashboard/:path*",
  ],
};
