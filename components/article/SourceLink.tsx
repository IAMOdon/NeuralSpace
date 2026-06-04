"use client";

export function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  function handleClick() {
    window.dispatchEvent(new Event("ns:source-click"));
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="text-ns-blue underline underline-offset-2 hover:opacity-70 transition-opacity"
    >
      {children}
    </a>
  );
}
