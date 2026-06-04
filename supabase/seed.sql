-- Test category
insert into categories (id, slug, name, color_hex)
values (
  '00000000-0000-0000-0000-000000000001',
  'physique',
  'Physique',
  '#2233F0'
) on conflict (slug) do nothing;

-- Test author
insert into authors (id, name, slug, role, institution, bio)
values (
  '00000000-0000-0000-0000-000000000002',
  'Armand Wegnez',
  'armand-wegnez',
  'Fondateur',
  'Neural Space',
  'Passionné de physique quantique et de vulgarisation scientifique.'
) on conflict (slug) do nothing;

-- Test article
insert into articles (
  id, slug, type, status, category_id,
  title, summary,
  content, sources,
  word_count, reading_time_min,
  seo_title, seo_description,
  published_at
) values (
  '00000000-0000-0000-0000-000000000003',
  'test-les-trous-noirs',
  'long',
  'published',
  '00000000-0000-0000-0000-000000000001',
  'Les trous noirs : ce que l''espace nous cache vraiment',
  'Derrière l''image iconique d''Interstellar se cache une réalité scientifique vertigineuse. Plongée dans l''un des objets les plus extrêmes de l''univers.',
  '[
    {
      "id": "b1",
      "type": "heading",
      "content": "Les trous noirs : ce que l''espace nous cache vraiment"
    },
    {
      "id": "b2",
      "type": "key-takeaways",
      "items": [
        "Un trou noir est une région de l''espace où la gravité est si intense que rien, pas même la lumière, ne peut s''en échapper.",
        "L''horizon des événements est le point de non-retour — une frontière invisible, pas une surface physique.",
        "Les trous noirs ne sont pas des aspirateurs cosmiques : ils suivent les mêmes lois gravitationnelles que les étoiles."
      ]
    },
    {
      "id": "b3",
      "type": "subheading",
      "level": 2,
      "content": "Une singularité, pas un trou",
      "anchor": "une-singularite-pas-un-trou"
    },
    {
      "id": "b4",
      "type": "paragraph",
      "content": [
        { "text": "Contrairement à ce que le nom suggère, un trou noir n''est pas un " },
        { "text": "vide", "marks": ["italic"] },
        { "text": " dans l''espace. C''est une région où la " },
        { "text": "densité de masse", "marks": ["bold"] },
        { "text": " est si extrême que la courbure de l''espace-temps devient infinie." }
      ]
    },
    {
      "id": "b5",
      "type": "equation",
      "latex": "r_s = \\frac{2GM}{c^2}"
    },
    {
      "id": "b6",
      "type": "paragraph",
      "content": [
        { "text": "Cette formule est le rayon de Schwarzschild " },
        { "text": "r_s", "inlineLatex": "r_s" },
        { "text": " — le rayon en dessous duquel un objet de masse " },
        { "text": "M", "inlineLatex": "M" },
        { "text": " devient un trou noir." }
      ]
    },
    {
      "id": "b7",
      "type": "quote",
      "content": "Dieu ne joue pas aux dés avec l''univers.",
      "attribution": "Albert Einstein"
    },
    {
      "id": "b8",
      "type": "subheading",
      "level": 2,
      "content": "L''horizon des événements",
      "anchor": "horizon-des-evenements"
    },
    {
      "id": "b9",
      "type": "callout",
      "variant": "key-concept",
      "title": "Concept clé",
      "content": [
        { "text": "L''horizon des événements n''est pas une surface physique. C''est une " },
        { "text": "frontière causale", "marks": ["bold"] },
        { "text": " — la limite au-delà de laquelle aucun signal ne peut remonter vers l''observateur extérieur." }
      ]
    },
    {
      "id": "b10",
      "type": "bullet-list",
      "items": [
        [{ "text": "En dessous de l''horizon, le futur pointe vers la singularité — sans exception." }],
        [{ "text": "Un observateur tombant dedans ne ressentirait " }, { "text": "rien d''anormal", "marks": ["bold"] }, { "text": " en franchissant l''horizon." }],
        [{ "text": "Pour un observateur extérieur, cet observateur semble " }, { "text": "geler", "marks": ["italic"] }, { "text": " et s''estomper infiniment." }]
      ]
    },
    {
      "id": "b11",
      "type": "callout",
      "variant": "anecdote",
      "content": [
        { "text": "Le terme \"trou noir\" a été popularisé par le physicien John Wheeler en 1967, bien que le concept date de John Michell en 1783." }
      ]
    },
    {
      "id": "b12",
      "type": "subheading",
      "level": 2,
      "content": "Un peu de code pour les curieux",
      "anchor": "code-pour-curieux"
    },
    {
      "id": "b13",
      "type": "code",
      "language": "python",
      "filename": "schwarzschild.py",
      "content": "G = 6.674e-11  # constante gravitationnelle\nc = 3e8        # vitesse de la lumière\n\ndef schwarzschild_radius(mass_kg: float) -> float:\n    return (2 * G * mass_kg) / c**2\n\n# Masse du soleil : 1.989e30 kg\nprint(schwarzschild_radius(1.989e30))  # ~2954 m"
    },
    {
      "id": "b14",
      "type": "divider"
    },
    {
      "id": "b15",
      "type": "paragraph",
      "content": [
        { "text": "Pour aller plus loin, la revue originale de Schwarzschild est disponible en accès libre ", "citation": 0 },
        { "text": "." }
      ]
    }
  ]'::jsonb,
  '[
    {
      "label": "Schwarzschild, K. (1916). Über das Gravitationsfeld eines Massenpunktes",
      "url": "https://arxiv.org/abs/physics/9905030"
    }
  ]'::jsonb,
  420,
  3,
  'Les trous noirs expliqués — Neural Space',
  'Derrière l''image d''Interstellar se cache une réalité scientifique vertigineuse. On vous explique ce que sont vraiment les trous noirs.',
  now()
) on conflict (slug) do nothing;

-- Link article to author
insert into article_authors (article_id, author_id, "order")
values (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000002',
  0
) on conflict do nothing;
