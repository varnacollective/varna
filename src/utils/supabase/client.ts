import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let clientInstance: ReturnType<typeof createBrowserClient> | undefined;

/**
 * Supabase browser client singleton.
 * Prevents repeated instantiation and connection overhead on client re-renders.
 */
export const createClient = () => {
  if (typeof window === "undefined") {
    return createBrowserClient(supabaseUrl!, supabaseKey!);
  }

  if (!clientInstance) {
    clientInstance = createBrowserClient(supabaseUrl!, supabaseKey!);
  }

  return clientInstance;
};
