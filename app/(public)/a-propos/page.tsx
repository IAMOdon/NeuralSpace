import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/config";

const description =
  "Neural Space est un média scientifique indépendant : double niveau de lecture, sources primaires, corrections publiques.";

export const metadata: Metadata = {
  title: "À propos",
  description,
  alternates: { canonical: `${SITE_URL}/a-propos` },
  openGraph: {
    title: `À propos — ${SITE_NAME}`,
    description,
    url: `${SITE_URL}/a-propos`,
    type: "website",
  },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading font-bold text-lg text-ns-black">{title}</h2>
      {children}
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-heading font-black text-3xl text-ns-black mb-2">À propos</h1>
      <p className="text-sm text-neutral-400 font-sans mb-12">
        La science, rendue accessible — sans la trahir.
      </p>

      <div className="space-y-10 font-sans text-neutral-700">

        <Section title="La mission">
          <p className="text-sm leading-7">
            {SITE_NAME} est un média scientifique indépendant. Notre conviction : la rigueur
            scientifique et l&apos;accessibilité ne s&apos;opposent pas. Chaque article est pensé pour
            être lu par tout le monde — et vérifiable par les spécialistes.
          </p>
        </Section>

        <Section title="Notre démarche">
          <ul className="space-y-3 text-sm leading-6">
            {[
              ["Double niveau de lecture", "les articles existent en version simplifiée et en version scientifique — même sujet, deux profondeurs, à vous de choisir."],
              ["Sources primaires", "nous citons les publications originales (DOI) plutôt que leur écho médiatique, et signalons explicitement les préprints non encore évalués par les pairs."],
              ["Limites assumées", "quand une étude a des limites (échantillon, portée, conflits d'intérêts), un encadré dédié le dit."],
              ["Corrections publiques", "toute correction substantielle est documentée, datée, et reste visible sur l'article. Les lecteurs peuvent signaler une erreur en un clic."],
            ].map(([title, body]) => (
              <li key={title} className="flex gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-ns-blue shrink-0" />
                <span><strong className="text-ns-black">{title}</strong> — {body}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm leading-6">
            L&apos;ensemble de nos engagements est détaillé dans la{" "}
            <a href="/charte" className="text-ns-blue underline underline-offset-2">charte éditoriale</a>.
          </p>
        </Section>

        <Section title="Indépendance">
          <p className="text-sm leading-7">
            {SITE_NAME} ne vend pas vos données et n&apos;affiche pas de publicité programmatique.
            Les contenus sponsorisés, lorsqu&apos;il y en a, sont explicitement signalés sur
            l&apos;article — jamais déguisés en contenu éditorial.
          </p>
        </Section>

        <Section title="La suite">
          <p className="text-sm leading-7">
            Le média est la première étape d&apos;un projet plus large : <strong className="text-ns-black">NeuralLab</strong>,
            une bibliothèque open source de modèles d&apos;IA appliqués à la santé, à la biologie et à
            la physique, construite avec des laboratoires partenaires. Chercheur·e ou institution ?{" "}
            <a href="/labos" className="text-ns-blue underline underline-offset-2">L&apos;espace labos</a> vous est dédié.
          </p>
        </Section>

        <Section title="Contact">
          <p className="text-sm leading-7">
            Une question, une remarque, un sujet à proposer :{" "}
            <a href="mailto:contact@neuralspace.fr" className="text-ns-blue underline underline-offset-2">
              contact@neuralspace.fr
            </a>
          </p>
        </Section>

      </div>
    </div>
  );
}
