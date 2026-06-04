export type ConsentStatus = "accepted" | "declined" | null;

export type ReadHistoryEntry = {
  slug: string;
  title: string;
  categorySlug: string;
  readAt: string; // ISO date
};

const MAX_HISTORY = 10;

// --- Low-level cookie helpers ---

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2] ?? "") : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  // TODO: add Secure flag once custom domain is confirmed HTTPS-only
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

// --- Consent ---

export function getConsent(): ConsentStatus {
  const v = getCookie("ns_consent");
  if (v === "accepted" || v === "declined") return v;
  return null;
}

export function setConsent(status: "accepted" | "declined") {
  setCookie("ns_consent", status, 365);
}

// --- Anonymous session ID (only created with consent) ---

export function getOrCreateSession(): string {
  const existing = getCookie("ns_session");
  if (existing) return existing;
  const id = crypto.randomUUID();
  // TODO: add Secure flag once custom domain is confirmed HTTPS-only
  document.cookie = `ns_session=${id}; path=/; SameSite=Lax`;
  return id;
}

function deleteSessionCookie() {
  document.cookie = "ns_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// Wipes all consent-dependent data — call on decline or revoke.
export function clearAllConsentData() {
  deleteSessionCookie();
  localStorage.removeItem("ns_history");
  localStorage.removeItem("ns_interests");
}

// --- Reading history (stored in localStorage — larger payload than cookies) ---

export function getReadHistory(): ReadHistoryEntry[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("ns_history") ?? "[]");
  } catch {
    return [];
  }
}

export function addToReadHistory(entry: Omit<ReadHistoryEntry, "readAt">) {
  if (getConsent() !== "accepted") return;
  const history = getReadHistory().filter((e) => e.slug !== entry.slug);
  const updated: ReadHistoryEntry[] = [
    { ...entry, readAt: new Date().toISOString() },
    ...history,
  ].slice(0, MAX_HISTORY);
  localStorage.setItem("ns_history", JSON.stringify(updated));
}

// --- Interest scores by category slug (localStorage) ---

type InterestMap = Record<string, number>; // categorySlug → score

export function getInterests(): InterestMap {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("ns_interests") ?? "{}");
  } catch {
    return {};
  }
}

// Adds points to a category. readCompleted = +2, partial = +1.
export function updateInterest(categorySlug: string, readCompleted: boolean) {
  if (getConsent() !== "accepted") return;
  const interests = getInterests();
  interests[categorySlug] = (interests[categorySlug] ?? 0) + (readCompleted ? 2 : 1);
  localStorage.setItem("ns_interests", JSON.stringify(interests));
}

// Returns category slug with highest score, or null if no data.
export function getTopInterestCategory(): string | null {
  const interests = getInterests();
  const entries = Object.entries(interests);
  if (!entries.length) return null;
  return entries.sort((a, b) => b[1] - a[1])[0]![0];
}

