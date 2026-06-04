import { codeToHtml } from "shiki";
import katex from "katex";
import type { ContentBlock } from "@/types/content";
import { RichTextRenderer } from "./TextRunRenderer";

async function renderBlock(block: ContentBlock): Promise<React.ReactNode> {
  switch (block.type) {
    case "heading":
      return (
        <h1 key={block.id} className="text-4xl font-bold tracking-tight text-ns-black">
          {block.content}
        </h1>
      );

    case "subheading":
      const Tag = block.level === 2 ? "h2" : "h3";
      const sizeClass = block.level === 2 ? "text-2xl" : "text-xl";
      return (
        <Tag
          key={block.id}
          id={block.anchor}
          className={`${sizeClass} font-semibold tracking-tight text-ns-black scroll-mt-24`}
        >
          {block.content}
        </Tag>
      );

    case "paragraph":
      return (
        <p key={block.id} className="leading-8 text-[17px] text-neutral-800">
          <RichTextRenderer content={block.content} />
        </p>
      );

    case "quote":
      return (
        <blockquote
          key={block.id}
          className="border-l-4 border-ns-blue pl-6 py-1 my-2"
        >
          <p className="text-lg italic text-neutral-700">{block.content}</p>
          {block.attribution && (
            <cite className="block mt-2 text-sm text-neutral-500 not-italic">
              — {block.attribution}
            </cite>
          )}
        </blockquote>
      );

    case "bullet-list":
      return (
        <ul key={block.id} className="space-y-2 list-none pl-0">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[17px] leading-7 text-neutral-800">
              <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-ns-blue shrink-0" />
              <span><RichTextRenderer content={item} /></span>
            </li>
          ))}
        </ul>
      );

    case "key-takeaways":
      return (
        <div key={block.id} className="rounded-2xl bg-ns-blue/5 border border-ns-blue/20 p-6 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-ns-blue">
            À retenir
          </p>
          <ul className="space-y-2">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-3 text-[15px] text-neutral-800">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-ns-blue shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      );

    case "callout": {
      const styles = {
        "key-concept": {
          label: "Concept clé",
          bg: "bg-ns-blue/5 border-ns-blue/20",
          text: "text-ns-blue",
        },
        warning: {
          label: "Attention",
          bg: "bg-amber-50 border-amber-200",
          text: "text-amber-700",
        },
        anecdote: {
          label: "Anecdote",
          bg: "bg-neutral-50 border-neutral-200",
          text: "text-neutral-600",
        },
      };
      const s = styles[block.variant];
      return (
        <div key={block.id} className={`rounded-2xl border p-6 space-y-2 ${s.bg}`}>
          <p className={`text-xs font-semibold uppercase tracking-widest ${s.text}`}>
            {block.title ?? s.label}
          </p>
          <div className="text-[15px] leading-7 text-neutral-800">
            <RichTextRenderer content={block.content} />
          </div>
        </div>
      );
    }

    case "equation": {
      const html = katex.renderToString(block.latex, {
        displayMode: true,
        throwOnError: false,
        output: "html",
      });
      return (
        <div
          key={block.id}
          className="overflow-x-auto py-4 text-center"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    case "code": {
      const highlighted = await codeToHtml(block.content, {
        lang: block.language,
        theme: "xcode",
      });
      return (
        <div key={block.id} className="rounded-xl overflow-hidden text-sm">
          {block.filename && (
            <div className="bg-neutral-100 px-4 py-2 text-xs text-neutral-500 font-mono border-b border-neutral-200">
              {block.filename}
            </div>
          )}
          <div
            className="[&>pre]:p-5 [&>pre]:overflow-x-auto [&>pre]:m-0"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </div>
      );
    }

    case "image":
      return (
        <figure key={block.id} className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.url}
            alt={block.alt}
            className="w-full rounded-xl object-cover"
          />
          {block.caption && (
            <figcaption className="text-center text-sm text-neutral-500">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "video": {
      const src =
        block.provider === "youtube"
          ? `https://www.youtube-nocookie.com/embed/${block.videoId}`
          : `https://player.vimeo.com/video/${block.videoId}`;
      return (
        <figure key={block.id} className="space-y-3">
          <div className="relative aspect-video rounded-xl overflow-hidden">
            <iframe
              src={src}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={block.caption ?? "Vidéo"}
            />
          </div>
          {block.caption && (
            <figcaption className="text-center text-sm text-neutral-500">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case "divider":
      return <hr key={block.id} className="border-neutral-200" />;
  }
}

export async function ArticleRenderer({ blocks }: { blocks: ContentBlock[] }) {
  const rendered = await Promise.all(blocks.map(renderBlock));
  return <div className="space-y-8">{rendered}</div>;
}
