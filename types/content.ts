// --- Inline formatting ---

export type MarkType = "bold" | "italic" | "underline" | "strikethrough";

export type LinkMark = {
  href: string;
  label?: string;
};

// A single run of text with optional formatting.
// `citation` references an entry in article.sources by its index.
// `inlineLatex` renders a short LaTeX expression inline within a paragraph.
export type TextRun = {
  text: string;
  marks?: MarkType[];
  link?: LinkMark;
  citation?: number;
  inlineLatex?: string;
};

// Rich inline content: a sequence of text runs.
export type RichText = TextRun[];

// --- Block types ---

export type HeadingBlock = {
  id: string;
  type: "heading";
  content: string; // plain — one H1 per article, no inline marks
};

export type SubheadingBlock = {
  id: string;
  type: "subheading";
  level: 2 | 3;
  content: string; // plain — headings are scannable, not formatted
  anchor: string;  // kebab-case slug, auto-generated from content, stable after publish
};

export type ParagraphBlock = {
  id: string;
  type: "paragraph";
  content: RichText;
};

export type QuoteBlock = {
  id: string;
  type: "quote";
  content: string;
  attribution?: string;
};

export type BulletListBlock = {
  id: string;
  type: "bullet-list";
  items: RichText[];
};

export type KeyTakeawaysBlock = {
  id: string;
  type: "key-takeaways";
  items: string[]; // plain text — summary points, not formatted
};

export type CalloutVariant = "key-concept" | "warning" | "anecdote";

export type CalloutBlock = {
  id: string;
  type: "callout";
  variant: CalloutVariant;
  title?: string;
  content: RichText;
};

// Block-level equation, always rendered centered (display mode).
// For inline equations within a paragraph, use TextRun.inlineLatex.
export type EquationBlock = {
  id: string;
  type: "equation";
  latex: string;
};

export type CodeBlock = {
  id: string;
  type: "code";
  language: string; // e.g. "typescript", "python", "bash" — passed to Shiki
  content: string;
  filename?: string; // optional label shown above the block
};

export type ImageBlock = {
  id: string;
  type: "image";
  url: string; // Cloudinary URL
  alt: string; // required — enforced at type level, not just validation
  caption?: string;
};

export type VideoBlock = {
  id: string;
  type: "video";
  provider: "youtube" | "vimeo";
  videoId: string;
  caption?: string;
};

export type DividerBlock = {
  id: string;
  type: "divider";
};

// Discriminated union — `type` field narrows automatically in switch/if
export type ContentBlock =
  | HeadingBlock
  | SubheadingBlock
  | ParagraphBlock
  | QuoteBlock
  | BulletListBlock
  | KeyTakeawaysBlock
  | CalloutBlock
  | EquationBlock
  | CodeBlock
  | ImageBlock
  | VideoBlock
  | DividerBlock;

export type BlockType = ContentBlock["type"];
