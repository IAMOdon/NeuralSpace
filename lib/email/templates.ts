import type { EmailBlock, EmailArticleBlock } from "@/types/email";

// Templates de campagne — constructeurs purs, sans accès DB. Le serveur
// (createCampaign) injecte les vrais derniers articles ; le picker admin
// injecte des articles factices pour les vignettes de prévisualisation.

export type EmailTemplateId = "digest" | "announcement" | "edito" | "blank";

export type EmailTemplateMeta = {
  id: EmailTemplateId;
  name: string;
  description: string;
};

export const EMAIL_TEMPLATES: EmailTemplateMeta[] = [
  {
    id: "digest",
    name: "Récap de la semaine",
    description: "Intro + vos 3 derniers articles, déjà en place.",
  },
  {
    id: "announcement",
    name: "Nouvel article",
    description: "Annonce d'une publication — le dernier article pré-rempli.",
  },
  {
    id: "edito",
    name: "Édito",
    description: "Une note éditoriale : texte long, signature, un bouton.",
  },
  {
    id: "blank",
    name: "Vide",
    description: "Partir de zéro, bloc par bloc.",
  },
];

// Sous-ensemble d'article nécessaire au widget (aligné sur ArticlePick côté actions)
export type TemplateArticle = Omit<EmailArticleBlock, "id" | "type">;

export type TemplateResult = {
  subject: string;
  preheader: string;
  blocks: EmailBlock[];
};

let counter = 0;
function newId(): string {
  return `b${Date.now().toString(36)}${(counter++).toString(36)}`;
}

function articleBlock(a: TemplateArticle): EmailBlock {
  return { id: newId(), type: "article", ...a };
}

export function buildTemplate(
  id: EmailTemplateId,
  articles: TemplateArticle[],
  siteUrl: string
): TemplateResult {
  switch (id) {
    case "digest": {
      const picks = articles.slice(0, 3);
      return {
        subject: "Le récap science de la semaine",
        preheader: "Ce qu'il ne fallait pas manquer cette semaine sur Neural Space.",
        blocks: [
          { id: newId(), type: "heading", text: "Le récap de la semaine" },
          {
            id: newId(),
            type: "paragraph",
            text: "Voici ce qu'il ne fallait pas manquer cette semaine. Bonne lecture !",
          },
          ...picks.map(articleBlock),
          { id: newId(), type: "button", label: "Tous les articles", url: siteUrl },
        ],
      };
    }

    case "announcement": {
      const latest = articles[0];
      return {
        subject: latest ? `Nouvel article : ${latest.title}` : "Nouvel article sur Neural Space",
        preheader: latest?.summary.slice(0, 120) ?? "Une nouvelle publication vient de sortir.",
        blocks: [
          { id: newId(), type: "heading", text: "Ça vient de sortir" },
          {
            id: newId(),
            type: "paragraph",
            text: "On vient de publier un nouvel article — le voici en avant-première pour vous.",
          },
          ...(latest ? [articleBlock(latest)] : []),
          {
            id: newId(),
            type: "button",
            label: "Lire l'article",
            url: latest ? `${siteUrl}/${latest.slug}` : siteUrl,
          },
        ],
      };
    }

    case "edito":
      return {
        subject: "",
        preheader: "",
        blocks: [
          { id: newId(), type: "heading", text: "Note de la rédaction" },
          {
            id: newId(),
            type: "paragraph",
            text: "",
          },
          {
            id: newId(),
            type: "paragraph",
            text: "",
          },
          { id: newId(), type: "divider" },
          {
            id: newId(),
            type: "paragraph",
            text: "— Armand, *Neural Space*",
          },
          { id: newId(), type: "button", label: "Découvrir Neural Space", url: siteUrl },
        ],
      };

    case "blank":
      return { subject: "", preheader: "", blocks: [] };
  }
}

// Articles factices pour les vignettes du picker (jamais envoyés).
export const SAMPLE_ARTICLES: TemplateArticle[] = [
  {
    articleId: "sample-1",
    slug: "#",
    title: "Les trous noirs, expliqués simplement",
    summary: "Ce que les observations récentes nous apprennent vraiment sur les objets les plus extrêmes de l'Univers.",
    categoryName: "Physique",
    categoryColor: "#2233f0",
    readingTimeMin: 6,
  },
  {
    articleId: "sample-2",
    slug: "#",
    title: "Le microbiome, notre deuxième cerveau",
    summary: "L'axe intestin-cerveau bouleverse ce qu'on croyait savoir sur la santé mentale.",
    categoryName: "Biologie",
    categoryColor: "#10b981",
    readingTimeMin: 8,
  },
  {
    articleId: "sample-3",
    slug: "#",
    title: "L'IA peut-elle vraiment raisonner ?",
    summary: "Analyse critique des benchmarks et de ce que « raisonner » signifie pour un modèle.",
    categoryName: "IA",
    categoryColor: "#f59e0b",
    readingTimeMin: 7,
  },
];
