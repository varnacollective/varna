/**
 * GET/POST /api/logout – signs out of Supabase Auth (clears the auth cookies).
 */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function POST() {
  await signOut();
  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  await signOut();
  return NextResponse.redirect(new URL("/", request.url));
}
