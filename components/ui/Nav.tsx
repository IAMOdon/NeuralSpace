import Link from "next/link";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-100 bg-ns-white/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1 group">
          <span className="font-heading font-bold text-lg tracking-widest text-ns-blue uppercase">
            Neural Space
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-ns-blue mb-3 group-hover:scale-125 transition-transform" />
        </Link>

        <nav className="flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-sans text-ns-black hover:text-ns-blue transition-colors"
          >
            Articles
          </Link>
          <Link
            href="/neurallab"
            className="text-sm font-sans text-neutral-400 hover:text-ns-blue transition-colors"
          >
            NeuralLab
            <span className="ml-1.5 text-[10px] font-sans bg-ns-blue/10 text-ns-blue px-1.5 py-0.5 rounded-full">
              Bientôt
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
