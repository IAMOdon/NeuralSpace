"use client";

import { useEffect, useRef } from "react";
import { getConsent, getOrCreateSession, addToReadHistory, updateInterest } from "@/lib/cookies";

type Props = {
  articleId: string;
  slug: string;
  title: string;
  categoryId: string;
  categorySlug: string;
  tagIds?: string[];
  wordCount: number;
};

export function ArticleTracker({ articleId, slug, title, categoryId, categorySlug, tagIds, wordCount }: Props) {
  const activeTimeRef = useRef(0);
  const lastActiveRef = useRef<number | null>(Date.now());
  const maxScrollRef = useRef(0);
  const wordLookupsRef = useRef(0);
  const sourceClicksRef = useRef(0);
  const sentRef = useRef(false);

  useEffect(() => {
    const consent = getConsent();
    // Session only created when user has accepted cookies
    const session = consent === "accepted" ? getOrCreateSession() : null;

    // view event — no consent needed, no session_id (purely aggregate)
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "view", articleId }),
      keepalive: true,
    }).catch(() => {});

    if (consent === "accepted") {
      addToReadHistory({ slug, title, categorySlug });
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (lastActiveRef.current !== null) {
          activeTimeRef.current += (Date.now() - lastActiveRef.current) / 1000;
          lastActiveRef.current = null;
        }
      } else {
        lastActiveRef.current = Date.now();
      }
    };

    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      const pct = Math.min(100, Math.round((scrolled / total) * 100));
      if (pct > maxScrollRef.current) maxScrollRef.current = pct;
    };

    const onWordLookup = () => { wordLookupsRef.current += 1; };
    const onSourceClick = () => { sourceClicksRef.current += 1; };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("ns:word-lookup" as keyof WindowEventMap, onWordLookup);
    window.addEventListener("ns:source-click" as keyof WindowEventMap, onSourceClick);

    const sendWatch = () => {
      if (sentRef.current || consent !== "accepted" || !session) return;
      sentRef.current = true;

      if (lastActiveRef.current !== null) {
        activeTimeRef.current += (Date.now() - lastActiveRef.current) / 1000;
      }

      const payload = JSON.stringify({
        type: "watch",
        articleId,
        sessionId: session,
        durationSec: Math.round(activeTimeRef.current),
        scrollDepth: maxScrollRef.current,
        readCompleted: maxScrollRef.current >= 80,
        wordLookups: wordLookupsRef.current,
        sourceClicks: sourceClicksRef.current,
        device: "desktop",
        referrerSource: "direct",
        articleFormat: wordCount < 600 ? "short" : "long",
        categoryId,
        tagIds: tagIds ?? [],
      });

      updateInterest(categorySlug, maxScrollRef.current >= 80);
      navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
    };

    window.addEventListener("beforeunload", sendWatch);
    // SPA navigation fallback — also fires on unmount
    const timer = setTimeout(sendWatch, 8 * 60 * 1000);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("ns:word-lookup" as keyof WindowEventMap, onWordLookup);
      window.removeEventListener("ns:source-click" as keyof WindowEventMap, onSourceClick);
      window.removeEventListener("beforeunload", sendWatch);
      clearTimeout(timer);
      sendWatch();
    };
  }, [articleId, slug, title, categoryId, tagIds, wordCount]);

  return null;
}
