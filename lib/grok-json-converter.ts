// Convert Grok's dual-content JSON format to ContentBlocks format
import type { ContentBlock, RichText, TextRun } from "@/types/content";

export type GrokulJSON = {
  metadata: {
    title: string;
    summary: string;
    readingTimeMin: number;
    wordCount: number;
  };
  simplified: {
    intro: string;
    body: Array<{
      section: string;
      content: string;
      subSections?: Array<{ title: string; content: string }>;
    }>;
    conclusion: string;
  };
  scientific: {
    intro: string;
    body: Array<{
      section: string;
      content: string;
      subSections?: Array<{ title: string; content: string }>;
    }>;
    conclusion: string;
    bibliography: Array<{
      authors: string;
      year: number;
      title: string;
      journal: string;
      doi: string;
    }>;
  };
};

// Convert plain text to RichText format (TextRun[])
function stringToRichText(text: string): RichText {
  return [{ text } as TextRun];
}

/**
 * Convert Grok's dual-content format to ContentBlocks
 */
export function convertGrokulToBlocks(data: GrokulJSON, version: "simplified" | "scientific"): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let blockId = 1;
  
  const section = version === "simplified" ? data.simplified : data.scientific;
  
  // Intro as paragraphs
  const introParagraphs = section.intro.split("\n\n").filter(p => p.trim());
  introParagraphs.forEach(para => {
    if (para.trim()) {
      blocks.push({
        id: `block-${blockId++}`,
        type: "paragraph",
        content: stringToRichText(para.trim())
      } as unknown as ContentBlock);
    }
  });
  
  // Body sections
  section.body.forEach(sec => {
    // Section heading
    blocks.push({
      id: `block-${blockId++}`,
      type: "heading",
      content: sec.section
    } as unknown as ContentBlock);
    
    // Section content paragraphs
    const contentParagraphs = sec.content.split("\n\n").filter(p => p.trim());
    contentParagraphs.forEach(para => {
      if (para.trim()) {
        blocks.push({
          id: `block-${blockId++}`,
          type: "paragraph",
          content: stringToRichText(para.trim())
        } as unknown as ContentBlock);
      }
    });
    
    // Subsections if any
    if (sec.subSections && sec.subSections.length > 0) {
      sec.subSections.forEach(sub => {
        blocks.push({
          id: `block-${blockId++}`,
          type: "subheading",
          level: 2,
          content: sub.title,
          anchor: sub.title.toLowerCase().replace(/\s+/g, "-")
        } as unknown as ContentBlock);
        
        const subParagraphs = sub.content.split("\n\n").filter(p => p.trim());
        subParagraphs.forEach(para => {
          if (para.trim()) {
            blocks.push({
              id: `block-${blockId++}`,
              type: "paragraph",
              content: stringToRichText(para.trim())
            } as unknown as ContentBlock);
          }
        });
      });
    }
  });
  
  // Conclusion
  const conclusionParagraphs = section.conclusion.split("\n\n").filter(p => p.trim());
  conclusionParagraphs.forEach(para => {
    if (para.trim()) {
      blocks.push({
        id: `block-${blockId++}`,
        type: "paragraph",
        content: stringToRichText(para.trim())
      } as unknown as ContentBlock);
    }
  });
  
  // Bibliography for scientific version
  if (version === "scientific" && "bibliography" in section && (section as any).bibliography && (section as any).bibliography.length > 0) {
    blocks.push({
      id: `block-${blockId++}`,
      type: "heading",
      content: "Bibliographie"
    } as unknown as ContentBlock);
    
    (section as any).bibliography.forEach((ref: any) => {
      const citation = `${ref.authors} (${ref.year}). "${ref.title}." ${ref.journal}${ref.doi ? `. https://doi.org/${ref.doi}` : ""}`;
      blocks.push({
        id: `block-${blockId++}`,
        type: "paragraph",
        content: stringToRichText(citation)
      } as unknown as ContentBlock);
    });
  }
  
  return blocks;
}

/**
 * Detect if JSON is in Grok format
 */
export function isGrokulFormat(parsed: any): boolean {
  return (
    parsed.metadata &&
    parsed.simplified &&
    parsed.scientific &&
    parsed.simplified.intro &&
    parsed.simplified.body &&
    parsed.simplified.conclusion
  );
}
