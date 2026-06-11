import "server-only";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Un compte authentifié n'est PAS forcément admin (futurs rôles author/institution).
// Admin = app_metadata.role === "admin" (posé via l'API admin Supabase, non modifiable
// par l'utilisateur) ou email présent dans ADMIN_EMAILS (filet de secours).
const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
);

export function isAdminUser(user: User | null): user is User {
  if (!user) return false;
  if (user.app_metadata?.role === "admin") return true;
  return !!user.email && ADMIN_EMAILS.has(user.email.toLowerCase());
}

export async function getAdminUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return isAdminUser(user) ? user : null;
}

export async function ensureAdmin(): Promise<User> {
  const user = await getAdminUser();
  if (!user) throw new Error("Accès réservé à l'administrateur.");
  return user;
}
