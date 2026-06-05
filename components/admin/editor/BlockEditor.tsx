"use client";

import { useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import NextImage from "next/image";
import {
  Plus, Trash2, ChevronUp, ChevronDown, Upload, X,
  Bold, Italic, Link2, Strikethrough,
} from "lucide-react";
import type { ContentBlock, TextRun } from "@/types/content";

// ── Utilities ─────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 8);
}

function anchorize(t: string) {
  return t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

export function countBlockWords(blocks: ContentBlock[]): number {
  let n = 0;
  for (const b of blocks) {
    if (b.type === "paragraph" || b.type === "callout")
      n += b.content.reduce((a, r) => a + (r.text ?? "").split(/\s+/).filter(Boolean).length, 0);
    else if (b.type === "heading" || b.type === "subheading" || b.type === "quote")
      n += b.content.split(/\s+/).filter(Boolean).length;
    else if (b.type === "bullet-list")
      n += b.items.reduce((a, item) => a + item.reduce((c, r) => c + (r.text ?? "").split(/\s+/).filter(Boolean).length, 0), 0);
    else if (b.type === "key-takeaways")
      n += b.items.reduce((a, s) => a + s.split(/\s+/).filter(Boolean).length, 0);
  }
  return n;
}

function defaultBlock(type: ContentBlock["type"]): ContentBlock {
  const id = uid();
  switch (type) {
    case "heading":        return { id, type: "heading", content: "" };
    case "subheading":     return { id, type: "subheading", level: 2, content: "", anchor: "" };
    case "image":          return { id, type: "image", url: "", alt: "" };
    case "quote":          return { id, type: "quote", content: "" };
    case "bullet-list":    return { id, type: "bullet-list", items: [[{ text: "" }]] };
    case "key-takeaways":  return { id, type: "key-takeaways", items: [""] };
    case "callout":        return { id, type: "callout", variant: "key-concept", content: [{ text: "" }] };
    case "code":           return { id, type: "code", language: "python", content: "" };
    case "equation":       return { id, type: "equation", latex: "" };
    case "divider":        return { id, type: "divider" };
    default:               return { id, type: "paragraph", content: [{ text: "" }] };
  }
}

// ── TextRun ↔ Tiptap ──────────────────────────────────────────────────────────

function runsToTiptap(runs: TextRun[]): object {
  return {
    type: "doc",
    content: [{
      type: "paragraph",
      content: (runs.length ? runs : [{ text: "" }]).map((run) => ({
        type: "text",
        text: run.text,
        ...(run.marks?.length || run.link ? {
          marks: [
            ...(run.marks ?? []).map((m) => ({ type: m === "strikethrough" ? "strike" : m })),
            ...(run.link ? [{ type: "link", attrs: { href: run.link.href } }] : []),
          ],
        } : {}),
      })),
    }],
  };
}

type TiptapDoc = { type: string; content?: TiptapPara[] };
type TiptapPara = { type: string; content?: TiptapText[] };
type TiptapText = { type: string; text?: string; marks?: { type: string; attrs?: Record<string, unknown> }[] };

function tiptapToRuns(doc: TiptapDoc): TextRun[] {
  const para = (doc.content ?? [])[0];
  return (para?.content ?? [])
    .filter((n) => n.type === "text")
    .map((n) => {
      const run: TextRun = { text: n.text ?? "" };
      const marks: ("bold" | "italic" | "underline" | "strikethrough")[] = [];
      for (const m of n.marks ?? []) {
        if (m.type === "bold") marks.push("bold");
        if (m.type === "italic") marks.push("italic");
        if (m.type === "underline") marks.push("underline");
        if (m.type === "strike") marks.push("strikethrough");
      }
      if (marks.length) run.marks = marks;
      const link = (n.marks ?? []).find((m) => m.type === "link");
      if (link?.attrs?.href) run.link = { href: String(link.attrs.href) };
      return run;
    });
}

// ── InlineEditor (mini Tiptap per block) ─────────────────────────────────────

function BBtn({ active, onClick, children, title }: {
  active: boolean; onClick: () => void; children: React.ReactNode; title: string;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-1.5 rounded-lg transition-colors ${active ? "bg-white/20 text-white" : "text-white/70 hover:text-white hover:bg-white/10"}`}
    >
      {children}
    </button>
  );
}

function InlineEditor({ runs, onChange, placeholder = "Écrivez ici…" }: {
  runs: TextRun[];
  onChange: (r: TextRun[]) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      StarterKit.configure({
        heading: false, blockquote: false, codeBlock: false,
        horizontalRule: false, bulletList: false, orderedList: false, link: false,
      }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder, emptyEditorClass: "is-editor-empty" }),
    ],
    content: runsToTiptap(runs),
    onUpdate({ editor }) {
      onChange(tiptapToRuns(editor.getJSON() as TiptapDoc));
    },
    editorProps: { attributes: { class: "outline-none text-[17px] leading-7 text-neutral-700 min-h-[1.75rem]" } },
  });

  function setLink() {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string ?? "";
    const url = window.prompt("URL du lien", prev);
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  if (!editor) return null;

  return (
    <div>
      <BubbleMenu editor={editor} className="flex items-center gap-0.5 px-2 py-1.5 rounded-xl bg-ns-black border border-white/10 shadow-xl">
        <BBtn active={editor.isActive("bold")}   onClick={() => editor.chain().focus().toggleBold().run()}   title="Gras"><Bold className="w-3.5 h-3.5" strokeWidth={2} /></BBtn>
        <BBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italique"><Italic className="w-3.5 h-3.5" strokeWidth={2} /></BBtn>
        <BBtn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Barré"><Strikethrough className="w-3.5 h-3.5" strokeWidth={2} /></BBtn>
        <BBtn active={editor.isActive("link")}   onClick={setLink}                                           title="Lien"><Link2 className="w-3.5 h-3.5" strokeWidth={2} /></BBtn>
      </BubbleMenu>
      <EditorContent editor={editor} />
    </div>
  );
}

// ── Individual block editors ──────────────────────────────────────────────────

type Upd<T extends ContentBlock> = (patch: Partial<T>) => void;

function FieldInput({ value, onChange, placeholder, className = "" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-transparent outline-none ${className}`}
    />
  );
}

function HeadingEditor({ block, onChange }: { block: Extract<ContentBlock, { type: "heading" }>; onChange: Upd<typeof block> }) {
  return (
    <FieldInput
      value={block.content}
      onChange={(v) => onChange({ content: v })}
      placeholder="Titre H1"
      className="font-heading font-black text-3xl text-ns-black leading-tight placeholder-neutral-200"
    />
  );
}

function SubheadingEditor({ block, onChange }: { block: Extract<ContentBlock, { type: "subheading" }>; onChange: Upd<typeof block> }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1 shrink-0">
        {([2, 3] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => onChange({ level: l })}
            className={`w-7 h-7 rounded-lg text-xs font-sans font-bold transition-colors ${block.level === l ? "bg-ns-blue/10 text-ns-blue" : "text-neutral-300 hover:text-neutral-600"}`}
          >
            H{l}
          </button>
        ))}
      </div>
      <FieldInput
        value={block.content}
        onChange={(v) => onChange({ content: v, anchor: anchorize(v) })}
        placeholder={block.level === 2 ? "Titre de section" : "Sous-section"}
        className={block.level === 2 ? "font-heading font-bold text-2xl text-ns-black" : "font-heading font-semibold text-xl text-ns-black"}
      />
    </div>
  );
}

function ParagraphEditor({ block, onChange }: { block: Extract<ContentBlock, { type: "paragraph" }>; onChange: Upd<typeof block> }) {
  return <InlineEditor key={block.id} runs={block.content} onChange={(c) => onChange({ content: c })} placeholder="Commencez à écrire…" />;
}

function ImageEditor({ block, onChange }: { block: Extract<ContentBlock, { type: "image" }>; onChange: Upd<typeof block> }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "neuralspace/articles");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json() as { url: string };
      onChange({ url });
    }
    setUploading(false);
  }

  return (
    <div className="space-y-2">
      {block.url ? (
        <div className="relative group">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden">
            <NextImage src={block.url} alt={block.alt || "image"} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 672px" />
          </div>
          <button
            type="button"
            onClick={() => onChange({ url: "" })}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-neutral-200 rounded-xl aspect-video flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-ns-blue/40 transition-colors"
        >
          {uploading ? (
            <p className="text-xs font-sans text-neutral-300">Upload en cours…</p>
          ) : (
            <>
              <Upload className="w-5 h-5 text-neutral-300" strokeWidth={1.5} />
              <p className="text-xs font-sans text-neutral-300">Clic pour uploader une image</p>
            </>
          )}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
      <input
        value={block.alt}
        onChange={(e) => onChange({ alt: e.target.value })}
        placeholder="Texte alternatif (obligatoire)"
        className="w-full text-xs font-sans text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 outline-none focus:border-ns-blue transition-colors"
      />
      <input
        value={block.caption ?? ""}
        onChange={(e) => onChange({ caption: e.target.value })}
        placeholder="Légende (optionnel)"
        className="w-full text-xs font-sans text-neutral-400 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 outline-none focus:border-ns-blue transition-colors"
      />
    </div>
  );
}

function QuoteEditor({ block, onChange }: { block: Extract<ContentBlock, { type: "quote" }>; onChange: Upd<typeof block> }) {
  return (
    <div className="border-l-[3px] border-ns-blue pl-4 space-y-2">
      <textarea
        value={block.content}
        onChange={(e) => onChange({ content: e.target.value })}
        placeholder="Citation…"
        rows={2}
        className="w-full bg-transparent outline-none resize-none text-lg italic text-neutral-700 placeholder-neutral-200"
      />
      <input
        value={block.attribution ?? ""}
        onChange={(e) => onChange({ attribution: e.target.value })}
        placeholder="— Auteur ou source"
        className="w-full bg-transparent outline-none text-sm text-neutral-400 placeholder-neutral-200"
      />
    </div>
  );
}

function BulletListEditor({ block, onChange }: { block: Extract<ContentBlock, { type: "bullet-list" }>; onChange: Upd<typeof block> }) {
  const items = block.items;
  const getText = (item: TextRun[]) => item.map((r) => r.text).join("");
  const setText = (i: number, text: string) => {
    const next = [...items];
    next[i] = [{ text }];
    onChange({ items: next });
  };

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 group/item">
          <span className="w-1.5 h-1.5 rounded-full bg-ns-blue shrink-0" />
          <input
            value={getText(item)}
            onChange={(e) => setText(i, e.target.value)}
            placeholder="Élément de liste"
            className="flex-1 bg-transparent outline-none text-[17px] text-neutral-700 placeholder-neutral-200"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const next = [...items];
                next.splice(i + 1, 0, [{ text: "" }]);
                onChange({ items: next });
              }
              if (e.key === "Backspace" && getText(item) === "" && items.length > 1) {
                e.preventDefault();
                onChange({ items: items.filter((_, j) => j !== i) });
              }
            }}
          />
          {items.length > 1 && (
            <button type="button" onClick={() => onChange({ items: items.filter((_, j) => j !== i) })}
              className="opacity-0 group-hover/item:opacity-100 text-neutral-300 hover:text-red-400 transition-all">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ items: [...items, [{ text: "" }]] })}
        className="ml-3.5 text-xs font-sans text-neutral-300 hover:text-ns-blue transition-colors"
      >
        + Ajouter un élément
      </button>
    </div>
  );
}

function KeyTakeawaysEditor({ block, onChange }: { block: Extract<ContentBlock, { type: "key-takeaways" }>; onChange: Upd<typeof block> }) {
  return (
    <div className="rounded-2xl bg-ns-blue/5 border border-ns-blue/20 p-4 space-y-3">
      <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-ns-blue">À retenir</p>
      <div className="space-y-1.5">
        {block.items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 group/item">
            <span className="w-1.5 h-1.5 rounded-full bg-ns-blue shrink-0" />
            <input
              value={item}
              onChange={(e) => { const n = [...block.items]; n[i] = e.target.value; onChange({ items: n }); }}
              placeholder="Point clé"
              className="flex-1 bg-transparent outline-none text-sm text-neutral-700 placeholder-neutral-300"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const n = [...block.items]; n.splice(i + 1, 0, ""); onChange({ items: n });
                }
                if (e.key === "Backspace" && item === "" && block.items.length > 1) {
                  e.preventDefault();
                  onChange({ items: block.items.filter((_, j) => j !== i) });
                }
              }}
            />
            {block.items.length > 1 && (
              <button type="button" onClick={() => onChange({ items: block.items.filter((_, j) => j !== i) })}
                className="opacity-0 group-hover/item:opacity-100 text-neutral-300 hover:text-red-400 transition-all">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange({ items: [...block.items, ""] })}
          className="ml-3.5 text-xs font-sans text-ns-blue/60 hover:text-ns-blue transition-colors"
        >
          + Ajouter un point
        </button>
      </div>
    </div>
  );
}

const CALLOUT_STYLES = {
  "key-concept": { label: "Concept clé", bg: "bg-ns-blue/5 border-ns-blue/20", badge: "text-ns-blue bg-ns-blue/10" },
  warning:       { label: "Attention",   bg: "bg-amber-50 border-amber-200",    badge: "text-amber-700 bg-amber-100" },
  anecdote:      { label: "Anecdote",    bg: "bg-neutral-50 border-neutral-200", badge: "text-neutral-600 bg-neutral-100" },
} as const;

function CalloutEditor({ block, onChange }: { block: Extract<ContentBlock, { type: "callout" }>; onChange: Upd<typeof block> }) {
  const s = CALLOUT_STYLES[block.variant];
  return (
    <div className={`rounded-2xl border p-4 space-y-3 ${s.bg}`}>
      <div className="flex items-center gap-2 flex-wrap">
        {(["key-concept", "warning", "anecdote"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange({ variant: v })}
            className={`px-2.5 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest transition-colors ${block.variant === v ? CALLOUT_STYLES[v].badge : "text-neutral-300 hover:text-neutral-500"}`}
          >
            {CALLOUT_STYLES[v].label}
          </button>
        ))}
      </div>
      <input
        value={block.title ?? ""}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Titre (optionnel)"
        className="w-full bg-transparent outline-none text-sm font-sans font-semibold text-neutral-600 placeholder-neutral-300"
      />
      <InlineEditor key={`callout-${block.id}`} runs={block.content} onChange={(c) => onChange({ content: c })} placeholder="Contenu du callout…" />
    </div>
  );
}

function CodeEditor({ block, onChange }: { block: Extract<ContentBlock, { type: "code" }>; onChange: Upd<typeof block> }) {
  return (
    <div className="rounded-xl overflow-hidden border border-neutral-200">
      <div className="flex items-center gap-2 bg-neutral-100 px-4 py-2 border-b border-neutral-200">
        <input
          value={block.language}
          onChange={(e) => onChange({ language: e.target.value })}
          placeholder="python"
          className="bg-transparent outline-none text-xs font-mono text-neutral-500 w-24"
        />
        <div className="mx-1 w-px h-3 bg-neutral-300" />
        <input
          value={block.filename ?? ""}
          onChange={(e) => onChange({ filename: e.target.value })}
          placeholder="nom_fichier.py (optionnel)"
          className="flex-1 bg-transparent outline-none text-xs font-mono text-neutral-400"
        />
      </div>
      <textarea
        value={block.content}
        onChange={(e) => onChange({ content: e.target.value })}
        placeholder="# code ici"
        rows={6}
        className="w-full bg-neutral-900 text-neutral-100 font-mono text-sm px-4 py-3 outline-none resize-y"
      />
    </div>
  );
}

function EquationEditor({ block, onChange }: { block: Extract<ContentBlock, { type: "equation" }>; onChange: Upd<typeof block> }) {
  return (
    <div className="space-y-2">
      <input
        value={block.latex}
        onChange={(e) => onChange({ latex: e.target.value })}
        placeholder="E = mc^2"
        className="w-full font-mono text-sm bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 outline-none focus:border-ns-blue transition-colors text-ns-black"
      />
      {block.latex && (
        <p className="text-[11px] font-sans text-neutral-400 italic">Prévisualisation au rendu</p>
      )}
    </div>
  );
}

// ── Add block menu ─────────────────────────────────────────────────────────────

const BLOCK_MENU: { type: ContentBlock["type"]; label: string }[] = [
  { type: "paragraph",     label: "Paragraphe" },
  { type: "subheading",    label: "Sous-titre H2/H3" },
  { type: "image",         label: "Image" },
  { type: "quote",         label: "Citation" },
  { type: "bullet-list",   label: "Liste à puces" },
  { type: "key-takeaways", label: "À retenir" },
  { type: "callout",       label: "Callout" },
  { type: "code",          label: "Bloc de code" },
  { type: "equation",      label: "Équation LaTeX" },
  { type: "divider",       label: "Diviseur" },
];

function AddMenu({ onSelect, onClose }: { onSelect: (t: ContentBlock["type"]) => void; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute z-40 mt-1 left-0 bg-white border border-neutral-100 rounded-2xl shadow-xl py-1.5 min-w-[200px]">
        {BLOCK_MENU.map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={() => { onSelect(item.type); onClose(); }}
            className="w-full text-left px-4 py-2 text-xs font-sans text-ns-black hover:bg-neutral-50 transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}

// ── BlockItem ─────────────────────────────────────────────────────────────────

function BlockItem({
  block, onUpdate, onDelete, onInsertAfter, canMoveUp, canMoveDown, onMoveUp, onMoveDown,
}: {
  block: ContentBlock;
  onUpdate: (patch: Record<string, unknown>) => void;
  onDelete: () => void;
  onInsertAfter: (type: ContentBlock["type"]) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upd = (patch: Record<string, unknown>) => onUpdate(patch);

  function renderEditor() {
    switch (block.type) {
      case "heading":       return <HeadingEditor       block={block} onChange={upd as Upd<typeof block>} />;
      case "subheading":    return <SubheadingEditor    block={block} onChange={upd as Upd<typeof block>} />;
      case "paragraph":     return <ParagraphEditor     block={block} onChange={upd as Upd<typeof block>} />;
      case "image":         return <ImageEditor         block={block} onChange={upd as Upd<typeof block>} />;
      case "quote":         return <QuoteEditor         block={block} onChange={upd as Upd<typeof block>} />;
      case "bullet-list":   return <BulletListEditor    block={block} onChange={upd as Upd<typeof block>} />;
      case "key-takeaways": return <KeyTakeawaysEditor  block={block} onChange={upd as Upd<typeof block>} />;
      case "callout":       return <CalloutEditor       block={block} onChange={upd as Upd<typeof block>} />;
      case "code":          return <CodeEditor          block={block} onChange={upd as Upd<typeof block>} />;
      case "equation":      return <EquationEditor      block={block} onChange={upd as Upd<typeof block>} />;
      case "divider":       return <hr className="border-neutral-200 my-2" />;
      default:              return null;
    }
  }

  return (
    <div className="group relative -mx-3 px-3 py-3 rounded-xl hover:bg-neutral-50/80 transition-colors">
      {renderEditor()}

      {/* Hover toolbar */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 bg-white border border-neutral-100 rounded-xl shadow-sm px-1 py-0.5 z-10 transition-opacity">
        <button type="button" onClick={onMoveUp} disabled={!canMoveUp}
          className="p-1 rounded-lg text-neutral-300 hover:text-neutral-600 disabled:opacity-20 transition-colors" title="Monter">
          <ChevronUp className="w-3 h-3" />
        </button>
        <button type="button" onClick={onMoveDown} disabled={!canMoveDown}
          className="p-1 rounded-lg text-neutral-300 hover:text-neutral-600 disabled:opacity-20 transition-colors" title="Descendre">
          <ChevronDown className="w-3 h-3" />
        </button>
        <div className="relative">
          <button type="button" onClick={() => setAddOpen((v) => !v)}
            className="p-1 rounded-lg text-neutral-300 hover:text-ns-blue transition-colors" title="Insérer un bloc">
            <Plus className="w-3 h-3" />
          </button>
          {addOpen && (
            <AddMenu
              onSelect={(t) => { onInsertAfter(t); setAddOpen(false); }}
              onClose={() => setAddOpen(false)}
            />
          )}
        </div>
        <button type="button" onClick={onDelete}
          className="p-1 rounded-lg text-neutral-300 hover:text-red-400 transition-colors" title="Supprimer">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ── BlockEditor ───────────────────────────────────────────────────────────────

type Props = {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  onWordCountChange?: (n: number) => void;
};

export function BlockEditor({ blocks, onChange, onWordCountChange }: Props) {
  const [addOpen, setAddOpen] = useState(false);

  function update(blocks: ContentBlock[]) {
    onChange(blocks);
    onWordCountChange?.(countBlockWords(blocks));
  }

  function updateBlock(id: string, patch: Record<string, unknown>) {
    update(blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as ContentBlock) : b)));
  }

  function deleteBlock(id: string) {
    update(blocks.filter((b) => b.id !== id));
  }

  function moveUp(i: number) {
    if (i === 0) return;
    const next = [...blocks];
    const tmp = next[i - 1]!;
    next[i - 1] = next[i]!;
    next[i] = tmp;
    update(next);
  }

  function moveDown(i: number) {
    if (i === blocks.length - 1) return;
    const next = [...blocks];
    const tmp = next[i + 1]!;
    next[i + 1] = next[i]!;
    next[i] = tmp;
    update(next);
  }

  function insertAfter(i: number, type: ContentBlock["type"]) {
    const next = [...blocks];
    next.splice(i + 1, 0, defaultBlock(type));
    update(next);
  }

  function appendBlock(type: ContentBlock["type"]) {
    update([...blocks, defaultBlock(type)]);
  }

  return (
    <div className="space-y-0">
      {blocks.length === 0 && (
        <div className="py-12 flex flex-col items-center gap-3 text-neutral-300">
          <p className="text-sm font-sans">Aucun bloc — cliquez + pour commencer</p>
        </div>
      )}

      {blocks.map((block, i) => (
        <BlockItem
          key={block.id}
          block={block}
          onUpdate={(patch) => updateBlock(block.id, patch)}
          onDelete={() => deleteBlock(block.id)}
          onInsertAfter={(t) => insertAfter(i, t)}
          canMoveUp={i > 0}
          canMoveDown={i < blocks.length - 1}
          onMoveUp={() => moveUp(i)}
          onMoveDown={() => moveDown(i)}
        />
      ))}

      {/* Append button */}
      <div className="relative pt-4">
        <button
          type="button"
          onClick={() => setAddOpen((v) => !v)}
          className="flex items-center gap-2 text-xs font-sans text-neutral-300 hover:text-ns-blue transition-colors"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          Ajouter un bloc
        </button>
        {addOpen && (
          <AddMenu
            onSelect={(t) => { appendBlock(t); setAddOpen(false); }}
            onClose={() => setAddOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
