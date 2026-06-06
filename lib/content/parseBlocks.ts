import { ContentSchema } from "./validators";
import { tiptapToContentBlocks } from "./tiptapConverter";
import type { ContentBlock, MarkType } from "@/types/content";

type TNode = {
  type: string;
  text?: string;
  content?: TNode[];
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
};

function tiptapTextRuns(nodes: TNode[] = []) {
  return nodes
    .filter((n) => n.type === "text")
    .map((n) => {
      const run: { text: string; marks?: MarkType[]; link?: { href: string } } = {
        text: n.text ?? "",
      };
      const ms = (n.marks ?? [])
        .map((m) => m.type)
        .filter((m): m is MarkType => ["bold", "italic", "underline", "strikethrough"].includes(m));
      if (ms.length) run.marks = ms;
      const link = (n.marks ?? []).find((m) => m.type === "link");
      if (link?.attrs?.href) run.link = { href: String(link.attrs.href) };
      return run;
    });
}

function plainText(nodes: TNode[] = []): string {
  return nodes.map((n) => n.text ?? plainText(n.content)).join("");
}

function toAnchor(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}


function textRunsToString(item: unknown): string {
  if (typeof item === "string") return item;
  if (Array.isArray(item)) {
    return item
      .map((r) =>
        typeof r === "object" && r !== null && "text" in r
          ? String((r as { text: unknown }).text)
          : ""
      )
      .join("")
      .trim();
  }
  return "";
}

// Grok sometimes writes key-takeaways items as TextRun[][] instead of string[].
// Normalise here so one malformed block doesn't drop the whole content array.
function normalizeBlocks(arr: unknown[]): unknown[] {
  return arr.map((block) => {
    if (typeof block !== "object" || block === null) return block;
    const b = block as Record<string, unknown>;
    if (b.type === "key-takeaways" && Array.isArray(b.items)) {
      return {
        ...b,
        items: (b.items as unknown[])
          .map(textRunsToString)
          .filter((s) => s.length > 0),
      };
    }
    return b;
  });
}

export function parseBlocks(raw: unknown): ContentBlock[] {
  if (!raw) return [];

  // ContentBlock[] — native format
  if (Array.isArray(raw)) {
    const r = ContentSchema.safeParse(normalizeBlocks(raw));
    return r.success ? r.data : [];
  }

  // Tiptap ProseMirror JSON
  if (
    typeof raw === "object" &&
    "type" in (raw as object) &&
    (raw as TNode).type === "doc"
  ) {
    return tiptapToContentBlocks(raw as TNode);
  }

  return [];
}
