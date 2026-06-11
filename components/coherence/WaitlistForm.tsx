"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export function WaitlistForm({ variant = "light" }: { variant?: "light" | "dark" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const dark = variant === "dark";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/coherence/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
      setStatus("success");
      setMessage(data.already ? "Vous êtes déjà sur la liste — à très vite." : "Vous êtes sur la liste. À très vite.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Une erreur est survenue.");
    }
  }

  if (status === "success") {
    return (
      <div className={`flex items-center gap-3 ${dark ? "text-white" : "text-ns-black"}`}>
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-ns-blue text-white shrink-0">
          <Check className="w-5 h-5" strokeWidth={2.5} />
        </span>
        <p className="text-sm font-sans font-medium">{message}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          autoComplete="email"
          className={`flex-1 px-5 py-3.5 rounded-full text-sm font-sans focus:outline-none transition-colors ${
            dark
              ? "bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-white/50"
              : "bg-neutral-50 border border-neutral-200 text-ns-black placeholder-neutral-400 focus:border-ns-blue"
          }`}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-ns-blue text-white text-sm font-sans font-bold transition-all duration-200 hover:scale-[1.04] hover:shadow-[0_0_28px_rgba(34,51,240,0.45)] active:scale-95 disabled:opacity-60 disabled:hover:scale-100 shrink-0 motion-reduce:transform-none"
        >
          {status === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Rejoindre la liste
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2.5 text-sm font-sans text-red-500">{message}</p>
      )}
      <p className={`mt-3 text-xs font-sans ${dark ? "text-white/40" : "text-neutral-400"}`}>
        Accès anticipé. Pas de spam, désinscription en un clic.{" "}
        <a
          href="/legal/confidentialite"
          className={`underline underline-offset-2 transition-colors ${dark ? "hover:text-white/70" : "hover:text-neutral-600"}`}
        >
          Confidentialité
        </a>
      </p>
    </div>
  );
}
