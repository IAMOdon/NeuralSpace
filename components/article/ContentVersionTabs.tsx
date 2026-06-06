import { Suspense } from "react";
import type { ContentBlock } from "@/types/content";
import { ArticleRenderer } from "./ArticleRenderer";
import { WordLookup } from "./WordLookup";
import { ContentVersionTabsClient } from "./ContentVersionTabsClient";

export function ContentVersionTabs({
  contentSimplified,
  contentScientific,
}: {
  contentSimplified: ContentBlock[];
  contentScientific?: ContentBlock[];
}) {
  const hasScientific = (contentScientific && contentScientific.length > 0) ?? false;

  const simplifiedContent = (
    <WordLookup>
      <Suspense>
        <ArticleRenderer blocks={contentSimplified.filter((b) => b.type !== "heading")} />
      </Suspense>
    </WordLookup>
  );

  const scientificContent = hasScientific && (
    <WordLookup>
      <Suspense>
        <ArticleRenderer blocks={(contentScientific ?? []).filter((b) => b.type !== "heading")} />
      </Suspense>
    </WordLookup>
  );

  return (
    <ContentVersionTabsClient
      hasScientific={hasScientific}
      simplifiedContent={simplifiedContent}
      scientificContent={scientificContent}
    />
  );
}
