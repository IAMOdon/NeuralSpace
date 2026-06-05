"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { SITE_NAME } from "@/lib/config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">

        {/* Logo */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1">
            <span className="font-heading font-black text-2xl tracking-widest text-ns-black uppercase">
              {SITE_NAME}
            </span>
            <span className="w-2 h-2 rounded-full bg-ns-blue mb-3" />
          </div>
          <p className="text-sm text-neutral-400 font-sans">Espace administration</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-7 space-y-5">
          <h1 className="font-heading font-bold text-lg text-ns-black">Se connecter</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-sans font-semibold text-neutral-500 uppercase tracking-widest">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-sans text-ns-black placeholder-neutral-300 focus:outline-none focus:border-ns-blue transition-colors duration-200 bg-neutral-50"
                placeholder="admin@neuralspace.fr"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-sans font-semibold text-neutral-500 uppercase tracking-widest">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-sans text-ns-black placeholder-neutral-300 focus:outline-none focus:border-ns-blue transition-colors duration-200 bg-neutral-50"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs font-sans text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-ns-blue text-white text-sm font-sans font-semibold hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-neutral-300 font-sans">
          Accès réservé à l&apos;équipe Neural Space
        </p>
      </div>
    </div>
  );
}
