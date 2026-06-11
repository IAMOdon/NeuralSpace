import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de Neural Space.",
  robots: { index: false },
  alternates: { canonical: `${SITE_URL}/legal/mentions-legales` },
};

export default function MentionsLegalesPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-heading font-black text-3xl text-ns-black mb-2">
        Mentions légales
      </h1>
      <p className="text-sm text-neutral-400 font-sans mb-12">Dernière mise à jour : juin 2026</p>
      <div className="space-y-8 font-sans text-neutral-700">
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-ns-black">Éditeur du site</h2>
          <p className="text-sm leading-6">
            <strong className="text-ns-black">{SITE_NAME}</strong><br />
            Site web : <a href={SITE_URL} className="text-ns-blue underline underline-offset-2">{SITE_URL}</a><br />
            {/* TODO: ajouter adresse, SIRET si applicable */}
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-ns-black">Directeur de la publication</h2>
          <p className="text-sm leading-6">
            {/* TODO: nom du directeur de publication */}
            Armand Wegnez
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-ns-black">Contact</h2>
          <p className="text-sm leading-6">
            Pour toute question, y compris l&apos;exercice de vos droits sur vos données personnelles :{" "}
            <a href="mailto:contact@neuralspace.fr" className="text-ns-blue underline underline-offset-2">
              contact@neuralspace.fr
            </a>
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-ns-black">Hébergement</h2>
          <p className="text-sm leading-6">
            Ce site est hébergé par <strong>Vercel Inc.</strong>, 340 Pine Street Suite 701, San Francisco, CA 94104, États-Unis.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-ns-black">Propriété intellectuelle</h2>
          <p className="text-sm leading-6">
            L&apos;ensemble du contenu de ce site (textes, images, graphismes, logo) est la propriété exclusive de {SITE_NAME},
            sauf mention contraire. Toute reproduction, même partielle, est interdite sans autorisation préalable.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-ns-black">Limitation de responsabilité</h2>
          <p className="text-sm leading-6">
            Le contenu de Neural Space est fourni à titre informatif et éducatif uniquement.
            Neural Space ne saurait être tenu responsable d&apos;erreurs ou d&apos;omissions dans les contenus publiés.
          </p>
        </section>
      </div>
    </div>
  );
}
