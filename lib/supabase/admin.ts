import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Bypasses RLS — only use in trusted server contexts (webhooks, cron, embeddings).
// Never import this in components or client-side code.
//
// Built on first call rather than at module evaluation: Next imports route modules
// while collecting page data at build time, where the Supabase env vars are absent.
let client: SupabaseClient<Database> | null = null;

export function getAdminClient(): SupabaseClient<Database> {
  client ??= createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  return client;
}
