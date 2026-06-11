"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, X } from "lucide-react";
import { createCampaign } from "@/lib/actions/campaigns";
import { renderEmailHtml } from "@/lib/email/render";
import {
  EMAIL_TEMPLATES, SAMPLE_ARTICLES, buildTemplate, type EmailTemplateId,
} from "@/lib/email/templates";
import { SITE_URL, SITE_NAME } from "@/lib/config";

export function NewCampaignButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState<EmailTemplateId | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Vignettes : le vrai moteur de rendu sur des articles factices, mis à
  // l'échelle dans une iframe — ce que vous voyez est ce qui sera créé.
  const previews = useMemo(() => {
    const map = {} as Record<EmailTemplateId, string>;
    for (const t of EMAIL_TEMPLATES) {
      const { preheader, blocks } = buildTemplate(t.id, SAMPLE_ARTICLES, SITE_URL);
      map[t.id] = renderEmailHtml(blocks, { siteUrl: SITE_URL, siteName: SITE_NAME, preheader });
    }
    return map;
  }, []);

  async function handlePick(template: EmailTemplateId) {
    if (creating) return;
    setError(null);
    setCreating(template);
    const result = await createCampaign(template);
    if (result.ok && result.id) {
      router.push(`/dashboard/newsletter/${result.id}`);
    } else {
      setCreating(null);
      setError(result.error ?? "Impossible de créer la campagne.");
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ns-blue text-white text-sm font-sans font-semibold hover:opacity-90 transition-opacity duration-200"
      >
        <Plus className="w-4 h-4" strokeWidth={2} />
        Nouvelle campagne
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-16 px-4 overflow-y-auto"
          onClick={() => !creating && setOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden mb-16"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <div>
                <h2 className="font-heading font-black text-lg text-ns-black">Nouvelle campagne</h2>
                <p className="text-xs text-neutral-400 font-sans mt-0.5">
                  Choisissez un point de départ — tout reste modifiable bloc par bloc.
                </p>
              </div>
              <button
                onClick={() => !creating && setOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-ns-black hover:bg-neutral-100 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            {error && (
              <p className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-sans text-red-600">
                {error}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
              {EMAIL_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handlePick(t.id)}
                  disabled={!!creating}
                  className="group text-left rounded-2xl border border-neutral-200 overflow-hidden hover:border-ns-blue hover:shadow-[0_8px_30px_rgba(34,51,240,0.12)] transition-all duration-200 disabled:opacity-60"
                >
                  {/* Vignette — iframe inert mise à l'échelle */}
                  <div className="relative h-44 bg-neutral-100 overflow-hidden pointer-events-none">
                    <iframe
                      title={`Aperçu — ${t.name}`}
                      srcDoc={previews[t.id]}
                      sandbox=""
                      tabIndex={-1}
                      aria-hidden="true"
                      scrolling="no"
                      className="absolute top-0 left-1/2 bg-white origin-top"
                      style={{
                        width: 640,
                        height: 720,
                        border: 0,
                        transform: "translateX(-50%) scale(0.26)",
                      }}
                    />
                    {creating === t.id && (
                      <span className="absolute inset-0 flex items-center justify-center bg-white/60">
                        <Loader2 className="w-5 h-5 animate-spin text-ns-blue" />
                      </span>
                    )}
                  </div>
                  <div className="px-4 py-3.5 border-t border-neutral-100">
                    <p className="font-sans font-semibold text-sm text-ns-black group-hover:text-ns-blue transition-colors">
                      {t.name}
                    </p>
                    <p className="text-xs text-neutral-400 font-sans mt-0.5 leading-5">{t.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
