// Convert Grok's dual-content JSON format to ContentBlocks format
import type { ContentBlock, RichText, TextRun } from "@/types/content";

export type GrokulJSON = {
  metadata: {
    title: string;
    summary: string;
    readingTimeMin: number;
    wordCount: number;
    slug?: string;
    seoAlt?: string;
    ogImageUrl?: string;
  };
  simplified: {
    intro: string;
    body: Array<{
      section: string;
      content?: string;
      blocks?: Array<GrokulBlock>;
    }>;
    conclusion: string;
  };
  scientific: {
    intro: string;
    body: Array<{
      section: string;
      content?: string;
      blocks?: Array<GrokulBlock>;
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
  sources?: Array<{
    label: string;
    url: string;
    authors: string;
    year: number;
  }>;
};

export type GrokulBlock = 
  | { type: "paragraph"; content: string }
  | { type: "quote"; content: string }
  | { type: "divider" }
  | { type: "image"; url: string; caption: string; alt: string };

// Convert plain text to RichText format (TextRun[])
function stringToRichText(text: string): RichText {
  return [{ text } as TextRun];
}

/**
 * Convert Grok's dual-content format to ContentBlocks
 * Handles both old format (intro/body/conclusion strings)
 * and new format (blocks with images, quotes, dividers)
 */
export function convertGrokulToBlocks(data: GrokulJSON, version: "simplified" | "scientific"): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let blockId = 1;
  
  const section = version === "simplified" ? data.simplified : data.scientific;
  
  // Intro as paragraphs (split by double newlines)
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
    
    // If blocks are provided, use those (new format)
    if (sec.blocks && sec.blocks.length > 0) {
      sec.blocks.forEach(block => {
        if (block.type === "paragraph") {
          blocks.push({
            id: `block-${blockId++}`,
            type: "paragraph",
            content: stringToRichText(block.content)
          } as unknown as ContentBlock);
        } else if (block.type === "quote") {
          blocks.push({
            id: `block-${blockId++}`,
            type: "quote",
            content: block.content
          } as unknown as ContentBlock);
        } else if (block.type === "image") {
          blocks.push({
            id: `block-${blockId++}`,
            type: "image",
            url: block.url,
            caption: block.caption,
            alt: block.alt,
            credit: undefined,
            creditLink: undefined,
            license: undefined
          } as unknown as ContentBlock);
        } else if (block.type === "divider") {
          blocks.push({
            id: `block-${blockId++}`,
            type: "divider"
          } as unknown as ContentBlock);
        }
      });
    } else if (sec.content) {
      // Fallback: old format with just content string
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
