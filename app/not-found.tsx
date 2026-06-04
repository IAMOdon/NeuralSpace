import Link from "next/link";
import { Nav } from "@/components/ui/Nav";

export default function NotFound() {
  return (
    <>
      <Nav />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-6 py-32">
        <p className="font-heading font-black text-8xl text-ns-blue">404</p>
        <h1 className="font-heading font-bold text-2xl text-ns-black">
          Page introuvable
        </h1>
        <p className="text-neutral-500 font-sans max-w-sm">
          Cet article n&apos;existe pas ou a été déplacé.
        </p>
        <Link
          href="/"
          className="text-sm font-sans font-semibold px-5 py-2.5 rounded-full bg-ns-blue text-white hover:opacity-80 transition-opacity"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </>
  );
}
