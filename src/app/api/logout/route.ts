/**
 * GET/POST /api/logout
 * Deletes the signed session cookie and redirects to the login page.
 */
import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";

export async function POST() {
  await deleteSession();
  return NextResponse.json({ success: true });
}

export async function GET() {
  await deleteSession();
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}
