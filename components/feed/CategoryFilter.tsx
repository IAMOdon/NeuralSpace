"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { Category } from "@/types/article";

// These slugs appear as inline pills in priority order.
// Every other category goes into the overflow dropdown.
const INLINE_SLUGS = [
  "physique",
  "astronomie",
  "biologie",
  "neurosciences",
  "intelligence-artificielle",
  "mathematiques",
];

export function CategoryFilter({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "all";
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function select(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") params.delete("category");
    else params.set("category", slug);
    router.push(`/?${params.toString()}`, { scroll: false });
    setOpen(false);
  }

  const orderMap = new Map(INLINE_SLUGS.map((s, i) => [s, i]));
  const inline   = categories
    .filter((c) => orderMap.has(c.slug))
    .sort((a, b) => (orderMap.get(a.slug) ?? 99) - (orderMap.get(b.slug) ?? 99));
  const overflow = categories.filter((c) => !orderMap.has(c.slug));
  const overflowIsActive = overflow.some((c) => c.slug === active);

  const pill = (isActive: boolean) =>
    `text-xs font-sans font-semibold px-3 py-1.5 rounded-full transition-colors duration-200 whitespace-nowrap ${
      isActive
        ? "bg-ns-blue text-white"
        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-ns-black"
    }`;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button onClick={() => select("all")} className={pill(active === "all")}>
        Tout
      </button>

      {inline.map((cat) => (
        <button key={cat.id} onClick={() => select(cat.slug)} className={pill(cat.slug === active)}>
          {cat.name}
        </button>
      ))}

      {overflow.length > 0 && (
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className={`flex items-center gap-1 text-xs font-sans font-semibold px-3 py-1.5 rounded-full transition-colors duration-200 ${
              overflowIsActive
                ? "bg-ns-blue text-white"
                : open
                ? "bg-neutral-200 text-ns-black"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-ns-black"
            }`}
          >
            Plus
            <ChevronDown
              className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div className="absolute top-full mt-2 left-0 bg-white rounded-2xl border border-neutral-100 shadow-lg py-1.5 min-w-[200px] z-50">
              {overflow.map((cat) => {
                const isActive = cat.slug === active;
                return (
                  <button
                    key={cat.id}
                    onClick={() => select(cat.slug)}
                    className={`w-full text-left text-xs font-sans px-4 py-2.5 transition-colors duration-150 ${
                      isActive
                        ? "font-semibold text-ns-blue bg-ns-blue/5"
                        : "font-medium text-neutral-600 hover:bg-neutral-50 hover:text-ns-black"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
