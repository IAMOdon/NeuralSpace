# NeuralSpace — Contexte Projet

## Vision globale

**Neural Space** est une chaîne média scientifique grand public dont l'objectif est de rendre la science accessible : expériences, faits marquants, articles de fond.

Philosophie design : **imposer de nouveaux codes**, pas répliquer ce qui existe (pas un Medium, pas un Substack, pas un Science News classique).

Roadmap long terme (12–15 ans) :
1. **Phase 1 (actuelle)** — Site média avec feed, articles courts/longs, sidebar auteur/sponsor
2. **Phase 2** — **NeuralLab** : bibliothèque open source de modèles IA (santé, biologie, physique)
3. **Phase 3** — Doctorat physique quantique + laboratoires de recherche propres

---

## Identité visuelle

| Token         | Valeur                         |
|---------------|-------------------------------|
| Primary Blue  | `#2233F0` (bleu électrique NS) |
| White         | `#FFFFFF`                      |
| Typographies  | Multiples (à définir selon preset) |
| Design system | Tailwind CSS — 100% custom, zéro composant tiers |

Esthétique : bold, clean, scientifique, spatial. Blanc et bleu électrique comme seul langage de base.

---

## Stack technique

| Composant       | Choix                              |
|-----------------|------------------------------------|
| Langage         | TypeScript (strict)                |
| Framework       | Next.js 15 (App Router)            |
| Base de données | Supabase (PostgreSQL + Auth + RLS) |
| Stockage images | Cloudinary (tier gratuit)          |
| CSS             | Tailwind CSS (custom, no UI lib)   |
| Rich text       | Éditeur bloc custom (zéro lib tierce) |
| Déploiement     | À définir (Vercel probable)        |

- Tout le code est écrit par le fondateur.
- Les articles sont créés manuellement via un **admin panel custom**.
- L'éditeur rich text est entièrement custom (Selection API, Range, contenteditable) — zéro lib tierce.

---

## Architecture du site

### Feed principal

- Point d'entrée unique dès la page d'accueil.
- Deux types de contenus mélangés dans un même feed :
  - **Format court** — badge "Rapide" — digeste, accessible
  - **Format long** — badge "Approfondir" — article de fond
- Carte = visuel + titre + résumé + badge catégorie + badge type
- Filtre par catégorie

### Page Article

- Contenu principal sur les **deux tiers gauche**
- **Sidebar droite** : fiche auteur(s) / labo partenaire + sponsors discrets
- Metadata SEO parfaites sur chaque article (OG, title, description, canonical, JSON-LD)
- Rendu en Server Components (SSR) pour indexation Google maximale

### Section NeuralLab (Phase 2)

- Page dédiée avec filtres par domaine (Santé, Biologie, Physique…)
- Grille de modèles : nom, description courte, précision, lien d'accès

---

## Contenu riche dans les articles

Blocs disponibles dans l'éditeur admin :
- `heading` — En-tête principal (H1, un seul par article)
- `subheading` — Sous-titre (H2, H3) avec ancre de section auto (`#slug-du-titre`)
- `paragraph` — Texte de contenu
- `quote` — Citation mise en valeur (UI distinctive)
- `bullet-list` — Liste à puces
- `key-takeaways` — Bloc "À retenir" : 3–4 points résumés (pont entre format court et long)
- `callout` — Bloc encadré typé : `key-concept`, `warning`, `anecdote`
- `equation` — Équation LaTeX rendue par **KaTeX** (headless, thème custom)
- `code` — Bloc de code avec sélecteur de langage, syntax highlighting via **Shiki** (moteur VS Code), thème custom inspiré Xcode
- `video` — Embed vidéo YouTube/Vimeo
- `image` — Image avec légende (Cloudinary)
- `divider` — Séparateur visuel

Formatage inline : **gras**, souligné, ~~barré~~, hyperlink UI custom, **citation `[n]`** avec tooltip au survol (référence une source de l'article)

**Table des matières** : auto-générée depuis les subheadings, sticky sur les longs articles, avec progression au scroll.

**Highlight & share** : sélectionner un passage → bouton partage X/Twitter avec le passage en citation.

---

## Auteurs

Champs par auteur :
- Nom complet
- Post / rôle (ex : "Chercheur en neurosciences")
- Institution / université
- Bio courte
- Avatar (Cloudinary)
- Liens (site, Twitter/X, Google Scholar, ResearchGate…)

Un article peut avoir **plusieurs auteurs** (relation N:N).
Sources originales des travaux liées à l'article (pas à l'auteur).

---

## Séries d'articles

Un article peut appartenir à une **série** (arc narratif ordonné).
- Ex : "La mécanique quantique en 5 parties — Partie 2/5"
- Navigation entre épisodes (précédent / suivant) dans la page article
- La série a son propre slug, titre, description
- Un article peut appartenir à une seule série

## Tags

En complément des catégories (larges), des **tags** granulaires pour la découverte et le SEO longue traîne.
- Ex : catégorie `Physique`, tags `trous noirs`, `relativité`, `CERN`
- Relation N:N articles ↔ tags
- Filtrables dans le feed

## Recommandations & personnalisation

### "À lire ensuite" — algorithme vectoriel
- À chaque publication, l'article reçoit un **vecteur d'embedding** (OpenAI embeddings API)
- Stocké dans Supabase via l'extension **pgvector**
- Les articles recommandés = voisins les plus proches par similarité cosinus
- Suggestion côté auteur dans l'admin : pendant la rédaction, articles existants proches du sujet actuel → facilite les références internes

### Personnalisation lecteur
- **Watch time** tracké côté client (temps actif + scroll depth), stocké anonymement en base
- "Parce que vous avez lu X" : articles similaires aux articles réellement lus (pas juste cliqués)
- Basé sur cookies (pas de compte requis)

## Métriques articles

- **`view_count`** — compteur de vues, utilisé pour le filtre "Populaire" dans le feed
- **`watch_time`** — temps de lecture moyen réel (analytics internes, pas public)
- Les deux sont tracés sans données personnelles identifiables

---

## SEO — règles absolues

- Chaque article a : `title`, `meta description`, `og:image`, `og:title`, `canonical URL`
- JSON-LD `Article` schema sur chaque page article
- Slugs en kebab-case, stables dans le temps
- `reading_time` calculé côté serveur à partir du `word_count`
- Images avec `alt` text obligatoire

---

## Authentification & rôles

| Rôle          | Accès                                                   |
|---------------|---------------------------------------------------------|
| `admin`       | Accès total — seul le fondateur pour l'instant          |
| `author`      | Futur — auteurs invités (lecture/édition de leurs articles) |
| `institution` | Futur — labos partenaires                               |

Auth via Supabase Auth (magic link ou email/password). Row Level Security (RLS) sur toutes les tables.

---

## Questions ouvertes / à définir

- [ ] Palette de typographies disponibles (pour les layout presets)
- [ ] Définition des layout presets (ex: "Science", "Interview", "Expérience"…)
- [ ] Schéma complet JSON du contenu riche (voir DATABASE_SCHEMA.md)
- [ ] Choix déploiement (Vercel probable)
- [ ] Stratégie de cache (ISR vs SSR pur pour les articles)
- [ ] Valeur exacte du bleu NS (à confirmer avec le designer ou asset source)
