import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de cookies",
  description: "Politique de gestion des cookies de Neural Space.",
  robots: { index: false },
};

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-heading font-black text-3xl text-ns-black mb-2">
        Politique de cookies
      </h1>
      <p className="text-sm text-neutral-400 font-sans mb-12">Dernière mise à jour : juin 2026</p>
      <div className="space-y-8 font-sans text-neutral-700">
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-ns-black">Cookies utilisés</h2>
          <div className="border border-neutral-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-ns-black">Nom</th>
                  <th className="text-left px-4 py-3 font-semibold text-ns-black">Finalité</th>
                  <th className="text-left px-4 py-3 font-semibold text-ns-black">Durée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-ns-blue">ns_session</td>
                  <td className="px-4 py-3">Identifiant de session anonyme pour les recommandations</td>
                  <td className="px-4 py-3 text-neutral-400">Session</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-ns-blue">ns_history</td>
                  <td className="px-4 py-3">Historique de lecture pour les suggestions personnalisées</td>
                  <td className="px-4 py-3 text-neutral-400">30 jours</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-ns-blue">ns_consent</td>
                  <td className="px-4 py-3">Mémorisation de vos préférences de cookies</td>
                  <td className="px-4 py-3 text-neutral-400">1 an</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-ns-black">Gestion des préférences</h2>
          <p className="text-sm leading-6">
            Vous pouvez à tout moment modifier vos préférences en cliquant sur &quot;Gérer les cookies&quot;
            dans le bandeau de consentement, ou en supprimant les cookies depuis les paramètres de votre navigateur.
          </p>
        </section>
      </div>
    </div>
  );
}
