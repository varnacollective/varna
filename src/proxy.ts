import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Check Supabase Auth state using @supabase/ssr
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check application session cookies
  const varnaSession = request.cookies.get("varna_session");
  const superadminSession = request.cookies.get("varna_superadmin_session");

  const pathname = request.nextUrl.pathname;

  // ── Route Protection: /superadmin ──
  if (pathname.startsWith("/superadmin")) {
    let isSuperAdmin = Boolean(user) || superadminSession?.value === "true";

    if (!isSuperAdmin && varnaSession?.value) {
      try {
        const parsed = JSON.parse(varnaSession.value);
        if (
          parsed.role === "superadmin" ||
          parsed.clientId?.toLowerCase() === "superadmin"
        ) {
          isSuperAdmin = true;
        }
      } catch {
        // invalid session JSON
      }
    }

    if (!isSuperAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // ── Route Protection: /dashboard ──
  if (pathname.startsWith("/dashboard")) {
    const hasDashboardSession =
      Boolean(user) ||
      Boolean(varnaSession?.value) ||
      superadminSession?.value === "true";

    if (!hasDashboardSession) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/superadmin",
    "/superadmin/:path*",
    "/dashboard",
    "/dashboard/:path*",
  ],
};
