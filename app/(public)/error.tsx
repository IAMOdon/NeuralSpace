"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-32 flex flex-col items-center gap-6 text-center">
      <p className="font-heading font-black text-5xl text-ns-blue">!</p>
      <h2 className="font-heading font-bold text-2xl text-ns-black">
        Une erreur est survenue
      </h2>
      <p className="text-neutral-500 font-sans max-w-sm">
        Quelque chose s&apos;est mal passé. L&apos;équipe en a été informée.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="text-sm font-sans font-semibold px-4 py-2 rounded-full bg-ns-blue text-white hover:opacity-80 transition-opacity"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="text-sm font-sans font-semibold px-4 py-2 rounded-full border border-neutral-200 text-ns-black hover:border-ns-blue hover:text-ns-blue transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
