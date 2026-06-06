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

  return (
    <ContentVersionTabsClient hasScientific={hasScientific}>
      <div data-version="simplified">
        <WordLookup>
          <Suspense>
            <ArticleRenderer blocks={contentSimplified.filter((b) => b.type !== "heading")} />
          </Suspense>
        </WordLookup>
      </div>
      {hasScientific && (
        <div data-version="scientific">
          <WordLookup>
            <Suspense>
              <ArticleRenderer blocks={(contentScientific ?? []).filter((b) => b.type !== "heading")} />
            </Suspense>
          </WordLookup>
        </div>
      )}
    </ContentVersionTabsClient>
  );
}
