import { createClient } from "@supabase/supabase-js";

// For static routes that don't need authentication
export function createStaticClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! // Use anon key for public data
  );
}
