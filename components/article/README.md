# components/article

Pipeline de rendu d'un article public. Tous les composants de ce dossier opèrent soit en Server Component async, soit en Client Component avec un rôle précis.

---

## Composants

### `ArticleRenderer.tsx` (Server Component async)
Composant racine du rendu du contenu. Reçoit `ContentBlock[]`, rend chaque bloc en parallèle via `Promise.all(blocks.map(renderBlock))`.

Rendu par type de bloc :
- `heading` → `<h1>`
- `subheading` → `<h2>` ou `<h3>` avec id anchor pour la table des matières
- `paragraph` → `<p>` avec `RichTextRenderer`
- `quote` → `<blockquote>` avec attribution optionnelle
- `bullet-list` → `<ul>` custom (dot bleu NS)
- `key-takeaways` → card bleu NS avec liste
- `callout` → card colorée selon variant (key-concept / warning / anecdote)
- `equation` → KaTeX rendu côté serveur en HTML (`displayMode: true`, `throwOnError: false`)
- `code` → Shiki avec fallback `<pre>` si le highlighter échoue (`.catch(() => null)`)
- `image` → `next/image` avec `fill` + `aspect-video`
- `video` → iframe YouTube NooCookie ou Vimeo
- `divider` → `<hr>`

### `TextRunRenderer.tsx` (Server Component)
Rendu d'un tableau `TextRun[]` en JSX inline. Gère :
- `marks` : bold, italic, underline, strikethrough
- `link` : `<a href>` avec `target="_blank" rel="noopener"`
- `citation` : `[N]` en `<sup>` qui dispatch l'event `ns:source-click`
- `inlineLatex` : `katex.renderToString` inline

### `ArticleHeader.tsx`
Header de page article : cover image (3:2 landscape), catégorie, titre, résumé, auteurs, temps de lecture, date, badge "Sponsorisé" si applicable.

### `ArticleTracker.tsx` (Client Component)
Tracking RGPD-aware invisible. Sans cookie de consentement : POST `article_views`. Avec consentement : POST `watch_events` à la fin de lecture (Intersection Observer + `visibilitychange`).

### `ContributorSidebar.tsx`
Liste des auteurs d'un article avec avatar, nom, rôle, institution. Affiché en sidebar sur desktop.

### `WordLookup.tsx` (Client Component)
Tooltip de définition de mot. Écoute `mouseup` sur le conteneur article, extrait le mot sélectionné, appelle `/api/dictionary`. AbortController par requête pour annuler les appels en vol. Cache module-level pour éviter de re-fetcher le même mot.

### `SourceLink.tsx`
Lien de source numéroté `[N]` dans le footer d'article. Écoute l'event `ns:source-click` dispatché par `TextRunRenderer` pour scroll vers la source correspondante.

---

## Format ContentBlock

Voir `lib/content/validators.ts` pour le schéma Zod complet.  
Voir `lib/content/parseBlocks.ts` pour la conversion depuis Tiptap JSON legacy.

---

## À faire

- [ ] Table des matières sticky générée depuis les blocs `subheading`
- [ ] Temps de lecture restant dynamique ("Il vous reste ~3 min")
- [ ] Partage social par article (Web Share API + fallback)
- [ ] `ContributorSidebar` avec lien vers les autres articles de l'auteur
