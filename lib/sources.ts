import type { ArticleSource } from "@/types/article";

// Classification automatique des sources — aucun champ supplémentaire à
// saisir dans l'éditeur, tout est déduit de l'URL/DOI.

export type SourceKind = "doi" | "preprint" | null;

const PREPRINT_HOSTS = [
  "arxiv.org",
  "biorxiv.org",
  "medrxiv.org",
  "chemrxiv.org",
  "psyarxiv.com",
  "osf.io/preprints",
  "ssrn.com",
  "hal.science",
  "preprints.org",
  "researchsquare.com",
];

export function classifySource(source: ArticleSource): SourceKind {
  const url = source.url?.toLowerCase() ?? "";
  if (PREPRINT_HOSTS.some((h) => url.includes(h))) return "preprint";
  if (source.doi || url.includes("doi.org/") || /\/10\.\d{4,}\//.test(url)) return "doi";
  return null;
}
