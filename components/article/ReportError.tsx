"use client";

import { useState } from "react";
import { Flag, Check, Loader2, X } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-sans text-ns-black placeholder-neutral-300 focus:outline-none focus:border-ns-blue transition-colors";

// « Note de la communauté », version média : signalement privé relu par la
// rédaction, qui publie ensuite une correction datée visible sur l'article.
export function ReportError({ articleId }: { articleId: string }) {
  const [open, setOpen] = useState(false);
  const [quote, setQuote] = useState("");
  const [message, setMessage] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function openModal() {
    // Pré-remplit le passage concerné avec la sélection en cours, le cas échéant
    const selection = window.getSelection()?.toString().trim() ?? "";
    if (selection && selection.length <= 500) setQuote(selection);
    setOpen(true);
  }

  function close() {
    if (status === "loading") return;
    setOpen(false);
    if (status === "success") {
      setQuote(""); setMessage(""); setSourceUrl(""); setEmail("");
      setStatus("idle");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/report-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          message: message.trim(),
          ...(quote.trim() && { quote: quote.trim() }),
          ...(sourceUrl.trim() && { sourceUrl: sourceUrl.trim() }),
          ...(email.trim() && { email: email.trim() }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Une erreur est survenue.");
    }
  }

  return (
    <>
      <button
        onClick={openModal}
        className="inline-flex items-center gap-2 text-xs font-sans text-neutral-400 hover:text-ns-blue transition-colors duration-200"
      >
        <Flag className="w-3.5 h-3.5" strokeWidth={1.75} />
        Signaler une erreur
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Signaler une erreur"
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 p-4"
          onClick={close}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-neutral-100">
              <div>
                <h2 className="font-heading font-bold text-base text-ns-black">Signaler une erreur</h2>
                <p className="text-xs text-neutral-400 font-sans mt-0.5 leading-5">
                  Votre signalement est relu par la rédaction. Si l&apos;erreur est avérée,
                  une correction datée sera publiée sur l&apos;article.
                </p>
              </div>
              <button
                onClick={close}
                aria-label="Fermer"
                className="p-2 rounded-xl text-neutral-400 hover:text-ns-black hover:bg-neutral-100 transition-colors shrink-0"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            {status === "success" ? (
              <div className="px-6 py-10 text-center space-y-3">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-600">
                  <Check className="w-6 h-6" strokeWidth={2.5} />
                </span>
                <p className="font-sans font-semibold text-sm text-ns-black">Merci pour votre vigilance.</p>
                <p className="text-xs text-neutral-400 font-sans leading-5">
                  Le signalement a été transmis à la rédaction.
                </p>
                <button
                  onClick={close}
                  className="mt-2 px-5 py-2.5 rounded-full bg-ns-blue text-white text-sm font-sans font-semibold hover:opacity-90 transition-opacity"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-3">
                <div>
                  <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                    Passage concerné <span className="font-normal normal-case tracking-normal">(optionnel)</span>
                  </label>
                  <textarea
                    value={quote}
                    onChange={(e) => setQuote(e.target.value.slice(0, 500))}
                    rows={2}
                    placeholder="Copiez le passage erroné — ou sélectionnez-le avant d'ouvrir ce formulaire"
                    className={`${inputCls} resize-none`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                    Quelle est l&apos;erreur ? <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    minLength={10}
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
                    rows={3}
                    placeholder="Décrivez l'erreur factuelle et, si possible, la version correcte"
                    className={`${inputCls} resize-none`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                    Source <span className="font-normal normal-case tracking-normal">(DOI, article, optionnel)</span>
                  </label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://doi.org/…"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                    E-mail <span className="font-normal normal-case tracking-normal">(optionnel — si vous souhaitez être recontacté·e)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className={inputCls}
                  />
                </div>

                {status === "error" && (
                  <p className="text-xs font-sans text-red-500">{errorMsg}</p>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={status === "loading" || message.trim().length < 10}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ns-blue text-white text-sm font-sans font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
                    Envoyer le signalement
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
