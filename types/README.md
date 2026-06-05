# types

Définitions TypeScript partagées à travers le projet.

---

## Fichiers

### `article.ts`
Types pour les articles et leurs relations côté public (lecture).

- `ArticleCard` — données minimales pour les cards du feed
- `ArticleData` — article complet avec auteurs, tags, sources, contenu parsé
- `ArticleSource` — `{ label: string, url?: string, doi?: string }` — url optionnelle (sources sans lien papier)
- `Category`, `Tag`, `Author`

### `content.ts`
Types des blocs de contenu (miroir des schémas Zod de `lib/content/validators.ts`).

- `ContentBlock` — union discriminée de tous les types de blocs
- `TextRun` — segment de texte avec marks optionnels, link, citation, inlineLatex
- `MarkType` — `"bold" | "italic" | "underline" | "strikethrough"`

### `events.d.ts`
Déclarations globales des custom events Neural Space — permet l'autocomplétion et la vérification de type sur `window.dispatchEvent` et `window.addEventListener`.

```ts
"ns:word-lookup"  → CustomEvent<{ word: string }>
"ns:source-click" → CustomEvent<{ href: string }>
```

### `author.ts`
Type `Author` étendu avec `bio` et `socialLinks` — pour les futures pages auteurs publiques.

### `index.ts`
Re-exports centralisés.

### `supabase.ts`
Généré automatiquement par le CLI Supabase (`supabase gen types typescript`). Contient `Database`, `Tables`, `Json`. Ne pas éditer manuellement.

---

## Régénérer `supabase.ts`

```bash
npx supabase gen types typescript --project-id <project-id> > types/supabase.ts
```

À relancer après chaque migration appliquée en production.
