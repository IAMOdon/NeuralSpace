import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/config";

const description =
  "La charte éditoriale de Neural Space : sources primaires, préprints signalés, relecture des citations, corrections publiques, indépendance.";

export const metadata: Metadata = {
  title: "Charte éditoriale",
  description,
  alternates: { canonical: `${SITE_URL}/charte` },
  openGraph: {
    title: `Charte éditoriale — ${SITE_NAME}`,
    description,
    url: `${SITE_URL}/charte`,
    type: "website",
  },
};

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading font-bold text-lg text-ns-black">
        <span className="text-ns-blue mr-2">{n}.</span>{title}
      </h2>
      {children}
    </section>
  );
}

export default function ChartePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-heading font-black text-3xl text-ns-black mb-2">Charte éditoriale</h1>
      <p className="text-sm text-neutral-400 font-sans mb-12">
        Nos engagements, vérifiables sur chaque article. Dernière mise à jour : juin 2026.
      </p>

      <div className="space-y-10 font-sans text-neutral-700">

        <Section n={1} title="Sources primaires d'abord">
          <p className="text-sm leading-7">
            Chaque affirmation scientifique renvoie à la publication originale — identifiée par son
            DOI quand il existe — plutôt qu&apos;à sa couverture médiatique. Le journal, l&apos;année et
            les auteurs sont nommés. Les sources sont listées sur chaque article.
          </p>
        </Section>

        <Section n={2} title="Les préprints sont signalés">
          <p className="text-sm leading-7">
            Un résultat issu d&apos;un préprint (arXiv, bioRxiv, medRxiv…) n&apos;a pas encore été évalué
            par les pairs. Nous l&apos;indiquons explicitement par un badge « Préprint » sur la source,
            et le traitement éditorial en tient compte.
          </p>
        </Section>

        <Section n={3} title="Les limites sont dites">
          <p className="text-sm leading-7">
            Taille d&apos;échantillon, portée réelle, financements de l&apos;étude : quand une limite
            est pertinente, elle figure dans un encadré « Limites de l&apos;étude » — pas en note de
            bas de page.
          </p>
        </Section>

        <Section n={4} title="Relecture des citations">
          <p className="text-sm leading-7">
            Les chercheur·euse·s interviewé·e·s peuvent relire leurs citations avant publication,
            pour en vérifier l&apos;exactitude scientifique. Cette relecture porte sur leurs propos,
            pas sur l&apos;angle de l&apos;article, qui reste de notre responsabilité.
          </p>
        </Section>

        <Section n={5} title="Embargos respectés">
          <p className="text-sm leading-7">
            Nous respectons les embargos des journaux scientifiques et des institutions, sans
            exception.
          </p>
        </Section>

        <Section n={6} title="Erreurs corrigées, publiquement">
          <p className="text-sm leading-7">
            Tout lecteur peut signaler une erreur depuis l&apos;article (« Signaler une erreur »).
            Chaque signalement est examiné par la rédaction. Une erreur avérée est corrigée et la
            correction est documentée sous l&apos;article — datée, visible, permanente. Nous ne
            corrigeons jamais silencieusement une erreur substantielle.
          </p>
        </Section>

        <Section n={7} title="Indépendance et transparence commerciale">
          <p className="text-sm leading-7">
            Les contenus sponsorisés sont explicitement étiquetés sur l&apos;article. Aucun sponsor
            n&apos;influence le traitement éditorial des autres contenus. Nous n&apos;affichons pas de
            publicité programmatique et ne vendons pas de données.
          </p>
        </Section>

        <Section n={8} title="Outils d'IA : assistance, pas substitution">
          <p className="text-sm leading-7">
            Nous utilisons des outils d&apos;intelligence artificielle comme assistance à la
            rédaction et à la mise en forme. Chaque article est relu, vérifié et validé
            humainement avant publication — la responsabilité éditoriale est toujours humaine,
            et les sources sont toujours vérifiées contre les publications originales.
          </p>
        </Section>

        <Section n={9} title="Droit de réponse">
          <p className="text-sm leading-7">
            Toute personne ou institution citée peut exercer un droit de réponse en écrivant à{" "}
            <a href="mailto:contact@neuralspace.fr" className="text-ns-blue underline underline-offset-2">
              contact@neuralspace.fr
            </a>
            . Les demandes sont traitées sous 7 jours.
          </p>
        </Section>

      </div>
    </div>
  );
}
