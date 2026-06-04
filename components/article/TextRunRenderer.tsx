import katex from "katex";
import type { RichText, TextRun } from "@/types/content";

function TextRunRenderer({ run }: { run: TextRun }) {
  let node: React.ReactNode;

  if (run.inlineLatex) {
    const html = katex.renderToString(run.inlineLatex, {
      throwOnError: false,
      output: "html",
    });
    node = <span dangerouslySetInnerHTML={{ __html: html }} />;
  } else {
    node = run.text;
  }

  if (run.marks?.includes("bold")) node = <strong className="font-semibold">{node}</strong>;
  if (run.marks?.includes("underline")) node = <span className="underline underline-offset-2">{node}</span>;
  if (run.marks?.includes("strikethrough")) node = <s>{node}</s>;

  if (run.link) {
    return (
      <a
        href={run.link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-ns-blue underline underline-offset-2 hover:opacity-70 transition-opacity"
      >
        {run.link.label ? run.link.label : node}
      </a>
    );
  }

  if (run.citation !== undefined) {
    return (
      <>
        {node}
        <sup className="text-ns-blue text-xs ml-0.5 cursor-pointer hover:opacity-70">
          [{run.citation + 1}]
        </sup>
      </>
    );
  }

  return <>{node}</>;
}

export function RichTextRenderer({ content }: { content: RichText }) {
  return (
    <>
      {content.map((run, i) => (
        <TextRunRenderer key={i} run={run} />
      ))}
    </>
  );
}
