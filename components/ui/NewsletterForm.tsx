"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
      setStatus("success");
      setMessage(data.already ? "Vous êtes déjà inscrit·e — merci !" : "Inscription confirmée. À bientôt !");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Une erreur est survenue.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2.5 text-white">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-ns-blue shrink-0">
          <Check className="w-4 h-4" strokeWidth={2.5} />
        </span>
        <p className="text-sm font-sans font-medium">{message}</p>
      </div>
    );
  }

  return (
    <div className="w-full md:w-auto">
      <form className="flex gap-2 w-full md:w-auto" onSubmit={handleSubmit}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          autoComplete="email"
          className="flex-1 md:w-64 px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/50 focus:bg-white/10 font-sans transition-colors"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-5 py-2.5 rounded-full bg-white text-ns-blue text-sm font-sans font-semibold hover:opacity-90 transition-opacity shrink-0 disabled:opacity-60 inline-flex items-center justify-center"
        >
          {status === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "S'inscrire"
          )}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 text-xs font-sans text-red-300">{message}</p>
      )}
      <p className="mt-2 text-[11px] font-sans text-white/40">
        Désinscription en un clic.{" "}
        <a href="/legal/confidentialite" className="underline underline-offset-2 hover:text-white/70 transition-colors">
          Politique de confidentialité
        </a>
      </p>
    </div>
  );
}
