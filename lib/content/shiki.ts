import { createHighlighter, type BundledLanguage } from "shiki";

// Singleton — highlighter is created once and reused across requests.
let highlighter: Awaited<ReturnType<typeof createHighlighter>> | null = null;

async function getHighlighter() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ["github-dark"],
      langs: [
        "typescript", "javascript", "tsx", "jsx",
        "python", "bash", "sql", "json", "css", "html", "markdown",
      ],
    });
  }
  return highlighter;
}

export async function highlightCode(code: string, lang: string): Promise<string> {
  const h = await getHighlighter();
  const safeLang = h.getLoadedLanguages().includes(lang as BundledLanguage)
    ? (lang as BundledLanguage)
    : "text";

  return h.codeToHtml(code, { lang: safeLang, theme: "github-dark" });
}
