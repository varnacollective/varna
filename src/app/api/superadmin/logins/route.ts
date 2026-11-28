/**
 * GET  /api/superadmin/logins – list Supabase Auth logins (superadmin only).
 * POST /api/superadmin/logins – create a hotel or group login (superadmin only).
 */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/utils/supabase/admin";
import { createLogin, listLogins, NewLogin } from "@/lib/auth/logins";

async function isSuperadmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === "superadmin";
}

export async function GET() {
  if (!(await isSuperadmin())) {
    return NextResponse.json({ error: "Superadmin sign-in required." }, { status: 401 });
  }
  return NextResponse.json({ logins: await listLogins(createAdminClient()) });
}

export async function POST(request: Request) {
  if (!(await isSuperadmin())) {
    return NextResponse.json({ error: "Superadmin sign-in required." }, { status: 401 });
  }
  const input = NewLogin.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json(
      { error: "Please give a valid email, a password of at least 6 characters and a client ID." },
      { status: 400 }
    );
  }
  const result = await createLogin(createAdminClient(), input.data);
  return result.ok
    ? NextResponse.json({ login: result.login }, { status: 201 })
    : NextResponse.json({ error: result.error }, { status: result.status });
}
