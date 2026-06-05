"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft, Eye, Trash2, Upload, X, ChevronDown, FileJson, Check, AlertCircle,
} from "lucide-react";
import { BlockEditor, countBlockWords } from "./BlockEditor";
import { ContributorPicker } from "./ContributorPicker";
import type { ContributorRef } from "./ContributorPicker";
import { parseBlocks } from "@/lib/content/parseBlocks";
import { slugify } from "@/lib/slug";
import { createArticle, updateArticle, publishArticle, unpublishArticle, deleteArticle } from "@/lib/actions/articles";
import { updateArticleContributors } from "@/lib/actions/contributors";
import type { ContentBlock } from "@/types/content";
import "./editor.css";

type Category = { id: string; name: string; slug: string; colorHex: string | null };

type ArticleData = {
  id?: string;
  title: string;
  summary: string;
  content: unknown;
  type: string;
  status: string;
  slug: string;
  categoryId: string | null;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  sources: { label: string; url?: string }[];
  isSponsored?: boolean;
};

type Props = {
  article: ArticleData;
  categories: Category[];
  initialContributors?: ContributorRef[];
};

// ── Small helpers ─────────────────────────────────────────────────────────────

function SideLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
      {children}
    </p>
  );
}

function SideInput({ value, onChange, placeholder, id }: {
  value: string; onChange: (v: string) => void; placeholder?: string; id?: string;
}) {
  return (
    <input
      id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-xs font-sans text-ns-black placeholder-neutral-300 focus:outline-none focus:border-ns-blue transition-colors duration-200"
    />
  );
}

function SideTextarea({ value, onChange, placeholder, rows = 2 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-xs font-sans text-ns-black placeholder-neutral-300 focus:outline-none focus:border-ns-blue transition-colors duration-200 resize-none"
    />
  );
}

// ── JSON import panel ─────────────────────────────────────────────────────────

type ImportMeta = {
  title?: string; summary?: string; slug?: string;
  seoTitle?: string; seoDesc?: string;
  sources?: { label: string; url?: string }[];
  coverUrl?: string; coverAlt?: string;
  categoryId?: string;
};

function JsonImportPanel({ onImport, categories }: {
  onImport: (blocks: object[], meta: ImportMeta) => void;
  categories: Category[];
}) {
  const [open, setOpen]       = useState(false);
  const [raw, setRaw]         = useState("");
  const [status, setStatus]   = useState<"idle" | "ok" | "error">("idle");
  const [errMsg, setErrMsg]   = useState("");

  function handleApply() {
    try {
      const parsed = JSON.parse(raw);
      // Accept full article wrapper OR bare blocks array
      const blocks: unknown[]     = Array.isArray(parsed) ? parsed : (parsed.content ?? []);
      const meta: ImportMeta = {};
      if (!Array.isArray(parsed)) {
        if (parsed.title)          meta.title   = parsed.title;
        if (parsed.summary)        meta.summary = parsed.summary;
        if (parsed.slug)           meta.slug    = parsed.slug;
        if (parsed.seo_title)        meta.seoTitle  = parsed.seo_title;
        if (parsed.seo_description)  meta.seoDesc   = parsed.seo_description;
        if (parsed.cover_image_url)  meta.coverUrl  = parsed.cover_image_url;
        if (parsed.cover_image_alt)  meta.coverAlt  = parsed.cover_image_alt;
        if (parsed.category_slug) {
          const match = categories.find((c) => c.slug === parsed.category_slug);
          if (match) meta.categoryId = match.id;
        }
        if (Array.isArray(parsed.sources)) meta.sources = parsed.sources;
      }
      if (!blocks.length) throw new Error("Aucun block trouvé.");
      onImport(blocks as object[], meta);
      setStatus("ok");
      setTimeout(() => { setStatus("idle"); setOpen(false); setRaw(""); }, 1800);
    } catch (e) {
      setStatus("error");
      setErrMsg(e instanceof Error ? e.message : "JSON invalide.");
    }
  }

  return (
    <div className="mt-10 border-t border-neutral-100 pt-6">
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); setStatus("idle"); }}
        className="flex items-center gap-2 text-xs font-sans font-semibold text-neutral-400 hover:text-ns-blue transition-colors duration-200"
      >
        <FileJson className="w-4 h-4" strokeWidth={1.5} />
        {open ? "Fermer l'import JSON" : "Importer depuis JSON (Grok)"}
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <p className="text-[11px] text-neutral-400 font-sans leading-5">
            Colle ici le JSON généré par Grok. Format accepté : tableau de blocks <code className="bg-neutral-100 px-1 rounded">ContentBlock[]</code>, ou objet complet avec <code className="bg-neutral-100 px-1 rounded">title</code>, <code className="bg-neutral-100 px-1 rounded">summary</code>, <code className="bg-neutral-100 px-1 rounded">content</code>, etc.
          </p>
          <textarea
            value={raw}
            onChange={(e) => { setRaw(e.target.value); setStatus("idle"); }}
            rows={10}
            placeholder={'[\n  { "id": "b1", "type": "heading", "content": "Mon titre" },\n  ...\n]'}
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-xs font-mono text-ns-black placeholder-neutral-300 focus:outline-none focus:border-ns-blue transition-colors duration-200 resize-y"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleApply}
              disabled={!raw.trim()}
              className="px-4 py-2 rounded-xl bg-ns-blue text-white text-xs font-sans font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Appliquer
            </button>
            {status === "ok" && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-sans">
                <Check className="w-3.5 h-3.5" /> Importé
              </span>
            )}
            {status === "error" && (
              <span className="flex items-center gap-1 text-xs text-red-500 font-sans">
                <AlertCircle className="w-3.5 h-3.5" /> {errMsg}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ArticleEditor({ article: initial, categories, initialContributors = [] }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [id]            = useState(initial.id);
  const [status, setStatus] = useState(initial.status);
  const [title, setTitle]   = useState(initial.title);
  const [summary, setSummary] = useState(initial.summary);
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => parseBlocks(initial.content));
  const [slug, setSlug]     = useState(initial.slug);
  const [slugDirty, setSlugDirty] = useState(!!initial.id);
  const [categoryId, setCategoryId]     = useState<string>(initial.categoryId ?? "");
  const [coverUrl, setCoverUrl]         = useState(initial.coverImageUrl ?? "");
  const [coverAlt, setCoverAlt]         = useState(initial.coverImageAlt ?? "");
  const [seoTitle, setSeoTitle]         = useState(initial.seoTitle ?? "");
  const [seoDesc, setSeoDesc]           = useState(initial.seoDescription ?? "");
  const [sources, setSources]           = useState(initial.sources);
  const [contributors, setContributors] = useState<ContributorRef[]>(initialContributors);
  const [isSponsored, setIsSponsored]   = useState(initial.isSponsored ?? false);
  const [wordCount, setWordCount]       = useState(() => countBlockWords(parseBlocks(initial.content)));
  // Derived — no manual picker
  const articleType = wordCount >= 1500 ? "long" : "short";
  const [uploading, setUploading]       = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Auto-slug from title when not dirty
  function handleTitleChange(v: string) {
    setTitle(v);
    if (!slugDirty) setSlug(slugify(v));
  }

  // Cover image upload
  async function handleCoverUpload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "neuralspace/covers");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json() as { url: string };
      setCoverUrl(url);
    } else {
      const { error } = await res.json().catch(() => ({ error: "Erreur upload" })) as { error?: string };
      flash(error ?? "Erreur upload");
    }
    setUploading(false);
  }

  function buildPayload() {
    return {
      title, summary, content: blocks as Parameters<typeof createArticle>[0]["content"],
      type: articleType, slug: slug || slugify(title),
      categoryId: categoryId || null,
      coverImageUrl: coverUrl || null,
      coverImageAlt: coverAlt || null,
      seoTitle: seoTitle || null,
      seoDescription: seoDesc || null,
      sources: sources as Parameters<typeof createArticle>[0]["sources"],
      isSponsored,
    };
  }

  function flash(msg: string) { setSaveMsg(msg); setTimeout(() => setSaveMsg(null), 3000); }

  function handleSave() {
    startTransition(async () => {
      let articleId = id;
      if (articleId) {
        const r = await updateArticle(articleId, buildPayload());
        if (!r.ok) { flash(`Erreur : ${r.error}`); return; }
        await updateArticleContributors(articleId, contributors);
        flash("Sauvegardé ✓");
      } else {
        const r = await createArticle(buildPayload());
        if (!r.ok || !r.id) { flash(`Erreur : ${r.error}`); return; }
        articleId = r.id;
        await updateArticleContributors(articleId, contributors);
        // Navigate after contributors are saved — flash is set before replace
        // so the new page load shows it is confirmed by the URL change itself.
        router.replace(`/dashboard/articles/${articleId}/edit`);
      }
    });
  }

  function handlePublish() {
    startTransition(async () => {
      if (!id) { flash("Sauvegarde d'abord…"); return; }
      const r = await publishArticle(id);
      if (r.ok) { setStatus("published"); flash("Publié !"); }
      else flash(`Erreur : ${r.error}`);
    });
  }

  function handleUnpublish() {
    startTransition(async () => {
      if (!id) return;
      const r = await unpublishArticle(id);
      if (r.ok) { setStatus("draft"); flash("Repassé en brouillon"); }
      else flash(`Erreur : ${r.error}`);
    });
  }

  function handleDelete() {
    if (!id) return;
    startTransition(async () => { await deleteArticle(id); });
  }


  const isPublished = status === "published";

  return (
    <div className="flex flex-col bg-neutral-50">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 h-14 bg-white border-b border-neutral-100 px-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/articles")}
            className="flex items-center gap-1.5 text-sm font-sans text-neutral-400 hover:text-ns-black transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Articles
          </button>

          {/* Status badge */}
          <div className="relative group">
            <button
              type="button"
              className={`flex items-center gap-1 text-[10px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 rounded-full transition-colors ${
                isPublished
                  ? "bg-green-100 text-green-700"
                  : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              }`}
            >
              {isPublished ? "Publié" : "Brouillon"}
              {!isPublished && <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveMsg && (
            <span className={`flex items-center gap-1 text-xs font-sans hidden sm:flex ${saveMsg.startsWith("Erreur") ? "text-red-500" : "text-green-600"}`}>
              {!saveMsg.startsWith("Erreur") && <Check className="w-3.5 h-3.5" />}
              {saveMsg.replace(" ✓", "")}
            </span>
          )}
          {id && (
            <a
              href={`/dashboard/articles/${id}/preview`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-semibold text-neutral-500 hover:text-ns-black border border-neutral-200 hover:border-neutral-300 transition-colors duration-200"
            >
              <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
              Prévisualiser
            </a>
          )}
          {isPublished && (
            <a
              href={`/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-semibold text-ns-blue hover:opacity-80 border border-ns-blue/30 transition-colors duration-200"
            >
              <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
              Voir live
            </a>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="px-4 py-1.5 rounded-xl text-xs font-sans font-semibold border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-ns-black transition-colors duration-200 disabled:opacity-40"
          >
            {isPending ? "…" : "Sauvegarder"}
          </button>
          {isPublished ? (
            <button
              type="button"
              onClick={handleUnpublish}
              disabled={isPending}
              className="px-4 py-1.5 rounded-xl text-xs font-sans font-semibold bg-neutral-200 text-neutral-700 hover:bg-neutral-300 transition-colors duration-200 disabled:opacity-40"
            >
              Dépublier
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPending}
              className="px-4 py-1.5 rounded-xl text-xs font-sans font-semibold bg-ns-blue text-white hover:opacity-90 transition-opacity duration-200 disabled:opacity-40"
            >
              Publier
            </button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex">

        {/* Editor column */}
        <div className="flex-1 min-w-0">
          <div className="max-w-2xl mx-auto px-6 py-10 space-y-0">

            {/* Cover image */}
            <div
              onClick={() => coverInputRef.current?.click()}
              className={`relative w-full aspect-[16/7] rounded-2xl overflow-hidden mb-8 cursor-pointer group border-2 border-dashed transition-colors duration-200 ${
                coverUrl ? "border-transparent" : "border-neutral-200 hover:border-ns-blue/40 bg-white"
              }`}
            >
              {coverUrl ? (
                <>
                  <Image src={coverUrl} alt={coverAlt || title} fill unoptimized className="object-cover" sizes="(max-width: 1024px) 100vw, 672px" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-sans font-semibold bg-black/50 px-3 py-1.5 rounded-full">
                      Changer l'image
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setCoverUrl(""); }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-neutral-300">
                  {uploading ? (
                    <p className="text-xs font-sans">Upload en cours…</p>
                  ) : (
                    <>
                      <Upload className="w-6 h-6" strokeWidth={1.5} />
                      <p className="text-xs font-sans">Image de couverture — clic ou drag</p>
                    </>
                  )}
                </div>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); }}
              />
            </div>

            {/* Title */}
            <textarea
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Titre de l'article"
              rows={2}
              className="w-full font-heading font-black text-3xl md:text-4xl text-ns-black leading-tight bg-transparent border-none outline-none resize-none placeholder-neutral-200 mb-4"
            />

            {/* Summary */}
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Accroche — une ou deux phrases qui donnent envie de lire."
              rows={2}
              className="w-full text-base text-neutral-400 font-sans leading-relaxed bg-transparent border-none outline-none resize-none placeholder-neutral-200 mb-8"
            />

            {/* Divider */}
            <div className="border-t border-neutral-100 mb-8" />

            {/* Block editor */}
            <BlockEditor
              blocks={blocks}
              onChange={setBlocks}
              onWordCountChange={setWordCount}
            />

            {/* Word count */}
            <p className="mt-6 text-xs text-neutral-300 font-sans text-right">
              {wordCount} mot{wordCount !== 1 ? "s" : ""} · ~{Math.max(1, Math.round(wordCount / 230))} min
            </p>

            {/* ── JSON import panel ── */}
            <JsonImportPanel categories={categories} onImport={(importedBlocks, meta) => {
              setBlocks(parseBlocks(importedBlocks));
              if (meta.title)      setTitle(meta.title);
              if (meta.summary)    setSummary(meta.summary);
              if (meta.seoTitle)   setSeoTitle(meta.seoTitle);
              if (meta.seoDesc)    setSeoDesc(meta.seoDesc);
              if (meta.slug)       { setSlug(meta.slug); setSlugDirty(true); }
              if (meta.sources)    setSources(meta.sources);
              if (meta.coverUrl)   setCoverUrl(meta.coverUrl);
              if (meta.coverAlt)   setCoverAlt(meta.coverAlt);
              if (meta.categoryId) setCategoryId(meta.categoryId);
            }} />
          </div>
        </div>

        {/* ── Right panel — metadata ── */}
        <aside className="w-64 shrink-0 border-l border-neutral-100 bg-white sticky top-14 self-start px-4 py-6 space-y-5 hidden lg:block">

          {/* Catégorie */}
          <div>
            <SideLabel>Catégorie</SideLabel>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-xs font-sans text-ns-black focus:outline-none focus:border-ns-blue transition-colors duration-200"
            >
              <option value="">— Aucune —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Type — auto from word count */}
          <div>
            <SideLabel>Type</SideLabel>
            <p className="text-xs font-sans text-neutral-400">
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${articleType === "long" ? "bg-ns-blue/10 text-ns-blue" : "bg-neutral-100 text-neutral-500"}`}>
                {articleType === "long" ? "Long" : "Court"}
              </span>
              <span className="ml-2 text-neutral-300">calculé depuis {wordCount} mots</span>
            </p>
          </div>

          <div className="border-t border-neutral-100" />

          {/* Slug */}
          <div>
            <SideLabel>Slug</SideLabel>
            <SideInput
              value={slug}
              onChange={(v) => { setSlug(v); setSlugDirty(true); }}
              placeholder="mon-article"
            />
          </div>

          {/* Cover alt */}
          {coverUrl && (
            <div>
              <SideLabel>Alt image</SideLabel>
              <SideInput value={coverAlt} onChange={setCoverAlt} placeholder="Description de l'image" />
            </div>
          )}

          <div className="border-t border-neutral-100" />

          {/* SEO */}
          <div className="space-y-3">
            <SideLabel>SEO</SideLabel>
            <SideInput value={seoTitle} onChange={setSeoTitle} placeholder="Titre SEO (défaut = titre)" />
            <SideTextarea value={seoDesc} onChange={setSeoDesc} placeholder="Description méta (160 car.)" rows={3} />
          </div>

          <div className="border-t border-neutral-100" />

          {/* Sources */}
          <div className="space-y-2">
            <SideLabel>Sources</SideLabel>
            {sources.map((s, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <input
                    value={s.label}
                    onChange={(e) => { const n = [...sources]; n[i] = { ...n[i]!, label: e.target.value }; setSources(n); }}
                    placeholder="Label"
                    className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 text-xs font-sans focus:outline-none focus:border-ns-blue transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setSources(sources.filter((_, j) => j !== i))}
                    className="p-1 text-neutral-300 hover:text-red-400 transition-colors shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <input
                  value={s.url ?? ""}
                  onChange={(e) => { const n = [...sources]; n[i] = { ...n[i]!, url: e.target.value }; setSources(n); }}
                  placeholder="https://…"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 text-xs font-mono text-neutral-500 focus:outline-none focus:border-ns-blue transition-colors"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setSources([...sources, { label: "", url: "" }])}
              className="text-[10px] font-sans font-semibold text-ns-blue hover:opacity-70 transition-opacity"
            >
              + Ajouter une source
            </button>
          </div>

          <div className="border-t border-neutral-100" />

          {/* Contributeurs + sponsorisé */}
          <div>
            <SideLabel>Contributeurs</SideLabel>
            <ContributorPicker
              contributors={contributors}
              onChange={setContributors}
              isSponsored={isSponsored}
              onSponsoredChange={setIsSponsored}
            />
          </div>

          <div className="border-t border-neutral-100" />

          {/* Danger zone */}
          {id && (
            deleteConfirm ? (
              <div className="space-y-2">
                <p className="text-[11px] text-red-500 font-sans text-center leading-5">
                  Supprimer définitivement ?<br />
                  <span className="text-neutral-400">Cette action est irréversible.</span>
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(false)}
                    className="flex-1 py-2 rounded-xl text-xs font-sans font-semibold text-neutral-500 border border-neutral-200 hover:bg-neutral-50 transition-colors duration-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isPending}
                    className="flex-1 py-2 rounded-xl text-xs font-sans font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 disabled:opacity-40"
                  >
                    {isPending ? "…" : "Supprimer"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-sans font-semibold text-red-400 border border-red-100 hover:bg-red-50 transition-colors duration-200"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                Supprimer l'article
              </button>
            )
          )}
        </aside>
      </div>
    </div>
  );
}
