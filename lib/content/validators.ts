import { z } from "zod";

// --- Inline ---

const MarkTypeSchema = z.enum(["bold", "italic", "underline", "strikethrough"]);

const LinkMarkSchema = z.object({
  href: z.string().url(),
  label: z.string().optional(),
});

const TextRunSchema = z.object({
  text: z.string(),
  marks: z.array(MarkTypeSchema).optional(),
  link: LinkMarkSchema.optional(),
  citation: z.number().int().nonnegative().optional(),
  inlineLatex: z.string().optional(),
});

const RichTextSchema = z.array(TextRunSchema);

// --- Blocks ---

const HeadingBlockSchema = z.object({
  id: z.string(),
  type: z.literal("heading"),
  content: z.string().min(1),
});

const SubheadingBlockSchema = z.object({
  id: z.string(),
  type: z.literal("subheading"),
  level: z.union([z.literal(2), z.literal(3)]),
  content: z.string().min(1),
  anchor: z.string().min(1),
});

const ParagraphBlockSchema = z.object({
  id: z.string(),
  type: z.literal("paragraph"),
  content: RichTextSchema,
});

const QuoteBlockSchema = z.object({
  id: z.string(),
  type: z.literal("quote"),
  content: z.string().min(1),
  attribution: z.string().optional(),
});

const BulletListBlockSchema = z.object({
  id: z.string(),
  type: z.literal("bullet-list"),
  items: z.array(RichTextSchema).min(1),
});

const KeyTakeawaysBlockSchema = z.object({
  id: z.string(),
  type: z.literal("key-takeaways"),
  items: z.array(z.string().min(1)).min(1),
});

const CalloutBlockSchema = z.object({
  id: z.string(),
  type: z.literal("callout"),
  variant: z.enum(["key-concept", "warning", "anecdote", "study-limits"]),
  title: z.string().optional(),
  content: RichTextSchema,
});

const EquationBlockSchema = z.object({
  id: z.string(),
  type: z.literal("equation"),
  latex: z.string().min(1),
});

const CodeBlockSchema = z.object({
  id: z.string(),
  type: z.literal("code"),
  language: z.string().min(1),
  content: z.string(),
  filename: z.string().optional(),
});

const ImageCreditSchema = z.object({
  author:  z.string().optional(),
  source:  z.string().optional(),
  url:     z.string().url().optional(),
  license: z.string().optional(),
}).optional();

const ImageBlockSchema = z.object({
  id:      z.string(),
  type:    z.literal("image"),
  url:     z.string().url(),
  alt:     z.string().min(1), // enforced — no empty alt
  caption: z.string().optional(),
  credit:  ImageCreditSchema,
});

const VideoBlockSchema = z.object({
  id: z.string(),
  type: z.literal("video"),
  provider: z.enum(["youtube", "vimeo"]),
  videoId: z.string().min(1),
  caption: z.string().optional(),
});

const DividerBlockSchema = z.object({
  id: z.string(),
  type: z.literal("divider"),
});

export const ContentBlockSchema = z.discriminatedUnion("type", [
  HeadingBlockSchema,
  SubheadingBlockSchema,
  ParagraphBlockSchema,
  QuoteBlockSchema,
  BulletListBlockSchema,
  KeyTakeawaysBlockSchema,
  CalloutBlockSchema,
  EquationBlockSchema,
  CodeBlockSchema,
  ImageBlockSchema,
  VideoBlockSchema,
  DividerBlockSchema,
]);

export const ContentSchema = z.array(ContentBlockSchema);

// --- Article sources ---

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

export const ArticleSourceSchema = z.object({
  label: z.string().min(1),
  // Empty strings (from the editor URL input) are treated as absent
  url: z.preprocess(emptyToUndefined, z.string().url().optional()),
  doi: z.preprocess(emptyToUndefined, z.string().optional()),
});

// Per-element parse so one invalid source never silently wipes the whole list
export const ArticleSourcesSchema = z.array(
  z.unknown().transform((item) => {
    const r = ArticleSourceSchema.safeParse(item);
    return r.success ? r.data : null;
  })
).transform((arr) => arr.filter((x): x is z.infer<typeof ArticleSourceSchema> => x !== null));

// --- Corrections éditoriales (affichées publiquement, datées) ---

export const ArticleCorrectionSchema = z.object({
  date: z.string().min(1),
  note: z.string().min(1),
});

export const ArticleCorrectionsSchema = z.array(
  z.unknown().transform((item) => {
    const r = ArticleCorrectionSchema.safeParse(item);
    return r.success ? r.data : null;
  })
).transform((arr) => arr.filter((x): x is z.infer<typeof ArticleCorrectionSchema> => x !== null));
