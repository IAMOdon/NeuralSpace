# NeuralSpace — Security Practices

---

## Supabase

### Row Level Security (RLS)
- **Activé sur toutes les tables sans exception**
- Politique minimale du privilege : lecture publique uniquement sur les articles publiés
- Écriture réservée aux rôles authentifiés avec vérification JWT
- `service_role` key utilisée uniquement côté serveur sécurisé (webhooks, cron)

### Clients distincts
| Client | Clé | Usage |
|---|---|---|
| `server.ts` | anon | Server Components, Route Handlers |
| `browser.ts` | anon | Client Components (auth state uniquement) |
| `admin.ts` | service_role | Build time, cron — jamais côté client |

### Validation des entrées
- Zod sur toutes les données entrantes aux frontières système
- `safeParse` (jamais `parse`) sur les données JSONB de Supabase — malformed data = fallback gracieux, jamais de crash

---

## Headers HTTP

Configurés dans `next.config.ts` pour toutes les routes :
```
X-Content-Type-Options: nosniff         — empêche le MIME sniffing
X-Frame-Options: SAMEORIGIN            — anti-clickjacking
X-XSS-Protection: 1; mode=block        — filtre XSS legacy browsers
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```
`poweredByHeader: false` — ne pas exposer la version Next.js.

---

## Variables d'environnement

| Variable | Exposition | Usage |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client | URL du projet |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client | Clé publique (RLS protège) |
| `SUPABASE_SERVICE_ROLE_KEY` | Serveur uniquement | Bypass RLS — jamais dans le bundle client |
| `CLOUDINARY_API_SECRET` | Serveur uniquement | Upload — jamais exposé |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Client | Lecture seule — OK |

`.env.local` est dans `.gitignore` — jamais commité.

---

## dangerouslySetInnerHTML

Utilisé dans 3 contextes uniquement :
1. **JSON-LD** — données structurées générées par notre code, pas d'input utilisateur
2. **KaTeX** — rendu LaTeX depuis notre propre contenu admin
3. **Shiki** — colorisation syntaxique depuis notre propre contenu admin

Jamais utilisé sur du contenu arbitraire utilisateur.

---

## Routes admin

- Toutes sous `app/(admin)/` — layout vérifie la session Supabase avant rendu
- Redirect vers `/login` si non authentifié — côté serveur (pas client)
- `/api/` disallowed dans `robots.txt`
- `/dashboard/` disallowed dans `robots.txt`

---

## Cloudinary

- Uploads uniquement via des Route Handlers serveur authentifiés
- `api_secret` jamais dans le bundle client
- Transformations via URL publiques — aucune donnée sensible dans les URLs
