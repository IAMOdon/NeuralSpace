import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type Client = SupabaseClient<Database>;

/**
 * Authorization, not authentication.
 *
 * A Supabase session only proves that someone signed up, and this project
 * accepts self-service signup — so "a user exists" is not an admin check.
 * Admin rights come from a row in `public.admins`, which RLS lets the caller
 * read for themselves, so this works with the request-scoped client and never
 * needs the service-role key.
 *
 * Fails closed: any error answers "not an admin".
 */
export async function isAdmin(supabase: Client, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[auth] admin lookup failed:", error.message);
    return false;
  }
  return data !== null;
}

/** The signed-in admin, or null when the caller is not signed in or not an admin. */
export async function getAdminUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return (await isAdmin(supabase, user.id)) ? user : null;
}

/**
 * Guard for `"use server"` actions: returns the admin or throws. The message is
 * deliberately the same whether the caller is anonymous or merely not an admin,
 * so it does not confirm which accounts exist.
 */
export async function requireAdmin(): Promise<User> {
  const user = await getAdminUser();
  if (!user) throw new Error("Accès refusé.");
  return user;
}
