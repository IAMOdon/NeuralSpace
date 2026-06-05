# lib/content

Système de contenu structuré de Neural Space. Les articles ne stockent pas du HTML brut — ils stockent un tableau de blocs typés (`ContentBlock[]`) sérialisé en JSONB dans Supabase.

---

## `validators.ts`

Schémas Zod pour valider le contenu avant rendu et avant sauvegarde.

### `ContentBlockSchema`
Union discriminée sur `type`. Blocs supportés :

| Type | Champs clés |
|---|---|
| `heading` | `content: string` |
| `subheading` | `level: 2\|3`, `content: string`, `anchor: string` |
| `paragraph` | `content: TextRun[]` |
| `quote` | `content: string`, `attribution?: string` |
| `bullet-list` | `items: TextRun[][]` |
| `key-takeaways` | `items: string[]` |
| `callout` | `variant: "key-concept"\|"warning"\|"anecdote"`, `title?`, `content: TextRun[]` |
| `equation` | `latex: string` |
| `code` | `language: string`, `content: string`, `filename?` |
| `image` | `url: string`, `alt: string`, `caption?` |
| `video` | `provider: "youtube"\|"vimeo"`, `videoId: string`, `caption?` |
| `divider` | — |

### `TextRunSchema`
Un segment de texte inline avec styling optionnel :
- `text: string` — le texte brut
- `marks?: ("bold"\|"italic"\|"underline"\|"strikethrough")[]`
- `link?: { href: string, label?: string }` — lien cliquable
- `citation?: number` — rend `[N]` en superscript automatiquement (NE PAS mettre `[1]` dans `text`)
- `inlineLatex?: string` — équation inline KaTeX

### `ArticleSourceSchema`
```ts
{ label: string, url?: string, doi?: string }
```
`url` est optionnel — un article peut avoir une source sans URL (ex : source papier). `parseSources()` retourne `[]` si la validation échoue globalement.

---

## `parseBlocks.ts`

`parseBlocks(raw: unknown): ContentBlock[]`

Accepte deux formats d'entrée :
1. **`ContentBlock[]` natif** — valide via `ContentSchema.safeParse`, retourne `[]` si invalide
2. **Tiptap ProseMirror JSON** (`{ type: "doc", content: [...] }`) — convertit en blocs natifs

La conversion Tiptap→blocs gère : `paragraph`, `heading` (h1→heading, h2/h3→subheading), `blockquote`, `bulletList`, `orderedList`, `codeBlock`, `horizontalRule`.

---

## `shiki.ts`

`highlightCode(code: string, lang: string): Promise<string>`

Singleton — le `Highlighter` Shiki est créé une fois au premier appel et réutilisé. Thème `github-dark`. Langages chargés : TypeScript, JavaScript, TSX, JSX, Python, Bash, SQL, JSON, CSS, HTML, Markdown.

Si `lang` n'est pas dans la liste chargée, fallback sur `"text"` (pas d'erreur).

Utilisé dans `ArticleRenderer` avec `.catch(() => null)` — si Shiki échoue, rendu en `<pre>` plain text sans crash de la page.

---

## À faire

- [ ] Bloc `table` (tableau Markdown-like)
- [ ] Bloc `timeline` (pour articles historiques)
- [ ] Ajout de langues Shiki à la demande (Rust, Go, C, R…)
- [ ] `anchor` auto sur `subheading` dans l'éditeur (actuellement manuel)
