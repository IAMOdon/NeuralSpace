"use client";

import { useState } from "react";
import { BookOpen, Microscope } from "lucide-react";
import { BlockEditor } from "./BlockEditor";
import type { ContentBlock } from "@/types/content";

export function DualContentEditor({
  contentSimplified,
  contentScientific,
  onSimplifiedChange,
  onScientificChange,
  hasScientific,
}: {
  contentSimplified: ContentBlock[];
  contentScientific?: ContentBlock[];
  onSimplifiedChange: (blocks: ContentBlock[]) => void;
  onScientificChange: (blocks: ContentBlock[]) => void;
  hasScientific: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"simplified" | "scientific">("simplified");

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab("simplified")}
          className={`flex items-center gap-2 px-4 py-3 font-sans font-medium text-sm transition-colors duration-200 border-b-2 ${
            activeTab === "simplified"
              ? "border-ns-blue text-ns-blue"
              : "border-transparent text-neutral-400 hover:text-neutral-600"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Comprendre simplement
        </button>
        {hasScientific && (
          <button
            onClick={() => setActiveTab("scientific")}
            className={`flex items-center gap-2 px-4 py-3 font-sans font-medium text-sm transition-colors duration-200 border-b-2 ${
              activeTab === "scientific"
                ? "border-ns-blue text-ns-blue"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            }`}
          >
            <Microscope className="w-4 h-4" />
            Version scientifique
          </button>
        )}
      </div>

      {/* Content */}
      {activeTab === "simplified" ? (
        <BlockEditor
          blocks={contentSimplified}
          onChange={onSimplifiedChange}
        />
      ) : (
        <BlockEditor
          blocks={contentScientific || []}
          onChange={onScientificChange}
        />
      )}
    </div>
  );
}
