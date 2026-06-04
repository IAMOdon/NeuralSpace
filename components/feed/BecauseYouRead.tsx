"use client";

import { useEffect, useState } from "react";
import { getConsent, getReadHistory, getTopInterestCategory } from "@/lib/cookies";
import { ArticleCard } from "./ArticleCard";
import type { ArticleCard as ArticleCardType } from "@/types/article";

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-3 space-y-4 animate-pulse">
      <div className="aspect-[16/9] rounded-xl bg-neutral-100" />
      <div className="px-1 space-y-3">
        <div className="h-3 w-20 rounded-full bg-neutral-100" />
        <div className="h-4 w-3/4 rounded-full bg-neutral-100" />
        <div className="h-3 w-full rounded-full bg-neutral-100" />
        <div className="h-3 w-2/3 rounded-full bg-neutral-100" />
      </div>
    </div>
  );
}

export function BecauseYouRead() {
  const [articles, setArticles] = useState<ArticleCardType[]>([]);
  const [lastTitle, setLastTitle] = useState<string | null>(null);
  // null = unknown (checking), false = no section, true = show
  const [state, setState] = useState<"loading" | "empty" | "ready">(() =>
    typeof window !== "undefined" && getConsent() !== "accepted" ? "empty" : "loading"
  );

  useEffect(() => {
    if (getConsent() !== "accepted") { setState("empty"); return; }

    const history = getReadHistory();
    const lastRead = history[0];
    const topCategory = getTopInterestCategory() ?? lastRead?.categorySlug ?? null;

    if (!topCategory || !lastRead) { setState("empty"); return; }

    setLastTitle(lastRead.title);

    fetch(`/api/similar?categorySlug=${encodeURIComponent(topCategory)}&exclude=${encodeURIComponent(lastRead.slug)}`)
      .then((r) => r.json())
      .then((data: ArticleCardType[]) => {
        setArticles(data);
        setState(data.length > 0 ? "ready" : "empty");
      })
      .catch(() => setState("empty"));
  }, []);

  if (state === "empty") return null;

  if (state === "loading") {
    return (
      <section className="space-y-5">
        <div className="h-6 w-56 rounded-full bg-neutral-100 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-baseline gap-3">
        <h2 className="font-heading font-bold text-lg text-ns-black">
          Parce que vous avez lu
        </h2>
        {lastTitle && (
          <span className="text-sm text-neutral-400 font-sans truncate max-w-xs" title={lastTitle}>
            « {lastTitle} »
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
