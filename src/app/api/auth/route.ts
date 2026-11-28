/**
 * POST /api/auth – sign in with email and password (Supabase Auth).
 * The auth cookies are set by the Supabase server client. Accounts without
 * a Varna role in app_metadata are signed out again and refused.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { homePath, sessionFromClaims } from "@/lib/auth/claims";

const Body = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(320)),
  password: z.string().min(1).max(256),
});

const INVALID = "Invalid email or password. Please check and try again.";

export async function POST(request: Request) {
  const body = Body.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: body.data.email,
    password: body.data.password,
  });
  if (error || !data.user) {
    return NextResponse.json({ error: INVALID }, { status: 401 });
  }

  const session = sessionFromClaims({ sub: data.user.id, app_metadata: data.user.app_metadata });
  if (!session) {
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: "This account is not set up yet. Please contact your Varna Enterprise Administrator." },
      { status: 403 }
    );
  }

  return NextResponse.json({
    success: true,
    isSuperAdmin: session.role === "superadmin",
    isGroup: session.isGroup,
    redirectUrl: homePath(session.role),
  });
}
