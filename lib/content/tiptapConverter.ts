import type { ContentBlock } from "@/types/content";

type TiptapNode = {
  type: string;
  text?: string;
  content?: TiptapNode[];
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
};

function tiptapTextRuns(nodes: TiptapNode[] = []) {
  return nodes.map((n) => {
    if (n.type !== "text") return null;
    const run: { text: string; marks?: string[]; link?: { href: string } } = { text: n.text ?? "" };
    const activeMarks = (n.marks ?? []).map((m) => m.type);
    const validMarks = activeMarks.filter((m): m is "bold" | "italic" | "underline" | "strikethrough" =>
      ["bold", "italic", "underline", "strikethrough"].includes(m)
    );
    if (validMarks.length) run.marks = validMarks;
    const linkMark = (n.marks ?? []).find((m) => m.type === "link");
    if (linkMark?.attrs?.href) run.link = { href: String(linkMark.attrs.href) };
    return run;
  }).filter(Boolean) as { text: string }[];
}

function tiptapPlainText(nodes: TiptapNode[] = []): string {
  return nodes.map((n) => n.text ?? tiptapPlainText(n.content)).join("");
}

export function tiptapToContentBlocks(doc: TiptapNode): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let i = 0;
  const id = () => `b${++i}`;

  for (const node of doc.content ?? []) {
    switch (node.type) {
      case "paragraph": {
        const runs = tiptapTextRuns(node.content);
        if (runs.length) blocks.push({ id: id(), type: "paragraph", content: runs });
        break;
      }
      case "heading": {
        const level = Number(node.attrs?.level ?? 2);
        const text  = tiptapPlainText(node.content);
        if (!text) break;
        if (level === 1) {
          blocks.push({ id: id(), type: "heading", content: text });
        } else {
          blocks.push({
            id: id(), type: "subheading",
            level: level <= 2 ? 2 : 3,
            content: text,
            anchor: text.toLowerCase().normalize("NFD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-"),
          });
        }
        break;
      }
      case "blockquote": {
        const inner = node.content?.[0];
        const text  = tiptapPlainText(inner?.content);
        if (text) blocks.push({ id: id(), type: "quote", content: text });
        break;
      }
      case "bulletList":
      case "orderedList": {
        const items = (node.content ?? []).map((li) =>
          tiptapTextRuns(li.content?.[0]?.content)
        ).filter((r) => r.length > 0);
        if (items.length) blocks.push({ id: id(), type: "bullet-list", items });
        break;
      }
      case "codeBlock": {
        const text = tiptapPlainText(node.content);
        blocks.push({ id: id(), type: "code", language: String(node.attrs?.language ?? "text"), content: text });
        break;
      }
      case "horizontalRule":
        blocks.push({ id: id(), type: "divider" });
        break;
    }
  }
  return blocks;
}
