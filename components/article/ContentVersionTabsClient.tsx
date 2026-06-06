"use client";

import { useState, ReactNode } from "react";
import { BookOpen, Microscope } from "lucide-react";

export function ContentVersionTabsClient({
  hasScientific,
  children,
}: {
  hasScientific: boolean;
  children: ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<"simplified" | "scientific">("simplified");

  return (
    <>
      {/* Tabs */}
      {hasScientific && (
        <div className="flex gap-2 mb-8 border-b border-neutral-200 -mx-4 md:-mx-6 px-4 md:px-6">
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
        </div>
      )}

      {/* Content */}
      {Array.isArray(children) ? (
        children.find((child: any) => child?.props?.["data-version"] === activeTab)
      ) : (
        children
      )}
    </>
  );
}
