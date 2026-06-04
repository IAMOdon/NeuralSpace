import { createClient } from "@supabase/supabase-js";

// Bypasses RLS — only use in trusted server contexts (webhooks, cron, embeddings).
// Never import this in components or client-side code.
export const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
