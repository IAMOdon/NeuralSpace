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

      <div className="space-y-10 font-sans text-neutral-700">

        {/* Intro */}
        <section className="space-y-3">
          <p className="text-sm leading-6">
            Neural Space utilise des cookies et des technologies de stockage local (localStorage) pour
            améliorer votre expérience de lecture et analyser la façon dont nos contenus sont consommés.
            Aucune donnée personnelle identifiable n&apos;est collectée : nous n&apos;enregistrons ni votre
            nom, ni votre adresse e-mail, ni votre adresse IP.
          </p>
        </section>

        {/* Strictly necessary */}
        <section className="space-y-4">
          <h2 className="font-heading font-bold text-lg text-ns-black">
            Cookies strictement nécessaires
          </h2>
          <p className="text-sm leading-6">
            Ces cookies sont indispensables au fonctionnement du site. Ils ne nécessitent pas votre consentement.
          </p>
          <div className="border border-neutral-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-ns-black w-1/3">Nom</th>
                  <th className="text-left px-4 py-3 font-semibold text-ns-black">Finalité</th>
                  <th className="text-left px-4 py-3 font-semibold text-ns-black w-24">Durée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-ns-blue">ns_consent</td>
                  <td className="px-4 py-3">Mémorise votre choix de consentement aux cookies</td>
                  <td className="px-4 py-3 text-neutral-400">1 an</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Analytics & personalization */}
        <section className="space-y-4">
          <h2 className="font-heading font-bold text-lg text-ns-black">
            Cookies d&apos;analyse et de personnalisation
          </h2>
          <p className="text-sm leading-6">
            Ces cookies et données de stockage local sont déposés uniquement si vous avez accepté.
            Ils permettent de personnaliser votre fil de lecture et d&apos;analyser l&apos;engagement
            éditorial de manière anonyme.
          </p>

          {/* Cookies */}
          <h3 className="font-semibold text-sm text-ns-black mt-2">Cookies</h3>
          <div className="border border-neutral-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-ns-black w-1/3">Nom</th>
                  <th className="text-left px-4 py-3 font-semibold text-ns-black">Finalité</th>
                  <th className="text-left px-4 py-3 font-semibold text-ns-black w-24">Durée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-ns-blue">ns_session</td>
                  <td className="px-4 py-3">
                    Identifiant de session anonyme (UUID aléatoire) utilisé pour associer
                    vos lectures à un profil de lecture anonyme. Ne contient aucune
                    information personnelle identifiable.
                  </td>
                  <td className="px-4 py-3 text-neutral-400">Session</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* localStorage */}
          <h3 className="font-semibold text-sm text-ns-black mt-4">Stockage local (localStorage)</h3>
          <div className="border border-neutral-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-ns-black w-1/3">Clé</th>
                  <th className="text-left px-4 py-3 font-semibold text-ns-black">Finalité</th>
                  <th className="text-left px-4 py-3 font-semibold text-ns-black w-24">Durée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-ns-blue">ns_history</td>
                  <td className="px-4 py-3">
                    Historique local des 10 derniers articles lus (slug, titre, date).
                    Utilisé pour la section « Parce que vous avez lu » dans le fil d&apos;actualité.
                    Stocké uniquement dans votre navigateur, jamais transmis à nos serveurs.
                  </td>
                  <td className="px-4 py-3 text-neutral-400">Persistant</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-ns-blue">ns_interests</td>
                  <td className="px-4 py-3">
                    Scores d&apos;intérêt par thématique scientifique (ex. physique, biologie, IA),
                    calculés à partir de votre comportement de lecture. Utilisé pour personnaliser
                    l&apos;ordre du fil d&apos;actualité. Stocké dans votre navigateur.
                  </td>
                  <td className="px-4 py-3 text-neutral-400">Persistant</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Data collected */}
        <section className="space-y-4">
          <h2 className="font-heading font-bold text-lg text-ns-black">
            Données collectées avec votre consentement
          </h2>
          <p className="text-sm leading-6">
            Si vous acceptez les cookies, les données suivantes sont transmises à nos serveurs
            (hébergés sur Supabase / infrastructure européenne) à chaque fin de lecture :
          </p>
          <ul className="space-y-2 text-sm leading-6">
            {[
              "Temps de lecture actif (en secondes, hors onglet inactif)",
              "Profondeur de scroll maximale atteinte (pourcentage de l'article)",
              "Nombre de mots recherchés dans le dictionnaire intégré",
              "Nombre de clics sur les sources scientifiques citées",
              "Format de l'article (court < 600 mots / long)",
              "Identifiant anonyme de session (UUID aléatoire, aucun lien avec votre identité)",
              "Code pays déduit de l'en-tête réseau Vercel (ex. FR) — l'adresse IP n'est jamais stockée",
              "Type d'appareil (mobile, tablette, ordinateur) déduit du User-Agent",
              "Source de visite (moteur de recherche, réseau social, accès direct)",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-ns-blue shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-sm leading-6">
            Ces données sont utilisées pour construire un <strong>profil de lecture anonyme</strong>{" "}
            (nombre d&apos;articles lus, taux de complétion, thématiques préférées, signal d&apos;expertise)
            et pour alimenter les statistiques éditoriales internes de Neural Space.
            Elles ne sont jamais revendues ni partagées avec des tiers à des fins publicitaires.
          </p>
        </section>

        {/* Data without consent */}
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-ns-black">
            Données collectées sans consentement
          </h2>
          <p className="text-sm leading-6">
            Même en cas de refus des cookies, une <strong>comptabilisation anonyme des vues</strong>{" "}
            est effectuée sur chaque article. Cette mesure est strictement agrégée : elle ne stocke
            aucun identifiant de session, ne permet aucun suivi individuel et est assimilable à un
            compteur de visites. Elle est nécessaire au bon fonctionnement du tri « Populaire » et
            à l&apos;analyse éditoriale minimale.
          </p>
        </section>

        {/* Manage preferences */}
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-ns-black">Gérer vos préférences</h2>
          <p className="text-sm leading-6">
            Vous pouvez modifier votre choix à tout moment en supprimant le cookie{" "}
            <span className="font-mono text-xs text-ns-blue">ns_consent</span> depuis les paramètres
            de votre navigateur — le bandeau de consentement réapparaîtra à votre prochaine visite.
            Vous pouvez également effacer les données de stockage local (
            <span className="font-mono text-xs text-ns-blue">ns_history</span>,{" "}
            <span className="font-mono text-xs text-ns-blue">ns_interests</span>) depuis les outils
            développeur de votre navigateur.
          </p>
          <p className="text-sm leading-6">
            Pour toute question relative à vos données, contactez-nous à{" "}
            <a href="mailto:contact@neuralspace.fr" className="text-ns-blue underline underline-offset-2">
              contact@neuralspace.fr
            </a>
            .
          </p>
        </section>

      </div>
    </div>
  );
}
