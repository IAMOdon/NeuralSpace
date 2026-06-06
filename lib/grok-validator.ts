// Strict validation for Grok JSON output
// Ensures ALL required fields are present with no exceptions

import type { GrokulJSON } from "./grok-json-converter";

export interface ValidationError {
  field: string;
  issue: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  summary: string;
}

export function validateGrokulJSON(data: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Metadata validation
  if (!data.metadata) {
    errors.push({ field: "metadata", issue: "Metadata object missing", severity: "error" });
    return { valid: false, errors, warnings, summary: "CRITICAL: No metadata object" };
  }

  const meta = data.metadata;

  // Required metadata fields
  if (!meta.title || meta.title.trim().length < 5) {
    errors.push({ field: "metadata.title", issue: "Title required (5+ characters)", severity: "error" });
  }
  if (!meta.summary || meta.summary.trim().length < 20) {
    errors.push({ field: "metadata.summary", issue: "Summary required (20+ characters)", severity: "error" });
  }
  if (!meta.readingTimeMin || meta.readingTimeMin < 6 || meta.readingTimeMin > 15) {
    errors.push({ field: "metadata.readingTimeMin", issue: "Reading time must be 6-15 minutes", severity: "error" });
  }
  if (!meta.wordCount || meta.wordCount < 1500 || meta.wordCount > 3000) {
    errors.push({ field: "metadata.wordCount", issue: "Word count must be 1500-3000", severity: "error" });
  }
  if (!meta.slug || !meta.slug.match(/^[a-z0-9-]{3,50}$/)) {
    errors.push({ field: "metadata.slug", issue: "Slug required (lowercase, hyphenated, 3-50 chars)", severity: "error" });
  }
  if (!meta.seoAlt || meta.seoAlt.length < 10 || meta.seoAlt.length > 120) {
    errors.push({ field: "metadata.seoAlt", issue: "SEO alt required (10-120 characters)", severity: "error" });
  }
  if (!meta.ogImageUrl || !meta.ogImageUrl.startsWith("http")) {
    errors.push({ field: "metadata.ogImageUrl", issue: "OG image URL required (must start with http)", severity: "error" });
  }

  // Simplified version validation
  if (!data.simplified) {
    errors.push({ field: "simplified", issue: "Simplified version missing", severity: "error" });
  } else {
    const simp = data.simplified;

    if (!simp.intro || simp.intro.trim().length < 150) {
      errors.push({ field: "simplified.intro", issue: "Intro required (150+ characters)", severity: "error" });
    }

    if (!Array.isArray(simp.body) || simp.body.length < 3) {
      errors.push({ field: "simplified.body", issue: "Body requires minimum 3 sections", severity: "error" });
    } else {
      validateSectionArray(simp.body, "simplified", errors, warnings, 1); // min 1 image
    }

    if (!simp.conclusion || simp.conclusion.trim().length < 150) {
      errors.push({ field: "simplified.conclusion", issue: "Conclusion required (150+ characters)", severity: "error" });
    }
  }

  // Scientific version validation
  if (!data.scientific) {
    errors.push({ field: "scientific", issue: "Scientific version missing", severity: "error" });
  } else {
    const sci = data.scientific;

    if (!sci.intro || sci.intro.trim().length < 200) {
      errors.push({ field: "scientific.intro", issue: "Intro required (200+ characters)", severity: "error" });
    }

    if (!Array.isArray(sci.body) || sci.body.length < 4) {
      errors.push({ field: "scientific.body", issue: "Body requires minimum 4 sections", severity: "error" });
    } else {
      validateSectionArray(sci.body, "scientific", errors, warnings, 2); // min 2 images
    }

    if (!sci.conclusion || sci.conclusion.trim().length < 200) {
      errors.push({ field: "scientific.conclusion", issue: "Conclusion required (200+ characters)", severity: "error" });
    }

    if (!Array.isArray(sci.bibliography) || sci.bibliography.length < 3) {
      errors.push({ field: "scientific.bibliography", issue: "Bibliography requires minimum 3 entries", severity: "error" });
    } else {
      sci.bibliography.forEach((bib: any, i: number) => {
        if (!bib.authors || !bib.year || !bib.title || !bib.journal || !bib.doi) {
          errors.push({
            field: `scientific.bibliography[${i}]`,
            issue: "Bibliography entry missing: authors, year, title, journal, or doi",
            severity: "error",
          });
        }
      });
    }
  }

  // Sources validation
  if (!Array.isArray(data.sources) || data.sources.length < 3) {
    errors.push({ field: "sources", issue: "Sources array requires minimum 3 entries", severity: "error" });
  } else {
    data.sources.forEach((source: any, i: number) => {
      if (!source.label || !source.url || !source.authors || !source.year) {
        errors.push({
          field: `sources[${i}]`,
          issue: "Source entry missing: label, url, authors, or year",
          severity: "error",
        });
      }
    });
  }

  // Duplicate image URL detection across both versions
  const allImageUrls: { url: string; field: string }[] = [];
  for (const [ver, sections] of [["simplified", data.simplified?.body ?? []], ["scientific", data.scientific?.body ?? []]] as [string, any[]][]) {
    sections.forEach((sec: any, sIdx: number) => {
      (sec.blocks ?? []).forEach((block: any, bIdx: number) => {
        if (block.type === "image" && block.url) {
          allImageUrls.push({ url: block.url, field: `${ver}.body[${sIdx}].blocks[${bIdx}]` });
        }
      });
    });
  }
  const seen = new Map<string, string>();
  allImageUrls.forEach(({ url, field }) => {
    if (seen.has(url)) {
      warnings.push({
        field,
        issue: `Duplicate image URL (already used at ${seen.get(url)}) — use unique images per section`,
        severity: "warning",
      });
    } else {
      seen.set(url, field);
    }
  });

  const valid = errors.length === 0;
  const summary = valid
    ? `✓ VALID - All required fields present`
    : `✗ INVALID - ${errors.length} critical errors, ${warnings.length} warnings`;

  return { valid, errors, warnings, summary };
}

function validateSectionArray(
  sections: any[],
  version: string,
  errors: ValidationError[],
  warnings: ValidationError[],
  minImages: number
) {
  let totalImages = 0;
  let totalQuotes = 0;
  let totalDividers = 0;

  sections.forEach((section, sIdx) => {
    if (!section.section || !section.section.trim()) {
      errors.push({
        field: `${version}.body[${sIdx}].section`,
        issue: "Section title required",
        severity: "error",
      });
    }

    if (!Array.isArray(section.blocks) || section.blocks.length < 2) {
      errors.push({
        field: `${version}.body[${sIdx}].blocks`,
        issue: "Section requires minimum 2 blocks",
        severity: "error",
      });
    } else {
      section.blocks.forEach((block: any, bIdx: number) => {
        if (!block.type) {
          errors.push({
            field: `${version}.body[${sIdx}].blocks[${bIdx}].type`,
            issue: "Block type required (paragraph, quote, image, divider)",
            severity: "error",
          });
        }

        if (block.type === "paragraph") {
          if (!block.content || block.content.trim().length < 20) {
            errors.push({
              field: `${version}.body[${sIdx}].blocks[${bIdx}].content`,
              issue: "Paragraph content required (20+ characters)",
              severity: "error",
            });
          }
        } else if (block.type === "quote") {
          totalQuotes++;
          if (!block.content || block.content.trim().length < 10) {
            errors.push({
              field: `${version}.body[${sIdx}].blocks[${bIdx}].content`,
              issue: "Quote content required (10+ characters)",
              severity: "error",
            });
          }
        } else if (block.type === "image") {
          totalImages++;
          if (!block.url || !block.url.startsWith("http")) {
            errors.push({
              field: `${version}.body[${sIdx}].blocks[${bIdx}].url`,
              issue: "Image URL required (must be valid HTTP URL)",
              severity: "error",
            });
          }
          if (!block.caption || block.caption.trim().length < 20) {
            errors.push({
              field: `${version}.body[${sIdx}].blocks[${bIdx}].caption`,
              issue: "Image caption required (20+ characters)",
              severity: "error",
            });
          }
          if (!block.alt || block.alt.trim().length < 10) {
            errors.push({
              field: `${version}.body[${sIdx}].blocks[${bIdx}].alt`,
              issue: "Image alt text required (10+ characters for accessibility)",
              severity: "error",
            });
          }
        } else if (block.type === "divider") {
          totalDividers++;
        } else {
          errors.push({
            field: `${version}.body[${sIdx}].blocks[${bIdx}].type`,
            issue: `Unknown block type: ${block.type}`,
            severity: "error",
          });
        }
      });
    }
  });

  if (totalImages < minImages) {
    errors.push({
      field: `${version}.body`,
      issue: `Requires minimum ${minImages} image blocks, found ${totalImages}`,
      severity: "error",
    });
  }

  if (version === "simplified" && totalQuotes === 0) {
    warnings.push({
      field: `${version}.body`,
      issue: "No quote blocks found (at least 1 recommended)",
      severity: "warning",
    });
  } else if (version === "scientific" && totalQuotes < 2) {
    warnings.push({
      field: `${version}.body`,
      issue: `Only ${totalQuotes} quote block(s) found (minimum 2 recommended for scientific)`,
      severity: "warning",
    });
  }

  if (totalDividers === 0) {
    warnings.push({
      field: `${version}.body`,
      issue: "No divider blocks found (at least 1 recommended for readability)",
      severity: "warning",
    });
  }
}
