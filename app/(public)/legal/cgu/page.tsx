import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description: "Conditions générales d'utilisation de Neural Space.",
  robots: { index: false },
};

export default function CGUPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-heading font-black text-3xl text-ns-black mb-2">
        Conditions Générales d&apos;Utilisation
      </h1>
      <p className="text-sm text-neutral-400 font-sans mb-12">Dernière mise à jour : juin 2026</p>
      <div className="prose prose-neutral max-w-none font-sans text-neutral-700 space-y-6">
        <p className="text-neutral-400 italic">
          Ce document est en cours de rédaction. Les CGU complètes seront publiées prochainement.
        </p>
      </div>
    </div>
  );
}
