# Architecture Decisions

## Client-Side Exceptions

Some components must be Client Components due to architectural constraints:

### BecauseYouRead Component
**Location:** `components/feed/BecauseYouRead.tsx`

**Reason:** Personalized recommendations depend on:
- `ns_interests` (localStorage) — per-session category scores
- `ns_history` (localStorage) — reading history

These are only available on the client and cannot be accessed during server-side rendering.

**Impact:**
- Component fetches `/api/similar` on mount (client-side)
- Shows skeleton while loading
- Falls back gracefully if localStorage is empty

**Trade-off:** Slightly delayed recommendation rendering, but enables privacy-first personalization without user accounts.

---

## RLS and Authentication

All public-facing analytics endpoints (`/api/track`, `/api/similar`, `/api/dictionary`) accept anonymous requests. Rate limiting is applied per IP address to prevent abuse.

Admin endpoints require Supabase session authentication verified in middleware + layout + server actions (defense in depth).

---

## Rate Limiting

`/api/track` (public analytics endpoint) is rate-limited to **100 events per minute per IP** using Redis. This prevents DOS attacks while allowing legitimate users to submit analytics.

- **Strategy:** IP-based rate limiting
- **Storage:** Redis (via REDIS_URL env var)
- **Failure mode:** Fail-open (allows requests if Redis is unavailable)
- **Response:** 429 Too Many Requests with `Retry-After: 60` header

---

## Code Deduplication

The `tiptapToContentBlocks` function was previously defined in both:
- `lib/articles.ts`
- `lib/content/parseBlocks.ts`

This has been consolidated into:
- `lib/content/tiptapConverter.ts`

Both modules now import from the single source of truth.
