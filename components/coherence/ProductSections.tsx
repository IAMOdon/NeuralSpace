import {
  GraduationCap, Microscope, Code2, Globe, Scale, Lightbulb, Hand, Eye,
  KeyRound, RefreshCw, ShieldCheck, Apple, Check, ArrowRight,
  Sparkles, MessagesSquare, AudioLines, Layers, PanelTop, NotebookPen,
} from "lucide-react";
import Link from "next/link";
import { Reveal } from "./Reveal";

// ── Ce qui fonctionne déjà — capacités réelles du build, avec leurs raccourcis.
// Source : Coherence/README.md « What works today ». Ancre la promesse « Bientôt »
// dans un produit concret, pas du vaporware — l'honnêteté est la marque.

const SHIPPED = [
  {
    icon: Sparkles,
    title: "L'orbe vivant",
    body: "Présence flottante au cœur fluide, toujours là. Clic pour parler, survol pour le menu, glisser pour le déplacer. Il prend la couleur du profil actif.",
    keys: null,
  },
  {
    icon: Layers,
    title: "Cinq profils auto-détectés",
    body: "Général, Code, Recherche, Apprentissage, Pro — détectés depuis l'app active et l'URL du navigateur, épinglables à la main.",
    keys: null,
  },
  {
    icon: Eye,
    title: "Conscience de l'écran",
    body: "Capture de la fenêtre active, texte exact via l'Accessibilité, OCR de secours et URL — les sources sont choisies selon le profil.",
    keys: null,
  },
  {
    icon: MessagesSquare,
    title: "Chat ancré dans l'écran",
    body: "Réponses en streaming, rendu markdown avec blocs de code, puces de contexte montrant exactement ce que l'IA voit — retirables.",
    keys: "⌘⇧1",
  },
  {
    icon: AudioLines,
    title: "Conversation vocale",
    body: "Reconnaissance vocale en direct, tours rythmés par les silences, réponses parlées conscientes de l'écran, mémoire glissante.",
    keys: "Talk",
  },
  {
    icon: Lightbulb,
    title: "Suggestions en direct",
    body: "Cartes déclenchées par la sélection, prompts adaptés au profil, correctifs de code incrémentaux. Le déclencheur presse-papier reste désactivé par défaut.",
    keys: "⌘⇧O",
  },
  {
    icon: PanelTop,
    title: "Barre réunion",
    body: "Une barre supérieure avec l'orbe vivant, le sélecteur de profil, un panneau de questions conscient de l'écran, notes et assistance au code.",
    keys: "⌘⇧⌥Espace",
  },
  {
    icon: NotebookPen,
    title: "Capture & notes",
    body: "Capture rapide d'une idée, stockage local SQLite avec recherche plein-texte instantanée sur toutes vos notes.",
    keys: "⌘⇧2",
  },
];

export function WorksTodaySection() {
  return (
    <section className="w-full bg-white border-t border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-28">
        <Reveal>
          <div className="max-w-2xl mb-14">
            <p className="text-[11px] font-sans font-bold text-ns-blue uppercase tracking-widest">
              Ce qui fonctionne déjà
            </p>
            <h2 className="mt-3 font-heading font-black text-3xl md:text-4xl text-ns-black tracking-tight leading-tight">
              Pas une promesse. Un produit.
            </h2>
            <p className="mt-4 text-base md:text-lg text-neutral-500 font-sans leading-relaxed">
              Coherence n'est pas en attente d'être inventé : l'app tourne déjà sur macOS. Voici
              ce qu'elle fait aujourd'hui — la liste d'attente ouvre l'accès, elle n'attend pas
              le code.
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-100 rounded-3xl overflow-hidden border border-neutral-100">
          {SHIPPED.map(({ icon: Icon, title, body, keys }, i) => (
            <Reveal key={title} delay={i * 70} className="h-full">
              <div className="group bg-white h-full p-6 md:p-7 space-y-3 hover:bg-neutral-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-ns-blue/10 text-ns-blue transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none">
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </span>
                  {keys && (
                    <kbd className="text-[10px] font-sans font-bold text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-1 rounded-md tracking-wider">
                      {keys}
                    </kbd>
                  )}
                </div>
                <h3 className="font-heading font-bold text-[15px] text-ns-black leading-snug">{title}</h3>
                <p className="text-[13px] text-neutral-500 font-sans leading-relaxed">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// All copy is drawn directly from Coherence/docs/PRODUCT.md (the app repo,
// gitignored here — source of truth for the product). The product
// is pre-launch ("Bientôt"), so download/pricing CTAs route to the waitlist
// rather than a dead DMG link — honest by design, which is the product's brand.

// ── Personas — the four ContextProfiles, verbatim from the product table ──────

const PERSONAS = [
  {
    icon: GraduationCap,
    persona: "Étudiant",
    profile: "Learning",
    day: "Portails de cours, PDF, exercices",
    moment: "Une échéance sur le portail devient une proposition de calendrier avant même d'y penser ; une formule obtient une résolution pas à pas, à la demande.",
  },
  {
    icon: Microscope,
    persona: "Chercheur",
    profile: "Research",
    day: "Papiers, figures, statistiques, LaTeX",
    moment: "Posez une question sur la section méthodes du PDF à l'écran : réponse précise, terminologie exacte, équations intactes.",
  },
  {
    icon: Code2,
    persona: "Développeur",
    profile: "Coding",
    day: "Éditeur + terminal",
    moment: "Une stack trace à l'écran devient un correctif ciblé, avec le code de remplacement exact.",
  },
  {
    icon: Globe,
    persona: "Tout le monde",
    profile: "General / Professional",
    day: "Navigation, mail, documents",
    moment: "« Qu'est-ce que je regarde ? », réécritures instantanées, et un guidage dans les interfaces inconnues — l'orbe pointe le bon bouton.",
  },
];

export function PersonasSection() {
  return (
    <section className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-28">
        <Reveal>
          <div className="max-w-2xl mb-14">
            <p className="text-[11px] font-sans font-bold text-ns-blue uppercase tracking-widest">Pour qui</p>
            <h2 className="mt-3 font-heading font-black text-3xl md:text-4xl text-ns-black tracking-tight leading-tight">
              Quatre profils, un seul produit.
            </h2>
            <p className="mt-4 text-base md:text-lg text-neutral-500 font-sans leading-relaxed">
              Coherence détecte qui vous êtes à partir de l'application active et change de posture.
              Lancement prioritaire : étudiants et chercheurs — le public de Neural Space, dont la
              douleur (échéances, papiers denses) est constante.
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-5">
          {PERSONAS.map(({ icon: Icon, persona, profile, day, moment }, i) => (
            <Reveal key={persona} delay={i * 80} className="h-full">
              <div className="group h-full rounded-3xl border border-neutral-100 bg-neutral-50 p-7 md:p-8 hover:border-ns-blue/30 transition-colors duration-200">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-ns-blue/10 text-ns-blue transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none">
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-ns-black leading-none">{persona}</h3>
                    <span className="text-[11px] font-sans font-semibold text-ns-blue uppercase tracking-widest">{profile}</span>
                  </div>
                </div>
                <p className="mt-4 text-xs font-sans font-semibold text-neutral-400 uppercase tracking-widest">Sa journée</p>
                <p className="text-sm text-neutral-600 font-sans">{day}</p>
                <p className="mt-4 text-xs font-sans font-semibold text-neutral-400 uppercase tracking-widest">Le moment qui le convainc</p>
                <p className="text-sm text-neutral-600 font-sans leading-relaxed">{moment}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── What it changes — destination vs ambient contrast ─────────────────────────

export function WhatChangesSection() {
  return (
    <section className="w-full bg-ns-black border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-28">
        <Reveal>
          <div className="max-w-2xl mb-12">
            <p className="text-[11px] font-sans font-bold text-ns-blue uppercase tracking-widest">Ce que ça change</p>
            <h2 className="mt-3 font-heading font-black text-3xl md:text-4xl text-white tracking-tight leading-tight">
              L'assistant n'est plus une destination.
            </h2>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-5">
          <Reveal>
            <div className="h-full rounded-3xl border border-white/10 bg-white/[0.03] p-7 md:p-8">
              <span className="text-[11px] font-sans font-bold text-white/40 uppercase tracking-widest">Les assistants d'aujourd'hui</span>
              <p className="mt-4 text-lg md:text-xl text-white/70 font-sans leading-relaxed">
                Vous arrêtez de travailler. Vous ouvrez un chat. Vous décrivez votre écran à un
                modèle qui ne le voit pas. Vous revenez à votre tâche.
              </p>
              <p className="mt-4 text-sm text-white/40 font-sans">Une destination que l'on visite.</p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="h-full rounded-3xl border border-ns-blue/40 bg-ns-blue/10 p-7 md:p-8">
              <span className="text-[11px] font-sans font-bold text-ns-blue uppercase tracking-widest">Coherence</span>
              <p className="mt-4 text-lg md:text-xl text-white font-sans leading-relaxed">
                Il voit déjà. Il sait déjà dans quelle app vous êtes. La réponse arrive là où vous
                regardez — sans copier, sans coller, sans réexpliquer.
              </p>
              <p className="mt-4 text-sm text-white/60 font-sans">Une présence ambiante qui travaille avec vous.</p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <p className="mt-8 text-sm md:text-base text-white/40 font-sans leading-relaxed max-w-3xl">
            Le modèle (Gemini) se loue. Le vrai avantage, c'est la <span className="text-white/70 font-semibold">couche
            de conscience</span> : détection de profil, chronologie de l'écran, la politique qui sait
            quand se taire, et des capacités ancrées dans l'interface réelle — pointer le vrai bouton,
            écrire le vrai événement. Cette couche est la nôtre, et elle se renforce avec le temps.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ── How it works — the see → judge → propose → act loop ───────────────────────

const STEPS = [
  { icon: Eye, n: "01", title: "Il voit", body: "Capture de la fenêtre active, texte AX exact ou capture d'écran selon le profil, plus l'URL. Toujours signalé : l'orbe pulse." },
  { icon: Scale, n: "02", title: "Il juge", body: "Des détecteurs locaux (échéances, erreurs, citations) tournent sans appel réseau. Une politique par profil décide si ça mérite votre attention." },
  { icon: Lightbulb, n: "03", title: "Il propose", body: "Une carte discrète apparaît — « Ajouter cette échéance au calendrier ? ». Budgétée : un nombre limité par heure, coupable app par app." },
  { icon: Hand, n: "04", title: "Il agit", body: "Vous confirmez d'un clic. Il écrit l'événement, surligne le bon bouton, applique le correctif. Chaque action laisse un reçu visible." },
];

export function HowItWorksSection() {
  return (
    <section className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-28">
        <Reveal>
          <div className="max-w-2xl mb-14">
            <p className="text-[11px] font-sans font-bold text-ns-blue uppercase tracking-widest">Comment ça marche</p>
            <h2 className="mt-3 font-heading font-black text-3xl md:text-4xl text-ns-black tracking-tight leading-tight">
              Voir, juger, proposer, agir.
            </h2>
            <p className="mt-4 text-base md:text-lg text-neutral-500 font-sans leading-relaxed">
              La même boucle de confiance pour tout : l'IA propose, vous confirmez, la capacité
              s'exécute visiblement. La confirmation d'abord — toujours.
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map(({ icon: Icon, n, title, body }, i) => (
            <Reveal key={n} delay={i * 90} className="h-full">
              <div className="relative h-full rounded-3xl border border-neutral-100 p-7 hover:border-ns-blue/30 transition-colors duration-200">
                <span className="font-heading font-black text-4xl text-neutral-100 absolute top-5 right-6 select-none">{n}</span>
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-ns-blue/10 text-ns-blue">
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 font-heading font-bold text-lg text-ns-black">{title}</h3>
                <p className="mt-2 text-sm text-neutral-500 font-sans leading-relaxed">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing — pre-launch, honest. Prices are placeholders to confirm. ─────────

const TIERS = [
  {
    name: "Étudiant",
    price: "39 €",
    period: "/ an",
    note: "Sur justificatif étudiant",
    highlight: false,
    features: [
      "Tous les profils (Learning, Research…)",
      "Propositions proactives + calendrier",
      "1 Mac",
      "Clé Gemini personnelle (BYO)",
    ],
  },
  {
    name: "Chercheur",
    price: "69 €",
    period: "/ an",
    note: "Le plus choisi",
    highlight: true,
    features: [
      "Tout le plan Étudiant",
      "Optimisé papiers, LaTeX, citations",
      "Jusqu'à 2 Macs",
      "Accès anticipé aux nouvelles capacités",
    ],
  },
  {
    name: "Pro",
    price: "99 €",
    period: "/ an",
    note: "Usage professionnel",
    highlight: false,
    features: [
      "Tout le plan Chercheur",
      "Jusqu'à 3 Macs",
      "Usage commercial",
      "Support prioritaire",
    ],
  },
];

export function PricingSection() {
  return (
    <section id="tarifs" className="w-full bg-neutral-50 border-y border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-28">
        <Reveal>
          <div className="max-w-2xl mb-4">
            <p className="text-[11px] font-sans font-bold text-ns-blue uppercase tracking-widest">Tarifs prévus au lancement</p>
            <h2 className="mt-3 font-heading font-black text-3xl md:text-4xl text-ns-black tracking-tight leading-tight">
              Essai gratuit de 14 jours. Sans compte.
            </h2>
            <p className="mt-4 text-base md:text-lg text-neutral-500 font-sans leading-relaxed">
              Licence annuelle ou achat unique à vie. Clés validées localement — aucune donnée
              de compte, aucun serveur entre vous et votre Mac. Vous apportez votre clé Gemini.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5 mt-12">
          {TIERS.map((t, i) => (
            <Reveal key={t.name} delay={i * 90} className="h-full">
              <div
                className={`relative h-full rounded-3xl p-7 md:p-8 flex flex-col ${
                  t.highlight
                    ? "bg-ns-black border-2 border-ns-blue shadow-xl"
                    : "bg-white border border-neutral-200"
                }`}
              >
                {t.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-sans font-bold uppercase tracking-widest text-white bg-ns-blue px-3 py-1 rounded-full">
                    Recommandé
                  </span>
                )}
                <h3 className={`font-heading font-bold text-xl ${t.highlight ? "text-white" : "text-ns-black"}`}>{t.name}</h3>
                <p className={`mt-1 text-xs font-sans ${t.highlight ? "text-white/50" : "text-neutral-400"}`}>{t.note}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className={`font-heading font-black text-4xl ${t.highlight ? "text-white" : "text-ns-black"}`}>{t.price}</span>
                  <span className={`text-sm font-sans ${t.highlight ? "text-white/50" : "text-neutral-400"}`}>{t.period}</span>
                </div>
                <span className={`mt-2 inline-block text-[11px] font-sans font-semibold ${t.highlight ? "text-ns-blue" : "text-ns-blue"}`}>
                  −20 % vs mensuel · ou licence à vie
                </span>

                <ul className="mt-6 space-y-3 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${t.highlight ? "text-ns-blue" : "text-ns-blue"}`} strokeWidth={2.5} />
                      <span className={`text-sm font-sans ${t.highlight ? "text-white/80" : "text-neutral-600"}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="#acces"
                  className={`mt-7 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-sans font-bold transition-all duration-200 hover:scale-[1.03] active:scale-95 motion-reduce:transform-none ${
                    t.highlight
                      ? "bg-ns-blue text-white hover:shadow-[0_0_28px_rgba(34,51,240,0.45)]"
                      : "bg-ns-black text-white hover:opacity-90"
                  }`}
                >
                  Rejoindre la liste
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mt-8 text-center text-xs text-neutral-400 font-sans">
            Garantie sérénité : l'essai de 14 jours ne demande aucune carte. Vous n'aimez pas ? Vous désinstallez, rien ne reste.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ── Trust strip ───────────────────────────────────────────────────────────────

const TRUST = [
  { icon: Apple, label: "DMG notarisé Apple", detail: "signé et vérifié par Apple" },
  { icon: RefreshCw, label: "Mises à jour Sparkle", detail: "signées EdDSA, vérifiées" },
  { icon: ShieldCheck, label: "IA honnête par conception", detail: "chaque capture est signalée" },
  { icon: KeyRound, label: "Clé Gemini personnelle", detail: "validation locale, sans compte" },
];

export function TrustStrip() {
  return (
    <section className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 md:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {TRUST.map(({ icon: Icon, label, detail }, i) => (
            <Reveal key={label} delay={i * 70} className="h-full">
              <div className="flex flex-col items-center text-center gap-2 px-4">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-ns-blue/10 text-ns-blue">
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                </span>
                <p className="text-sm font-sans font-bold text-ns-black">{label}</p>
                <p className="text-xs text-neutral-400 font-sans">{detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
