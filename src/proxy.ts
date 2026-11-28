/**
 * proxy.ts – refreshes the Supabase Auth session and guards protected pages.
 *
 *   • /superadmin/*            → superadmin only
 *   • /group/*, /group-dashboard/* → group or superadmin
 *   • /dashboard/*             → any signed-in user
 *
 * This is the first check only. Pages and route handlers check the session
 * again, and row level security in the database decides which rows a user
 * can read.
 */
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { canOpen, sessionFromClaims } from "@/lib/auth/claims";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error("[proxy] Supabase URL or publishable key is missing.");
    return canOpen(request.nextUrl.pathname, null) ? response : NextResponse.redirect(new URL("/", request.url));
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Verifies the access token and refreshes it when needed (sets new cookies).
  const { data } = await supabase.auth.getClaims();
  const session = data ? sessionFromClaims(data.claims) : null;

  if (!canOpen(request.nextUrl.pathname, session)) {
    const redirect = NextResponse.redirect(new URL("/", request.url));
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }
  return response;
}

// Runs on every page and API route so sessions stay fresh; skips static files.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)"],
};
