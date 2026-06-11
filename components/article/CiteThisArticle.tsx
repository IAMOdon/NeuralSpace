"use client";

import { useState } from "react";
import { Quote, Check, Copy, X } from "lucide-react";
import { SITE_NAME } from "@/lib/config";

type Props = {
  title: string;
  authors: string[];
  publishedAt: string | null;
  url: string;
};

function buildApa({ title, authors, publishedAt, url }: Props): string {
  const year = publishedAt ? new Date(publishedAt).getFullYear() : new Date().getFullYear();
  const who = authors.length > 0 ? authors.join(", ") : SITE_NAME;
  return `${who} (${year}). ${title}. ${SITE_NAME}. ${url}`;
}

function buildBibtex({ title, authors, publishedAt, url }: Props): string {
  const year = publishedAt ? new Date(publishedAt).getFullYear() : new Date().getFullYear();
  const key = url.split("/").pop()?.replace(/[^a-z0-9-]/gi, "") ?? "article";
  const who = authors.length > 0 ? authors.join(" and ") : SITE_NAME;
  return `@misc{neuralspace_${key},
  author       = {${who}},
  title        = {${title}},
  year         = {${year}},
  howpublished = {\\url{${url}}},
  note         = {${SITE_NAME}}
}`;
}

export function CiteThisArticle(props: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"apa" | "bibtex" | null>(null);

  async function copy(kind: "apa" | "bibtex", text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // clipboard refusé — l'utilisateur peut copier manuellement le texte affiché
    }
  }

  const apa = buildApa(props);
  const bibtex = buildBibtex(props);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-xs font-sans text-neutral-400 hover:text-ns-blue transition-colors duration-200"
      >
        <Quote className="w-3.5 h-3.5" strokeWidth={1.75} />
        Citer cet article
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Citer cet article"
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-neutral-100">
              <h2 className="font-heading font-bold text-base text-ns-black">Citer cet article</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="p-2 rounded-xl text-neutral-400 hover:text-ns-black hover:bg-neutral-100 transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {([["apa", "APA", apa], ["bibtex", "BibTeX", bibtex]] as const).map(([kind, label, text]) => (
                <div key={kind} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">{label}</p>
                    <button
                      onClick={() => copy(kind, text)}
                      className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-ns-blue hover:opacity-70 transition-opacity"
                    >
                      {copied === kind ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied === kind ? "Copié" : "Copier"}
                    </button>
                  </div>
                  <pre className="rounded-xl bg-neutral-50 border border-neutral-100 p-3.5 text-[11px] font-mono text-neutral-600 whitespace-pre-wrap break-all leading-5">
                    {text}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
