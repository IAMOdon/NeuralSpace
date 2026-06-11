"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Type, AlignLeft,
  Image as ImageIcon, MousePointerClick, Minus, FileText, Loader2,
  Send, FlaskConical, Monitor, Smartphone, Check, AlertTriangle, Search,
} from "lucide-react";
import { renderEmailHtml } from "@/lib/email/render";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  updateCampaign, deleteCampaign, sendTestEmail, sendCampaign,
  searchArticlesForEmail, type ArticlePick,
} from "@/lib/actions/campaigns";
import { SITE_URL, SITE_NAME } from "@/lib/config";
import type { Campaign, EmailBlock, EmailBlockType } from "@/types/email";

let blockCounter = 0;
function newId(): string {
  return `b${Date.now().toString(36)}${(blockCounter++).toString(36)}`;
}

function emptyBlock(type: EmailBlockType): EmailBlock | null {
  const id = newId();
  switch (type) {
    case "heading": return { id, type, text: "" };
    case "paragraph": return { id, type, text: "" };
    case "image": return { id, type, url: "", alt: "" };
    case "button": return { id, type, label: "", url: "" };
    case "divider": return { id, type };
    case "article": return null; // inséré via le picker
  }
}

const ADDABLE: { type: EmailBlockType; label: string; icon: React.ElementType }[] = [
  { type: "heading", label: "Titre", icon: Type },
  { type: "paragraph", label: "Paragraphe", icon: AlignLeft },
  { type: "article", label: "Article", icon: FileText },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "button", label: "Bouton", icon: MousePointerClick },
  { type: "divider", label: "Séparateur", icon: Minus },
];

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-sans text-ns-black placeholder-neutral-300 focus:outline-none focus:border-ns-blue transition-colors";

type SaveState = "saved" | "dirty" | "saving";

export function EmailBuilder({
  initial,
  emailConfigured,
}: {
  initial: Campaign;
  emailConfigured: boolean;
}) {
  const router = useRouter();
  const readonly = initial.status === "sent";

  const [subject, setSubject] = useState(initial.subject);
  const [preheader, setPreheader] = useState(initial.preheader);
  const [blocks, setBlocks] = useState<EmailBlock[]>(initial.blocks);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [mobile, setMobile] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"send" | "delete" | null>(null);

  // ── Autosave (debounce 1,2 s) ───────────────────────────────────────────────
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef({ subject, preheader, blocks });
  latest.current = { subject, preheader, blocks };

  const doSave = useCallback(async () => {
    if (readonly) return;
    setSaveState("saving");
    const { subject, preheader, blocks } = latest.current;
    const result = await updateCampaign(initial.id, { subject, preheader, blocks });
    setSaveState(result.ok ? "saved" : "dirty");
    if (!result.ok) setFeedback({ kind: "error", text: result.error ?? "Échec de l'enregistrement." });
  }, [initial.id, readonly]);

  const markDirty = useCallback(() => {
    if (readonly) return;
    setSaveState("dirty");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(doSave, 1200);
  }, [doSave, readonly]);

  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);

  // ── Mutations de blocs ──────────────────────────────────────────────────────
  function patchBlock(id: string, patch: Partial<EmailBlock>) {
    setBlocks((bs) => bs.map((b) => (b.id === id ? ({ ...b, ...patch } as EmailBlock) : b)));
    markDirty();
  }

  function removeBlock(id: string) {
    setBlocks((bs) => bs.filter((b) => b.id !== id));
    markDirty();
  }

  function moveBlock(id: string, dir: -1 | 1) {
    setBlocks((bs) => {
      const i = bs.findIndex((b) => b.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= bs.length) return bs;
      const next = [...bs];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });
    markDirty();
  }

  function addBlock(type: EmailBlockType) {
    if (type === "article") { setPickerOpen(true); return; }
    const block = emptyBlock(type);
    if (block) { setBlocks((bs) => [...bs, block]); markDirty(); }
  }

  function addArticle(pick: ArticlePick) {
    setBlocks((bs) => [...bs, { id: newId(), type: "article", ...pick }]);
    setPickerOpen(false);
    markDirty();
  }

  // ── Envois ──────────────────────────────────────────────────────────────────
  async function handleTest() {
    setFeedback(null);
    if (saveState !== "saved") await doSave();
    const result = await sendTestEmail(initial.id, testEmail);
    setFeedback(result.ok
      ? { kind: "ok", text: `Test envoyé à ${testEmail}.` }
      : { kind: "error", text: result.error ?? "Échec du test." });
  }

  async function handleSend() {
    setFeedback(null);
    setSending(true);
    if (saveState !== "saved") await doSave();
    const result = await sendCampaign(initial.id);
    setSending(false);
    setConfirmAction(null);
    if (result.ok) {
      setFeedback({ kind: "ok", text: `Campagne envoyée à ${result.sent} abonné(s).` });
      router.refresh();
    } else {
      setFeedback({ kind: "error", text: result.error ?? "Échec de l'envoi." });
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteCampaign(initial.id);
    if (result.ok) {
      router.push("/dashboard/newsletter");
    } else {
      setDeleting(false);
      setConfirmAction(null);
      setFeedback({ kind: "error", text: result.error ?? "Échec de la suppression." });
    }
  }

  // ── Preview ─────────────────────────────────────────────────────────────────
  const previewHtml = useMemo(
    () => renderEmailHtml(blocks, { siteUrl: SITE_URL, siteName: SITE_NAME, preheader }),
    [blocks, preheader]
  );

  return (
    <div className="p-6 md:p-8 space-y-6 w-full max-w-[1500px]">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/newsletter"
            className="p-2 rounded-xl text-neutral-400 hover:text-ns-black hover:bg-neutral-100 transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </Link>
          <div>
            <h1 className="font-heading font-black text-2xl text-ns-black">
              {readonly ? "Campagne envoyée" : "Campagne"}
            </h1>
            <p className="text-xs text-neutral-400 font-sans mt-0.5">
              {readonly
                ? `Envoyée à ${initial.recipientCount ?? 0} abonné(s) — lecture seule`
                : saveState === "saving" ? "Enregistrement…"
                : saveState === "dirty" ? "Modifications non enregistrées"
                : "Enregistré"}
            </p>
          </div>
        </div>

        {!readonly && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmAction("delete")}
              className="p-2.5 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label="Supprimer le brouillon"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setConfirmAction("send")}
              disabled={sending || !emailConfigured}
              title={emailConfigured ? undefined : "Configurer RESEND_API_KEY et EMAIL_FROM"}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ns-blue text-white text-sm font-sans font-semibold hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" strokeWidth={2} />}
              Envoyer
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmAction === "delete"}
        title="Supprimer ce brouillon ?"
        message="La campagne et son contenu seront définitivement supprimés."
        confirmLabel="Supprimer"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setConfirmAction(null)}
      />
      <ConfirmDialog
        open={confirmAction === "send"}
        title="Envoyer la campagne ?"
        message="Elle partira immédiatement à tous les abonnés actifs. Cette action est définitive — une campagne envoyée devient immuable."
        confirmLabel="Envoyer maintenant"
        variant="primary"
        loading={sending}
        onConfirm={handleSend}
        onClose={() => setConfirmAction(null)}
      />

      {/* Config warning */}
      {!emailConfigured && !readonly && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" strokeWidth={2} />
          <p className="text-sm font-sans text-amber-800">
            L&apos;envoi est désactivé : ajoutez <code className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">RESEND_API_KEY</code> et{" "}
            <code className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">EMAIL_FROM</code> dans l&apos;environnement
            (domaine vérifié chez Resend). Le builder et la prévisualisation fonctionnent normalement.
          </p>
        </div>
      )}

      {feedback && (
        <div className={`flex items-center gap-2.5 rounded-2xl px-5 py-3.5 text-sm font-sans ${
          feedback.kind === "ok"
            ? "border border-green-200 bg-green-50 text-green-700"
            : "border border-red-200 bg-red-50 text-red-600"
        }`}>
          {feedback.kind === "ok" ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          {feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

        {/* ── Éditeur ── */}
        <div className="space-y-5">

          {/* Subject / preheader */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 space-y-3">
            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                Objet
              </label>
              <input
                value={subject}
                onChange={(e) => { setSubject(e.target.value); markDirty(); }}
                disabled={readonly}
                placeholder="L'objet de votre e-mail"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                Préheader <span className="normal-case font-normal tracking-normal">— aperçu affiché après l&apos;objet dans la boîte de réception</span>
              </label>
              <input
                value={preheader}
                onChange={(e) => { setPreheader(e.target.value); markDirty(); }}
                disabled={readonly}
                placeholder="Une phrase qui donne envie d'ouvrir"
                className={inputCls}
              />
            </div>
          </div>

          {/* Blocks */}
          <div className="space-y-3">
            {blocks.map((block, i) => (
              <div key={block.id} className="rounded-2xl border border-neutral-100 bg-white p-4 group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">
                    {ADDABLE.find((a) => a.type === block.type)?.label ?? block.type}
                  </span>
                  {!readonly && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => moveBlock(block.id, -1)} disabled={i === 0} className="p-1.5 rounded-lg text-neutral-400 hover:text-ns-blue hover:bg-ns-blue/5 disabled:opacity-30 transition-colors" aria-label="Monter">
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => moveBlock(block.id, 1)} disabled={i === blocks.length - 1} className="p-1.5 rounded-lg text-neutral-400 hover:text-ns-blue hover:bg-ns-blue/5 disabled:opacity-30 transition-colors" aria-label="Descendre">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => removeBlock(block.id)} className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors" aria-label="Supprimer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <BlockFields block={block} readonly={readonly} onChange={(patch) => patchBlock(block.id, patch)} />
              </div>
            ))}

            {blocks.length === 0 && (
              <div className="rounded-2xl border border-dashed border-neutral-200 px-5 py-10 text-center">
                <p className="text-sm text-neutral-400 font-sans">
                  Campagne vide — ajoutez un premier bloc ci-dessous.
                </p>
              </div>
            )}
          </div>

          {/* Add block */}
          {!readonly && (
            <div className="flex items-center gap-2 flex-wrap">
              {ADDABLE.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => addBlock(type)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-neutral-200 bg-white text-xs font-sans font-semibold text-neutral-500 hover:border-ns-blue hover:text-ns-blue transition-colors"
                >
                  <Plus className="w-3 h-3" strokeWidth={2.5} />
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Test send */}
          {!readonly && (
            <div className="rounded-2xl border border-neutral-100 bg-white p-5 space-y-2">
              <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">
                E-mail de test
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className={inputCls}
                />
                <button
                  onClick={handleTest}
                  disabled={!emailConfigured || !testEmail}
                  title={emailConfigured ? undefined : "Configurer RESEND_API_KEY et EMAIL_FROM"}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-sans font-semibold text-ns-black hover:border-ns-blue hover:text-ns-blue transition-colors shrink-0 disabled:opacity-50"
                >
                  <FlaskConical className="w-4 h-4" strokeWidth={1.75} />
                  Tester
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Preview ── */}
        <div className="space-y-3 xl:sticky xl:top-6">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">
              Prévisualisation
            </p>
            <div className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white p-1">
              <button
                onClick={() => setMobile(false)}
                className={`p-1.5 rounded-full transition-colors ${!mobile ? "bg-ns-blue text-white" : "text-neutral-400 hover:text-ns-black"}`}
                aria-label="Aperçu desktop"
              >
                <Monitor className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
              <button
                onClick={() => setMobile(true)}
                className={`p-1.5 rounded-full transition-colors ${mobile ? "bg-ns-blue text-white" : "text-neutral-400 hover:text-ns-black"}`}
                aria-label="Aperçu mobile"
              >
                <Smartphone className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-100 bg-neutral-100 overflow-hidden flex justify-center">
            <iframe
              title="Prévisualisation de l'e-mail"
              srcDoc={previewHtml}
              sandbox=""
              className="bg-white transition-all duration-200"
              style={{ width: mobile ? 375 : "100%", height: 720, border: 0 }}
            />
          </div>
        </div>
      </div>

      {pickerOpen && <ArticlePicker onPick={addArticle} onClose={() => setPickerOpen(false)} />}
    </div>
  );
}

// ── Champs par type de bloc ───────────────────────────────────────────────────

function BlockFields({
  block,
  readonly,
  onChange,
}: {
  block: EmailBlock;
  readonly: boolean;
  onChange: (patch: Partial<EmailBlock>) => void;
}) {
  switch (block.type) {
    case "heading":
      return (
        <input
          value={block.text}
          onChange={(e) => onChange({ text: e.target.value })}
          disabled={readonly}
          placeholder="Texte du titre"
          className={inputCls}
        />
      );

    case "paragraph":
      return (
        <div className="space-y-1.5">
          <textarea
            value={block.text}
            onChange={(e) => onChange({ text: e.target.value })}
            disabled={readonly}
            placeholder="Votre texte…"
            rows={4}
            className={`${inputCls} resize-y leading-relaxed`}
          />
          <p className="text-[11px] text-neutral-300 font-sans">
            **gras** · *italique* · [lien](https://…)
          </p>
        </div>
      );

    case "image":
      return (
        <div className="space-y-2">
          <input value={block.url} onChange={(e) => onChange({ url: e.target.value })} disabled={readonly} placeholder="URL de l'image (https://…)" className={inputCls} />
          <input value={block.alt} onChange={(e) => onChange({ alt: e.target.value })} disabled={readonly} placeholder="Texte alternatif (obligatoire)" className={inputCls} />
          <input value={block.href ?? ""} onChange={(e) => onChange({ href: e.target.value || undefined })} disabled={readonly} placeholder="Lien au clic (optionnel)" className={inputCls} />
        </div>
      );

    case "button":
      return (
        <div className="space-y-2">
          <input value={block.label} onChange={(e) => onChange({ label: e.target.value })} disabled={readonly} placeholder="Libellé du bouton" className={inputCls} />
          <input value={block.url} onChange={(e) => onChange({ url: e.target.value })} disabled={readonly} placeholder="https://…" className={inputCls} />
        </div>
      );

    case "divider":
      return <div className="border-t border-neutral-200" />;

    case "article":
      return (
        <div className="flex items-center gap-3">
          {block.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={block.coverImageUrl} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-sans font-medium text-sm text-ns-black line-clamp-1">{block.title}</p>
            <p className="text-xs text-neutral-400 font-sans line-clamp-1">{block.summary}</p>
          </div>
        </div>
      );
  }
}

// ── Picker d'articles publiés ─────────────────────────────────────────────────

function ArticlePicker({
  onPick,
  onClose,
}: {
  onPick: (pick: ArticlePick) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ArticlePick[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      const articles = await searchArticlesForEmail(q);
      if (!cancelled) { setResults(articles); setLoading(false); }
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-24 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-neutral-100">
          <Search className="w-4 h-4 text-neutral-300 shrink-0" strokeWidth={2} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un article publié…"
            className="flex-1 text-sm font-sans text-ns-black placeholder-neutral-300 focus:outline-none"
          />
        </div>
        <div className="max-h-96 overflow-y-auto divide-y divide-neutral-50">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-neutral-300" />
            </div>
          ) : results.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-neutral-400 font-sans">
              Aucun article publié trouvé.
            </p>
          ) : (
            results.map((a) => (
              <button
                key={a.articleId}
                onClick={() => onPick(a)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition-colors"
              >
                {a.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.coverImageUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl shrink-0" style={{ backgroundColor: `${a.categoryColor ?? "#2233f0"}18` }} />
                )}
                <div className="min-w-0">
                  <p className="font-sans font-medium text-sm text-ns-black line-clamp-1">{a.title}</p>
                  <p className="text-xs text-neutral-400 font-sans line-clamp-1">{a.summary}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
