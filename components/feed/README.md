# components/feed

Composants de la page feed (homepage publique).

---

## Composants

### `HeroBlock.tsx`
Bloc hero configurable en tête du feed. Lit la table `hero_config` (singleton) via `adminClient` et switche entre 4 modes :

| Mode | Rendu |
|---|---|
| `none` | Rien — feed commence directement |
| `live` | Card LIVE animée avec badge pulsant, CTA, nombre de spectateurs |
| `news` | Article épinglé en hero (cover grande, titre, résumé, CTA) |
| `player` | Lecteur audio/vidéo intégré |

La config est modifiable depuis `/dashboard/hero` sans redeploy. `revalidatePath("/")` est appelé à chaque save.

### `ArticleCard.tsx`
Card d'article dans le feed. Cover en ratio **3:2 paysage** (`aspect-[3/2]`). Affiche : catégorie colorée, titre, résumé tronqué, tags, auteurs, temps de lecture, badge audio/vidéo selon type.

### `CategoryFilter.tsx`
Filtre par catégorie URL-based. Chaque catégorie est un lien `href="/?category=<slug>"`. La catégorie active est lue depuis `useSearchParams()`. Inclut "Tous" comme option de reset.

### `BecauseYouRead.tsx` (Client Component)
Section de recommandations personnalisées. Lit `ns_history` localStorage pour trouver le dernier article lu, appelle `/api/similar` avec son `categoryId`. Rendu client-only (lazy init après hydration).

### `AudioCover.tsx`
Cover stylisée pour les articles de type audio — ratio 2:3 portrait avec overlay dark et icône play.

---

## À faire

- [ ] `AudioCard` dans le feed quand la section audio sera live (table `episodes` en place)
- [ ] `LiveHero` conditionnel sur `live_events` (actif seulement si live en cours)
- [ ] Pagination ou infinite scroll du feed
- [ ] Filtre par tag (en plus des catégories)
- [ ] "À la une" : épingler un article hero en grand format (1 grand + grille)
