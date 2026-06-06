"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CharacterCount from "@tiptap/extension-character-count";
import {
  Bold, Italic, Link2, Heading2, Heading3, Quote, Code,
} from "lucide-react";

type Props = {
  content: object;
  onChange: (json: object) => void;
  onWordCountChange?: (count: number) => void;
};

function BubbleBtn({
  active, onClick, children, title,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode; title: string;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-1.5 rounded-lg transition-colors duration-100 ${
        active
          ? "bg-white/20 text-white"
          : "text-white/70 hover:text-white hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

export function TiptapEditor({ content, onChange, onWordCountChange }: Props) {
  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: { HTMLAttributes: { class: "not-prose" } },
        link: false,
      }),
      Placeholder.configure({
        placeholder: "Commencez à écrire votre article…",
        emptyEditorClass: "is-editor-empty",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-ns-blue underline underline-offset-2" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-xl my-6 w-full" },
      }),
      CharacterCount,
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getJSON());
      onWordCountChange?.(editor.storage.characterCount.words());
    },
    editorProps: {
      attributes: {
        class: "prose-editor outline-none min-h-[400px]",
      },
    },
  });

  if (!editor) return null;

  function setLink() {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string ?? "";
    const url  = window.prompt("URL du lien", prev);
    if (url === null) return;
    
    const chain = editor.chain().focus().extendMarkRange("link");
    if (url === "") {
      chain.unsetLink().run();
    } else {
      chain.setLink({ href: url }).run();
    }
  }

  return (
    <div className="relative">
      {/* Bubble menu — appears on text selection */}
      <BubbleMenu
        editor={editor}
        className="flex items-center gap-0.5 px-2 py-1.5 rounded-xl bg-ns-black border border-white/10 shadow-xl"
      >
        <BubbleBtn active={editor.isActive("bold")}        onClick={() => editor.chain().focus().toggleBold().run()}                    title="Gras">
          <Bold className="w-3.5 h-3.5" strokeWidth={2} />
        </BubbleBtn>
        <BubbleBtn active={editor.isActive("italic")}      onClick={() => editor.chain().focus().toggleItalic().run()}                  title="Italique">
          <Italic className="w-3.5 h-3.5" strokeWidth={2} />
        </BubbleBtn>
        <BubbleBtn active={editor.isActive("link")}        onClick={setLink}                                                             title="Lien">
          <Link2 className="w-3.5 h-3.5" strokeWidth={2} />
        </BubbleBtn>

        <div className="w-px h-4 bg-white/20 mx-1" />

        <BubbleBtn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="H2">
          <Heading2 className="w-3.5 h-3.5" strokeWidth={2} />
        </BubbleBtn>
        <BubbleBtn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="H3">
          <Heading3 className="w-3.5 h-3.5" strokeWidth={2} />
        </BubbleBtn>
        <BubbleBtn active={editor.isActive("blockquote")}  onClick={() => editor.chain().focus().toggleBlockquote().run()}               title="Citation">
          <Quote className="w-3.5 h-3.5" strokeWidth={2} />
        </BubbleBtn>
        <BubbleBtn active={editor.isActive("code")}        onClick={() => editor.chain().focus().toggleCode().run()}                     title="Code inline">
          <Code className="w-3.5 h-3.5" strokeWidth={2} />
        </BubbleBtn>
      </BubbleMenu>

      <EditorContent editor={editor} />
    </div>
  );
}
