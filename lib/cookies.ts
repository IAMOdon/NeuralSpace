export type ConsentStatus = "accepted" | "declined" | null;

export type ReadHistoryEntry = {
  slug: string;
  title: string;
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

// --- Anonymous session ID ---

export function getOrCreateSession(): string {
  const existing = getCookie("ns_session");
  if (existing) return existing;
  const id = crypto.randomUUID();
  // Session cookie — expires when browser closes
  document.cookie = `ns_session=${id}; path=/; SameSite=Lax`;
  return id;
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

export function clearReadHistory() {
  localStorage.removeItem("ns_history");
}
