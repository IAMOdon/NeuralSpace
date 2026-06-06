"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft, Eye, Trash2, Upload, X, ChevronDown, FileJson, Check, AlertCircle, BookOpen, Microscope,
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
  contentSimplified?: unknown;
  contentScientific?: unknown;
  hasDualContent?: boolean;
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
      if (parsed.title)      meta.title      = parsed.title;
      if (parsed.summary)    meta.summary    = parsed.summary;
      if (parsed.slug)       meta.slug       = parsed.slug;
      if (parsed.seoTitle)   meta.seoTitle   = parsed.seoTitle;
      if (parsed.seoDesc)    meta.seoDesc    = parsed.seoDesc;
      if (parsed.sources)    meta.sources    = parsed.sources;
      if (parsed.coverUrl)   meta.coverUrl   = parsed.coverUrl;
      if (parsed.coverAlt)   meta.coverAlt   = parsed.coverAlt;
      if (parsed.categoryId) meta.categoryId = parsed.categoryId;
      setStatus("ok");
      setTimeout(() => { setStatus("idle"); setOpen(false); setRaw(""); }, 500);
      onImport(blocks as object[], meta);
    } catch (e) {
      setStatus("error");
      setErrMsg((e instanceof Error) ? e.message : String(e));
    }
  }

  if (!open) return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex items-center gap-1.5 text-xs font-sans text-neutral-300 hover:text-neutral-500 transition-colors mt-6"
    >
      <FileJson className="w-3.5 h-3.5" strokeWidth={1.5} />
      Importer JSON
    </button>
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-lg">Importer JSON</h3>
          <button type="button" onClick={() => setOpen(false)} className="text-neutral-300 hover:text-neutral-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder='{ "content": [...] }'
          rows={8}
          className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-xs font-mono text-ns-black focus:outline-none focus:border-ns-blue transition-colors resize-none"
        />
        {status === "error" && (
          <div className="flex gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="text-xs text-red-700">{errMsg}</span>
          </div>
        )}
        {status === "ok" && (
          <div className="flex gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
            <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <span className="text-xs text-green-700">Importé ✓</span>
          </div>
        )}
        <button
          type="button"
          onClick={handleApply}
          disabled={!raw || status === "ok"}
          className="w-full px-4 py-2.5 rounded-xl text-xs font-sans font-semibold bg-ns-blue text-white hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Importer
        </button>
      </div>
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
  const [blocksSimplified, setBlocksSimplified] = useState<ContentBlock[]>(() => 
    parseBlocks(initial.contentSimplified ?? initial.content)
  );
  const [blocksScientific, setBlocksScientific] = useState<ContentBlock[]>(() => 
    parseBlocks(initial.contentScientific ?? [])
  );
  const [hasDualContent, setHasDualContent] = useState(initial.hasDualContent ?? false);
  const [activeContentTab, setActiveContentTab] = useState<"simplified" | "scientific">("simplified");
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
    const contentToUse = hasDualContent ? blocksSimplified : blocks;
    return {
      title, summary,
      content: contentToUse as Parameters<typeof createArticle>[0]["content"],
      ...(hasDualContent && {
        contentSimplified: blocksSimplified as Parameters<typeof createArticle>[0]["content"],
        contentScientific: blocksScientific.length > 0 ? blocksScientific as Parameters<typeof createArticle>[0]["content"] : null,
      }),
      hasDualContent,
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

      {/* ── Main content ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left panel — content editor ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

            {/* Cover image upload */}
            <div
              className="relative group aspect-video rounded-2xl bg-neutral-100 border border-neutral-200 overflow-hidden cursor-pointer hover:border-neutral-300 transition-colors"
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-ns-blue"); }}
              onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-ns-blue"); }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("border-ns-blue");
                const f = e.dataTransfer.files?.[0];
                if (f && f.type.startsWith("image/")) handleCoverUpload(f);
              }}
              onClick={() => coverInputRef.current?.click()}
            >
              {coverUrl ? (
                <>
                  <Image
                    src={coverUrl}
                    alt={coverAlt || "Cover"}
                    fill
                    className="object-cover"
                  />
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

            {/* Dual content toggle + editor */}
            <div className="space-y-4">
              {/* Toggle dual content */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
                <input
                  type="checkbox"
                  id="dualContent"
                  checked={hasDualContent}
                  onChange={(e) => setHasDualContent(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-ns-blue cursor-pointer"
                />
                <label htmlFor="dualContent" className="flex-1 text-sm font-sans text-ns-blue cursor-pointer">
                  Activer deux versions (simplifiée + scientifique)
                </label>
              </div>

              {/* Content tabs */}
              {hasDualContent && (
                <div className="flex gap-2 border-b border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setActiveContentTab("simplified")}
                    className={`flex items-center gap-2 px-4 py-3 font-sans font-medium text-sm transition-colors duration-200 border-b-2 ${
                      activeContentTab === "simplified"
                        ? "border-ns-blue text-ns-blue"
                        : "border-transparent text-neutral-400 hover:text-neutral-600"
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Comprendre simplement
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveContentTab("scientific")}
                    className={`flex items-center gap-2 px-4 py-3 font-sans font-medium text-sm transition-colors duration-200 border-b-2 ${
                      activeContentTab === "scientific"
                        ? "border-ns-blue text-ns-blue"
                        : "border-transparent text-neutral-400 hover:text-neutral-600"
                    }`}
                  >
                    <Microscope className="w-4 h-4" />
                    Version scientifique
                  </button>
                </div>
              )}

              {/* Block editor */}
              {hasDualContent ? (
                activeContentTab === "simplified" ? (
                  <BlockEditor
                    blocks={blocksSimplified}
                    onChange={setBlocksSimplified}
                    onWordCountChange={setWordCount}
                  />
                ) : (
                  <BlockEditor
                    blocks={blocksScientific}
                    onChange={setBlocksScientific}
                    onWordCountChange={() => {}}
                  />
                )
              ) : (
                <BlockEditor
                  blocks={blocks}
                  onChange={setBlocks}
                  onWordCountChange={setWordCount}
                />
              )}
            </div>

            {/* Word count */}
            <p className="mt-6 text-xs text-neutral-300 font-sans text-right">
              {wordCount} mot{wordCount !== 1 ? "s" : ""} · ~{Math.max(1, Math.round(wordCount / 230))} min
            </p>

            {/* ── JSON import panel ── */}
            <JsonImportPanel categories={categories} onImport={(importedBlocks, meta) => {
              const parsedBlocks = parseBlocks(importedBlocks);
              if (hasDualContent) {
                setBlocksSimplified(parsedBlocks);
              } else {
                setBlocks(parsedBlocks);
              }
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
        <aside className="w-64 shrink-0 border-l border-neutral-100 bg-white sticky top-14 self-start px-4 py-6 space-y-5 hidden lg:block overflow-y-auto">

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
                    className="px-2.5 py-1.5 rounded-lg text-neutral-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>
                <input
                  value={s.url ?? ""}
                  onChange={(e) => { const n = [...sources]; n[i] = { ...n[i]!, url: e.target.value }; setSources(n); }}
                  placeholder="URL (optionnel)"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 text-xs font-sans focus:outline-none focus:border-ns-blue transition-colors"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setSources([...sources, { label: "" }])}
              className="text-xs font-sans text-ns-blue hover:opacity-80 transition-opacity"
            >
              + Ajouter source
            </button>
          </div>

          <div className="border-t border-neutral-100" />

          {/* Contributors */}
          <div className="space-y-2">
            <SideLabel>Contributeurs</SideLabel>
            <ContributorPicker contributors={contributors} onChange={setContributors} isSponsored={isSponsored} onSponsoredChange={setIsSponsored} />
          </div>

          <div className="border-t border-neutral-100" />

          {/* Sponsored */}
          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-50">
            <input
              type="checkbox"
              id="isSponsored"
              checked={isSponsored}
              onChange={(e) => setIsSponsored(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 text-ns-blue cursor-pointer"
            />
            <label htmlFor="isSponsored" className="flex-1 text-xs font-sans text-neutral-600 cursor-pointer">
              Contenu sponsorisé
            </label>
          </div>

          <div className="border-t border-neutral-100" />

          {/* Danger zone */}
          {id && (
            <div className="space-y-2">
              <SideLabel><span className="text-red-600">Zone de danger</span></SideLabel>
              <button
                type="button"
                onClick={() => setDeleteConfirm(true)}
                className="w-full px-3 py-2 rounded-xl text-xs font-sans font-semibold text-red-600 hover:bg-red-50 hover:border-red-200 border border-neutral-200 transition-colors"
              >
                Supprimer
              </button>
              {deleteConfirm && (
                <div className="space-y-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-xs font-sans text-red-700 font-semibold">Confirmez la suppression ?</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(false)}
                      className="flex-1 px-2 py-1.5 rounded-lg text-xs font-sans text-neutral-600 hover:bg-neutral-100 border border-neutral-200 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex-1 px-2 py-1.5 rounded-lg text-xs font-sans font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </aside>
      </div>

    </div>
  );
}
