import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et traitement des données personnelles de Neural Space.",
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-heading font-black text-3xl text-ns-black mb-2">
        Politique de confidentialité
      </h1>
      <p className="text-sm text-neutral-400 font-sans mb-12">Dernière mise à jour : juin 2026</p>
      <div className="space-y-8 font-sans text-neutral-700">
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-ns-black">1. Données collectées</h2>
          <p className="text-sm leading-6">
            Neural Space collecte uniquement les données strictement nécessaires au fonctionnement du service :
            données de navigation anonymisées (temps de lecture, profondeur de scroll) stockées localement via cookies.
            Aucune donnée personnelle identifiable n&apos;est collectée sans consentement explicite.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-ns-black">2. Finalité du traitement</h2>
          <p className="text-sm leading-6">
            Les données collectées servent exclusivement à améliorer l&apos;expérience de lecture
            (recommandations personnalisées, mémorisation des préférences de catégorie).
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-ns-black">3. Vos droits (RGPD)</h2>
          <p className="text-sm leading-6">
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d&apos;un
            droit d&apos;accès, de rectification, d&apos;effacement et d&apos;opposition au traitement de vos données.
            Pour exercer ces droits, contactez-nous à l&apos;adresse indiquée dans les mentions légales.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-ns-black">4. Cookies</h2>
          <p className="text-sm leading-6">
            Consultez notre <a href="/legal/cookies" className="text-ns-blue underline underline-offset-2">politique de cookies</a> pour
            le détail des cookies utilisés et la gestion de vos préférences.
          </p>
        </section>
      </div>
    </div>
  );
}
