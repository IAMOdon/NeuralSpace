# app/(admin)

Espace d'administration protégé. Toutes les routes sous `/dashboard/**` sont gardées par deux niveaux d'auth :

1. **`middleware.ts`** (Edge) — intercepte avant le rendu, redirige vers `/login?redirectTo=<path>` si pas de session Supabase active.
2. **`layout.tsx`** (Server Component) — vérifie `auth.getUser()` côté serveur, redirect `/login` si non authentifié.

Le login (`/login`) lit le param `redirectTo` et y redirige après connexion (limité aux paths commençant par `/dashboard` pour éviter l'open redirect).

---

## Routes

| Route | Composant | Description |
|---|---|---|
| `/dashboard` | `dashboard/page.tsx` | Vue d'ensemble — stats à venir |
| `/dashboard/articles` | `dashboard/articles/page.tsx` | Liste de tous les articles (titre, catégorie, statut, vues, date) |
| `/dashboard/articles/new` | — | Redirige vers `ArticleEditor` en mode création (via `/dashboard/articles/[id]/edit` après `createArticle`) |
| `/dashboard/articles/[id]/edit` | `ArticleEditor` | Éditeur complet : blocks, cover, contributeurs, sources, SEO, publish |
| `/dashboard/articles/[id]/preview` | — | Prévisualisation du contenu avant publication |
| `/dashboard/hero` | `HeroConfigPage` + `HeroConfigForm` | Configure le bloc hero du feed sans redeploy |

---

## Auth flow

```
Utilisateur accède /dashboard/articles/123/edit
  → middleware.ts vérifie la session
  → si absent : redirect /login?redirectTo=/dashboard/articles/123/edit
  → login réussi : router.push("/dashboard/articles/123/edit")
  → layout.tsx re-vérifie (defense in depth)
```

---

## HeroBlock

Le composant `HeroBlock` dans le feed lit la table `hero_config` (singleton `id = 'singleton'`).  
L'admin peut basculer entre 4 modes sans redeploy :

| Type | Affichage |
|---|---|
| `none` | Rien — le feed commence directement aux articles |
| `live` | Card live avec badge LIVE animé, CTA, spectateurs |
| `news` | Article épinglé en hero (titre, cover, résumé) |
| `player` | Lecteur audio/vidéo intégré |

---

## À faire

- [ ] Dashboard analytics (vues/semaine, top articles, répartition pays/device)
- [ ] Gestion des catégories (CRUD depuis l'admin)
- [ ] Gestion des tags (CRUD depuis l'admin)
- [ ] Suppression confirmée via dialog (actuellement direct)
- [ ] Pagination de la liste articles (actuellement limite 100)
- [ ] Filtre/recherche dans la liste articles
