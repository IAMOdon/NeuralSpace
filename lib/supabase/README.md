# lib/supabase

Trois clients Supabase avec des niveaux de privilège distincts. Ne jamais les confondre.

---

## `server.ts` — Client serveur (anon)

```ts
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();
```

- Utilise la clé `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Respecte les RLS policies**
- Lit les cookies Next.js pour la session active
- À utiliser dans les Server Components, Server Actions et Route Handlers pour toute opération qui doit respecter les droits de l'utilisateur connecté
- Utilisé dans `ensureAdmin()` pour vérifier `auth.getUser()`

## `browser.ts` — Client navigateur (anon)

```ts
import { createClient } from "@/lib/supabase/browser";
const supabase = createClient();
```

- Utilise la clé `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Respecte les RLS policies**
- Stocke la session dans `localStorage`
- À utiliser uniquement dans les Client Components (`"use client"`)
- Utilisé dans `app/login/page.tsx` pour `auth.signInWithPassword()`

## `admin.ts` — Client admin (service_role)

```ts
import { adminClient } from "@/lib/supabase/admin";
```

- Utilise la clé `SUPABASE_SERVICE_ROLE_KEY`
- **Bypass complet des RLS** — lit et écrit n'importe quelle table sans restriction
- Protégé par `import "server-only"` — le build échoue si importé dans un bundle client
- À utiliser **uniquement** dans les Server Actions et Route Handlers authentifiés, après vérification manuelle de `auth.getUser()` via le client serveur
- Ne jamais passer `adminClient` à un composant, ne jamais l'exposer dans une réponse API

---

## Règle d'or

```
auth.getUser()  → toujours via client server (anon) — jamais via adminClient
mutations DB    → toujours via adminClient — après avoir vérifié l'identité
reads publics   → client server ou adminClient selon si RLS est pertinent
```
