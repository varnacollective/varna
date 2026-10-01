import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Cookie-aware server client — for per-request data (uses session cookies).
 * Use for per-client queries (client_master, client_summary, etc.).
 */
export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
};

/**
 * Cookie-free anon client — for global/shared read-only queries inside
 * unstable_cache. Does NOT call cookies(), so it is safe to use inside cache
 * factory functions (passing the Supabase client instance to unstable_cache
 * causes a circular-JSON error because Next.js serialises cache arguments).
 */
export const createAnonClient = () =>
  createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
