// Blocs du builder d'e-mails — volontairement plus restreints que les
// ContentBlocks d'articles : le HTML e-mail (tables, styles inline) ne permet
// pas la même richesse, chaque bloc doit rendre parfaitement dans Gmail/Outlook/Apple Mail.

export type EmailHeadingBlock = {
  id: string;
  type: "heading";
  text: string;
};

export type EmailParagraphBlock = {
  id: string;
  type: "paragraph";
  // Mini-markdown : **gras**, *italique*, [label](https://url)
  text: string;
};

export type EmailImageBlock = {
  id: string;
  type: "image";
  url: string;
  alt: string;
  href?: string; // image cliquable
};

export type EmailButtonBlock = {
  id: string;
  type: "button";
  label: string;
  url: string;
};

export type EmailDividerBlock = {
  id: string;
  type: "divider";
};

// Widget article — snapshot des métadonnées au moment de l'insertion
// (l'e-mail envoyé est immuable, contrairement au site).
export type EmailArticleBlock = {
  id: string;
  type: "article";
  articleId: string;
  slug: string;
  title: string;
  summary: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  categoryName?: string;
  categoryColor?: string;
  readingTimeMin?: number;
};

export type EmailBlock =
  | EmailHeadingBlock
  | EmailParagraphBlock
  | EmailImageBlock
  | EmailButtonBlock
  | EmailDividerBlock
  | EmailArticleBlock;

export type EmailBlockType = EmailBlock["type"];

export type CampaignStatus = "draft" | "sent";
export type CampaignAudience = "newsletter" | "coherence_waitlist";

export type Campaign = {
  id: string;
  subject: string;
  preheader: string;
  blocks: EmailBlock[];
  status: CampaignStatus;
  audience: CampaignAudience;
  sentAt?: string;
  recipientCount?: number;
  createdAt: string;
  updatedAt: string;
};
