import type { Metadata } from "next";
import { FlaskConical, FileSearch, Quote, BarChart3, ShieldCheck, Mail } from "lucide-react";
import { SITE_URL, SITE_NAME } from "@/lib/config";

const description =
  "Laboratoires, institutions, chercheurs : comment travailler avec Neural Space — proposition de sujets, embargos, relecture des citations.";

export const metadata: Metadata = {
  title: "Espace labos & presse",
  description,
  alternates: { canonical: `${SITE_URL}/labos` },
  openGraph: {
    title: `Espace labos & presse — ${SITE_NAME}`,
    description,
    url: `${SITE_URL}/labos`,
    type: "website",
  },
};

const COMMITMENTS = [
  {
    icon: FileSearch,
    title: "Vos travaux, à la source",
    body: "Nous travaillons à partir de la publication originale (DOI), pas du communiqué seul. Les préprints sont signalés comme tels.",
  },
  {
    icon: Quote,
    title: "Relecture des citations",
    body: "Les chercheur·euse·s interviewé·e·s relisent leurs citations avant publication. L'exactitude scientifique passe avant le calendrier.",
  },
  {
    icon: ShieldCheck,
    title: "Embargos respectés",
    body: "Communiqués sous embargo traités selon vos dates, sans exception. Dites-nous simplement la date et l'heure de levée.",
  },
  {
    icon: BarChart3,
    title: "Des retours mesurables",
    body: "Pour les collaborations suivies, nous partageons les métriques de lecture de vos sujets : audience, temps de lecture, complétion.",
  },
];

export default function LabosPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="flex items-center gap-3 mb-2">
        <FlaskConical className="w-6 h-6 text-ns-blue" strokeWidth={1.75} />
        <h1 className="font-heading font-black text-3xl text-ns-black">Espace labos &amp; presse</h1>
      </div>
      <p className="text-sm text-neutral-400 font-sans mb-12">
        Laboratoires, institutions, chercheur·euse·s — voici comment nous travaillons avec vous.
      </p>

      <div className="space-y-12 font-sans text-neutral-700">

        {/* Proposer */}
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-ns-black">Proposer un sujet</h2>
          <p className="text-sm leading-7">
            Une publication à paraître, un résultat marquant, une expérience à raconter ?
            Écrivez-nous avec le DOI (ou le préprint), la date d&apos;embargo éventuelle et un
            contact scientifique. Nous répondons à toutes les propositions sérieuses, y compris
            quand la réponse est non.
          </p>
          <a
            href="mailto:contact@neuralspace.fr?subject=Proposition%20de%20sujet"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ns-blue text-white text-sm font-sans font-semibold hover:opacity-90 transition-opacity"
          >
            <Mail className="w-4 h-4" strokeWidth={2} />
            contact@neuralspace.fr
          </a>
        </section>

        {/* Commitments */}
        <section className="space-y-4">
          <h2 className="font-heading font-bold text-lg text-ns-black">Nos engagements de travail</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COMMITMENTS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-neutral-100 bg-white p-5 space-y-2">
                <Icon className="w-5 h-5 text-ns-blue" strokeWidth={1.75} />
                <p className="font-heading font-semibold text-sm text-ns-black">{title}</p>
                <p className="text-xs text-neutral-500 leading-5">{body}</p>
              </div>
            ))}
          </div>
          <p className="text-sm leading-6">
            Le détail de nos pratiques (corrections publiques, indépendance, usage des outils) est
            dans la <a href="/charte" className="text-ns-blue underline underline-offset-2">charte éditoriale</a>.
          </p>
        </section>

        {/* Pourquoi */}
        <section className="space-y-3">
          <h2 className="font-heading font-bold text-lg text-ns-black">Pourquoi Neural Space</h2>
          <p className="text-sm leading-7">
            Chaque article existe en <strong className="text-ns-black">double niveau de lecture</strong> :
            une version accessible au grand public et une version scientifique plus dense. Vos
            travaux touchent les deux audiences sans être déformés pour l&apos;une ni inaccessibles
            pour l&apos;autre. À venir : des pages institution dédiées (présentation, articles liés,
            chercheurs affiliés) et <strong className="text-ns-black">NeuralLab</strong>, notre
            bibliothèque open source de modèles d&apos;IA construite avec des laboratoires partenaires.
          </p>
        </section>

      </div>
    </div>
  );
}
