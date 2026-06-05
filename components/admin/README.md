# components/admin

Composants de l'interface d'administration. Tous sont des Client Components (`"use client"`) sauf `HeroConfigForm` qui mixe client state et Server Actions.

---

## Fichiers

### `Sidebar.tsx`
Navigation latérale fixe du dashboard. Liens actifs détectés via `usePathname()`. Bouton logout Supabase avec `router.push("/login")` après `auth.signOut()`.

### `SearchBar.tsx`
Barre de recherche globale dans le dashboard. Debounce 300ms, appel `/api/search`, affiche les résultats avec statut coloré. Retourne `[]` si `res.ok` est faux (pas de crash sur erreur 4xx).

### `HeroConfigForm.tsx`
Formulaire de configuration du `HeroBlock`. Reçoit `currentType` et `currentConfig` depuis le Server Component parent, appelle la Server Action `saveHeroConfig`. Quatre modes : `none`, `live`, `news`, `player`.

---

## `editor/`

### `ArticleEditor.tsx`
Éditeur principal d'article. Gère tout l'état du formulaire et orchestre les sous-composants.

Champs gérés :
- `title`, `summary`, `type` (short/long/audio/video)
- `categoryId`, `tagIds`
- `coverUrl` + `coverAlt` — upload via `/api/upload` → `neuralspace/covers`
- `content` — délégué à `BlockEditor`
- `sources` — tableau `{ label, url?, doi? }` éditable dans un panneau latéral
- `seoTitle`, `seoDescription`
- `isSponsored` — délégué à `ContributorPicker`
- `contributors` — délégué à `ContributorPicker`
- Word count live calculé sur chaque changement de contenu (`countBlockWords`)
- Slug auto-généré depuis le titre, modifiable manuellement

Actions :
- **Save draft** → `updateArticle()` Server Action
- **Publish** → `publishArticle()` Server Action → `router.push("/<slug>")`
- **Unpublish** → `unpublishArticle()`
- **Delete** → `deleteArticle()` (redirect côté serveur vers `/dashboard/articles`)

### `BlockEditor.tsx`
Éditeur de contenu en blocs. Chaque bloc a un type avec un formulaire dédié. Ajout de bloc via un menu (`+`). Réordonnement par drag (ou boutons haut/bas). Suppression par bloc.

Types de blocs supportés :
`heading` · `subheading` · `paragraph` (rich text avec marks) · `quote` · `bullet-list` · `key-takeaways` · `callout` · `equation` (LaTeX) · `code` · `image` · `video` · `divider`

Upload image dans un bloc image : `/api/upload` → `neuralspace/articles`.

### `ContributorPicker.tsx`
Sélection et création de contributeurs.

- Recherche debounce 300ms → `/api/contributors`
- Ajout par clic dans le dropdown
- Création inline : nom, rôle, institution, avatar (upload → `neuralspace/contributors`)
- Toggle "Contenu sponsorisé" intégré (remonte `onSponsoredChange`)
- Nouveau contributeur créé via Server Action `createContributor` — slug auto avec déduplication DB

### `TiptapEditor.tsx`
Éditeur Tiptap (ProseMirror) utilisé pour les blocs `paragraph` rich text dans `BlockEditor`. Marks supportés : bold, italic, underline, strikethrough. Sérialise vers `TextRun[]` (format natif Neural Space).

---

## À faire

- [ ] Drag & drop réel pour réordonner les blocs (actuellement boutons haut/bas)
- [ ] Preview inline des blocs image/video dans l'éditeur
- [ ] Recherche de tags dans `ArticleEditor` (actuellement liste plate)
- [ ] Édition du profil contributeur existant (actuellement création seulement)
