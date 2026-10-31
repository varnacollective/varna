/**
 * server-only session helpers.
 * Signs and verifies HMAC-SHA256 JWT cookies via `jose`.
 * Import ONLY from Server Components, Route Handlers, or Proxy.
 */
import "server-only";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

// ── Types ────────────────────────────────────────────────────────────────────

export type SessionRole = "superadmin" | "client" | "group";

export interface SessionPayload extends JWTPayload {
  userId: string;     // same as clientId (e.g. "superadmin", "CLT-001", "GRP-001")
  clientId: string;
  clientName: string;
  parentGroup: string | null;
  role: SessionRole;
  isGroup: boolean;
}

// ── Secret key (must be ≥ 32 bytes) ─────────────────────────────────────────

function getEncodedKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET env var is missing or too short (need ≥ 32 chars). " +
      "Generate one with: openssl rand -base64 32"
    );
  }
  return new TextEncoder().encode(secret);
}

// ── Core crypto helpers ──────────────────────────────────────────────────────

export async function encryptSession(payload: SessionPayload): Promise<string> {
  const key = getEncodedKey();
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decryptSession(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const key = getEncodedKey();
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ── Cookie helpers ───────────────────────────────────────────────────────────

const COOKIE_NAME = "varna_session";

export async function createSession(payload: SessionPayload): Promise<void> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h
  const token = await encryptSession(payload);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  return decryptSession(token);
}

export async function deleteSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

