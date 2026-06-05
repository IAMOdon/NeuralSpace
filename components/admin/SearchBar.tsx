"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Clock, FileText } from "lucide-react";

type Result = {
  id: string;
  title: string;
  slug: string;
  status: string;
  published_at: string | null;
  view_count: number;
  summary: string;
  rank: number;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  published: { label: "Publié",  color: "bg-green-100 text-green-700" },
  draft:     { label: "Brouillon", color: "bg-neutral-100 text-neutral-500" },
  archived:  { label: "Archivé", color: "bg-red-100 text-red-500" },
};

export function SearchBar() {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<Result[]>([]);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [active, setActive]     = useState(-1);
  const inputRef  = useRef<HTMLInputElement>(null);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef   = useRef<HTMLUListElement>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const search = useCallback((q: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (q.length < 2) { setResults([]); setOpen(false); return; }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data: Result[] = await res.json();
        setResults(data);
        setOpen(true);
        setActive(-1);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    search(v);
  }

  function clear() {
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Enter" && active >= 0) {
      const r = results[active];
      if (r) window.location.href = `/${r.slug}`;
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (active >= 0 && listRef.current) {
      const item = listRef.current.children[active] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [active]);

  return (
    <div className="relative w-full">
      {/* Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-4 h-4 text-neutral-400 pointer-events-none" strokeWidth={1.5} />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Rechercher un article, une thématique, une étude…"
          className="w-full pl-11 pr-10 py-3 rounded-xl border border-neutral-200 bg-white text-sm font-sans text-ns-black placeholder-neutral-400 focus:outline-none focus:border-ns-blue transition-colors duration-200"
        />
        {loading && (
          <div className="absolute right-4 w-4 h-4 border-2 border-ns-blue/30 border-t-ns-blue rounded-full animate-spin" />
        )}
        {query && !loading && (
          <button onClick={clear} className="absolute right-4 text-neutral-300 hover:text-neutral-500 transition-colors duration-200">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute top-full mt-2 left-0 right-0 z-50 bg-white border border-neutral-100 rounded-2xl shadow-xl overflow-hidden max-h-80 overflow-y-auto"
        >
          {results.map((r, i) => {
            const st = STATUS_LABELS[r.status] ?? STATUS_LABELS.draft!;
            const isActive = i === active;
            return (
              <li key={r.id} role="option" aria-selected={isActive}>
                <a
                  href={`/${r.slug}`}
                  className={`flex items-start gap-3 px-4 py-3 transition-colors duration-150 ${isActive ? "bg-ns-blue/5" : "hover:bg-neutral-50"}`}
                >
                  <FileText className="w-4 h-4 text-neutral-300 shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-sans font-semibold text-sm text-ns-black truncate">{r.title}</p>
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full shrink-0 ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                    {r.summary && (
                      <p className="text-xs text-neutral-400 font-sans line-clamp-1">{r.summary}</p>
                    )}
                  </div>
                  {r.published_at && (
                    <span className="flex items-center gap-1 text-[11px] text-neutral-300 font-sans shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(r.published_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-white border border-neutral-100 rounded-2xl shadow-xl px-4 py-6 text-center">
          <p className="text-sm text-neutral-400 font-sans">Aucun article pour « {query} »</p>
        </div>
      )}
    </div>
  );
}
