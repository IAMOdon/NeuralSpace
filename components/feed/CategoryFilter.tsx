"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/types/article";

export function CategoryFilter({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "all";

  function select(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    router.push(`/?${params.toString()}`, { scroll: false });
  }

  const all = [{ id: "all", slug: "all", name: "Tout" }, ...categories];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {all.map((cat) => {
        const isActive = cat.slug === active;
        return (
          <button
            key={cat.id}
            onClick={() => select(cat.slug)}
            className={`text-xs font-sans font-semibold px-3 py-2 rounded-full transition-all duration-200 whitespace-nowrap ${
              isActive
                ? "bg-ns-white text-ns-blue"
                : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
