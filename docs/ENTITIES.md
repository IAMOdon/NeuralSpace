# Entités — Contributeurs, Institutions & Crédits

> Statut : **PLAN** (rien d'implémenté). Rédigé le 11 juin 2026, à discuter avant tout code.

## Pourquoi c'est structurant (pas un nice-to-have)

Pour un média scientifique, les crédits ne sont pas de la décoration — c'est **la couche de crédibilité du produit** :

- **E-E-A-T (Google)** : les Quality Rater Guidelines récompensent explicitement les auteurs identifiables avec credentials, les processus de relecture visibles, et les organisations transparentes. Un article "Vérifié par Dr X, CNRS" se positionne mieux qu'un contenu anonyme à qualité égale.
- **Confiance lecteur** : la différence entre un blog science et Quanta/Nature News tient à trois lignes : qui a écrit, qui a vérifié, qui finance.
- **Effet réseau** : chaque chercheur crédité avec une vraie page devient un relais (il partage son profil), chaque institution partenaire un label.
- **NeuralLab (Phase 2)** : les institutions partenaires de la roadmap réutiliseront exactement ce référentiel.

## État actuel (audit)

| Existant | Limite |
|---|---|
| Table `authors` (name, slug, avatar, role, **institution en TEXT libre**, bio) | Institution dénormalisée → doublons inévitables ("CNRS", "Cnrs", "C.N.R.S.") |
| `article_authors` N:N avec `order` | **Pas de rôle sur la relation** — impossible de distinguer auteur / relecteur / illustrateur |
| `is_sponsored` boolean sur articles | Sponsor sans identité — pas de logo, pas de disclosure propre, pas d'historique |
| ContributorPicker (admin) + ContributorSidebar (public) | Fonctionnels mais limités au rôle unique "auteur" |

## Modèle cible

### 1. Contributeurs (personnes)

Champs ajoutés à `authors` :
- `institution_id` → FK vers `institutions` (affiliation principale) — remplace le TEXT à terme
- `orcid` — l'identifiant standard des chercheurs (orcid.org). Machine-readable, vérifiable, signal E-E-A-T massif via `sameAs` JSON-LD
- `links` JSONB — `{ website, x, scholar, researchgate, linkedin }`
- `is_verified` boolean — badge "profil vérifié par la rédaction"

### 2. Institutions (organisations)

Nouvelle table `institutions` :
- `slug`, `name`, `type` (`université | laboratoire | institut | agence | entreprise | journal | autre`)
- `logo_url` (Cloudinary, dossier `neuralspace/institutions`), `url`, `country`, `description`

Sert à : affiliation des contributeurs, crédit partenaire d'article, sponsor identifié, partenaires NeuralLab.

### 3. Rôles de contribution — **le différenciateur**

`article_authors` gagne une colonne `role` (inspiré de la taxonomie CRediT, adapté média) :

| Rôle | Affichage public |
|---|---|
| `author` (défaut) | Écrit par |
| `scientific_review` | **Vérifié scientifiquement par** — avec date |
| `translation` | Traduit par |
| `illustration` | Illustrations |
| `editing` | Édité par |

Le badge **"Vérifié scientifiquement par Dr X — 12 juin 2026"** est ce qui sépare un média science sérieux d'un blog. Avec le dual-content (version scientifique), c'est encore plus pertinent : la version scientifique relue par un chercheur du domaine.

### 4. Article ↔ Institution

Nouvelle table `article_institutions` :
- `kind` : `partner` (labo partenaire — crédit sidebar avec logo) | `sponsor` (remplace `is_sponsored` par une identité réelle + disclosure) | `data_source` (données/images fournies par)
- `order` pour l'affichage

### Schéma SQL (esquisse v1)

```sql
create table institutions (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  type        text not null default 'autre'
              check (type in ('université','laboratoire','institut','agence','entreprise','journal','autre')),
  logo_url    text,
  url         text,
  country     text,
  description text,
  created_at  timestamptz not null default now()
);

alter table authors
  add column institution_id uuid references institutions(id),
  add column orcid          text,
  add column links          jsonb not null default '{}',
  add column is_verified    boolean not null default false;
  -- authors.institution (text) conservé pendant la transition, drop en phase 3

alter table article_authors
  add column role text not null default 'author'
  check (role in ('author','scientific_review','translation','illustration','editing'));

create table article_institutions (
  article_id     uuid not null references articles(id) on delete cascade,
  institution_id uuid not null references institutions(id) on delete cascade,
  kind           text not null default 'partner'
                 check (kind in ('partner','sponsor','data_source')),
  "order"        int not null default 0,
  primary key (article_id, institution_id, kind)
);
-- RLS : lecture publique (select using true), écriture service-role uniquement,
-- comme les tables existantes.
```

## Surfaces

### Admin — `/dashboard/entities`

- **Onglets Contributeurs | Institutions** — même langage UI que Audience (stats cards, table, recherche)
- CRUD en modal : avatar/logo via `/api/upload` existant, validation Zod
- **Compteur d'usage** par entité (nb d'articles liés) + protection : pas de suppression si utilisé
- **Outil de fusion** (merge) : dédoublonner deux entités en réassignant les liaisons — indispensable dès que le TEXT libre actuel sera migré
- **ContributorPicker upgradé** : sélecteur de rôle par contributeur sur l'article + picker institutions (kind partner/sponsor)
- Migration des données : backfill `authors.institution` (text) → table `institutions` + FK (script semi-auto, fusion manuelle des variantes)

### Public

- **Bloc crédits** (remplace ContributorSidebar) : Écrit par / Vérifié scientifiquement par / En partenariat avec [logo] / Sponsorisé par [logo + mention transparence]
- **`/contributeurs/[slug]`** : bio, affiliation, liens, ORCID, liste de ses articles. Or massif pour l'E-E-A-T + maillage interne + page partageable par le chercheur
- **`/institutions/[slug]`** (phase 3) : présentation + articles liés — préfigure NeuralLab
- **JSON-LD** : `Person` avec `sameAs: [orcid, scholar, x…]` + `affiliation`; `Organization` pour les institutions ; `reviewedBy` sur l'article quand relecture scientifique

## Phasage proposé

| Phase | Contenu | Effort |
|---|---|---|
| **1 — Fondations** | Migration SQL + types, `/dashboard/entities` CRUD complet, rôle sur article_authors, picker upgradé | ~1 grosse session |
| **2 — Crédits publics** | Bloc crédits redesigné, badge "Vérifié scientifiquement", disclosure sponsor identifié, JSON-LD Person/Organization/reviewedBy | ~1 session |
| **3 — Pages entités** | `/contributeurs/[slug]` + `/institutions/[slug]`, sitemap, drop de `authors.institution` (text) et `is_sponsored` | ~1 session |

Décisions à trancher avant la phase 1 :
1. **Nommage** : renommer `authors` → `contributors` (plus juste, migration plus lourde) ou garder `authors` (pragmatique) ? → recommandation : **garder `authors`**, le nom public est "contributeurs" côté UI.
2. La relecture scientifique est-elle datée par article (`reviewed_at` sur la liaison) ? → recommandation : **oui**, la date renforce le badge.
3. Sponsor au niveau article (actuel) ou campagne/période ? → article pour l'instant.

---

# Backlog général (au-delà des entités)

Consolidation de tout ce qui est ouvert, par impact :

**Crédibilité / produit**
- [ ] Entités & crédits (ce document)
- [ ] Richesse visuelle des articles + layout presets (`layout_preset` existe en base, jamais utilisé) — discussion design à reprendre
- [ ] TOC sticky auto-générée depuis les subheadings (promis dans NEURALSPACE_CONTEXT)
- [ ] Highlight & share (sélection → citation X/Twitter)
- [ ] Navigation de série (données fetchées, aucune UI)
- [ ] Décision MobileBanner : le bandeau "optimisé desktop" contredit l'objectif mobile production-grade → suppression recommandée

**Croissance / SEO**
- [ ] "À lire ensuite" vectoriel : colonne pgvector existante, aucun embedding écrit — brancher une pipeline d'embeddings à la publication
- [ ] ISR articles : fetch public sans cookies pour rendre `/[slug]` statique (gros gain LCP)
- [ ] `next/image` + Cloudinary `f_auto/q_auto` partout (5 `unoptimized` + `<img>` dans le renderer)
- [ ] OG images dynamiques par article (template branded)

**Infrastructure**
- [ ] Resend : domaine vérifié + `RESEND_API_KEY`/`EMAIL_FROM` (l'envoi newsletter est prêt, désactivé sans ça)
- [ ] Audio/Live : modèles de données réels (tables episodes/sessions) pour remplacer les squelettes
- [ ] Commits : découper le travail non commité en commits logiques
