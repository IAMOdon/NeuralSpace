import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité et traitement des données personnelles de Neural Space.",
  robots: { index: false },
  alternates: { canonical: `${SITE_URL}/legal/confidentialite` },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading font-bold text-lg text-ns-black">{title}</h2>
      {children}
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-heading font-black text-3xl text-ns-black mb-2">
        Politique de confidentialité
      </h1>
      <p className="text-sm text-neutral-400 font-sans mb-12">Dernière mise à jour : juin 2026</p>
      <div className="space-y-8 font-sans text-neutral-700">

        <Section title="1. Qui sommes-nous">
          <p className="text-sm leading-6">
            Neural Space est un média scientifique édité par la personne désignée dans les{" "}
            <a href="/legal/mentions-legales" className="text-ns-blue underline underline-offset-2">mentions légales</a>,
            qui agit en qualité de responsable du traitement des données décrites ci-dessous.
          </p>
        </Section>

        <Section title="2. Données de lecture et mesure d'audience">
          <p className="text-sm leading-6">
            Deux niveaux de collecte existent, détaillés dans notre{" "}
            <a href="/legal/cookies" className="text-ns-blue underline underline-offset-2">politique de cookies</a> :
          </p>
          <ul className="space-y-2 text-sm leading-6">
            <li className="flex gap-3">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0" />
              <span>
                <strong>Sans consentement</strong> (mesure d&apos;audience exemptée) : compteur de vues
                agrégé par article, source de visite, type d&apos;appareil, code pays déduit du réseau,
                heure de visite. Aucun identifiant, aucune adresse IP stockée, aucun suivi individuel.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-ns-blue shrink-0" />
              <span>
                <strong>Avec votre consentement</strong> : statistiques de lecture (temps actif,
                profondeur de scroll, lookups dictionnaire) rattachées à un identifiant de session
                aléatoire (UUID) sans lien avec votre identité, plus un historique local de lecture
                dans votre navigateur. Révocable à tout moment via « Gérer mes cookies » — la
                révocation supprime le cookie de session et les données locales.
              </span>
            </li>
          </ul>
        </Section>

        <Section title="3. Newsletter">
          <p className="text-sm leading-6">
            Si vous inscrivez votre adresse e-mail à la newsletter, nous enregistrons : l&apos;adresse
            e-mail, la date d&apos;inscription, la source du formulaire, le navigateur utilisé
            (User-Agent) et le code pays — ces deux derniers à des fins de lutte contre les
            inscriptions abusives. Base légale : votre consentement (inscription volontaire).
          </p>
          <p className="text-sm leading-6">
            Chaque e-mail contient un <strong>lien de désinscription en un clic</strong>. Après
            désinscription, votre adresse est conservée uniquement comme preuve de votre opposition
            (liste de suppression) ; vous pouvez en demander l&apos;effacement complet par e-mail.
          </p>
        </Section>

        <Section title="4. Liste d'attente Coherence">
          <p className="text-sm leading-6">
            L&apos;inscription à la liste d&apos;attente du produit Coherence collecte les mêmes données
            que la newsletter (e-mail, date, source, User-Agent, pays), dans le seul but de vous
            contacter au lancement du produit. Base légale : votre consentement.
          </p>
        </Section>

        <Section title="5. Sous-traitants et hébergement">
          <p className="text-sm leading-6">
            Les données sont traitées par les prestataires suivants, agissant comme sous-traitants :
          </p>
          <ul className="space-y-2 text-sm leading-6">
            {[
              ["Supabase", "base de données et authentification — hébergement dans l'Union européenne (région eu-central-1)"],
              ["Vercel", "hébergement du site et réseau de diffusion"],
              ["Cloudinary", "hébergement et optimisation des images"],
              ["Resend", "acheminement des e-mails de la newsletter (adresse e-mail uniquement, au moment de l'envoi)"],
            ].map(([name, role]) => (
              <li key={name} className="flex gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-ns-blue shrink-0" />
                <span><strong>{name}</strong> — {role}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm leading-6">
            Aucune donnée n&apos;est vendue ni partagée avec des tiers à des fins publicitaires.
          </p>
        </Section>

        <Section title="6. Durées de conservation">
          <ul className="space-y-2 text-sm leading-6">
            {[
              "Données de mesure d'audience et statistiques de lecture : 25 mois maximum, puis suppression ou agrégation définitive",
              "Cookie de consentement et identifiant de session : 13 mois maximum côté navigateur",
              "Newsletter et liste d'attente : jusqu'à votre désinscription (puis liste de suppression), ou effacement complet sur demande",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-ns-blue shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="7. Vos droits (RGPD)">
          <p className="text-sm leading-6">
            Conformément au Règlement Général sur la Protection des Données, vous disposez d&apos;un
            droit d&apos;accès, de rectification, d&apos;effacement, de limitation et d&apos;opposition au
            traitement de vos données, ainsi que du droit d&apos;introduire une réclamation auprès de
            la CNIL (cnil.fr). Pour exercer ces droits, écrivez-nous à{" "}
            <a href="mailto:contact@neuralspace.fr" className="text-ns-blue underline underline-offset-2">
              contact@neuralspace.fr
            </a>
            . Une réponse vous sera apportée sous 30 jours.
          </p>
        </Section>

        <Section title="8. Cookies">
          <p className="text-sm leading-6">
            Le détail complet des cookies et du stockage local (noms, finalités, durées) et la
            gestion de vos préférences sont décrits dans la{" "}
            <a href="/legal/cookies" className="text-ns-blue underline underline-offset-2">politique de cookies</a>.
          </p>
        </Section>

      </div>
    </div>
  );
}
