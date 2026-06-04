-- Extra categories
insert into categories (id, slug, name, color_hex) values
  ('00000000-0000-0000-0001-000000000001', 'biologie', 'Biologie', '#16A34A'),
  ('00000000-0000-0000-0001-000000000002', 'neurosciences', 'Neurosciences', '#9333EA'),
  ('00000000-0000-0000-0001-000000000003', 'cosmologie', 'Cosmologie', '#EA580C')
on conflict (slug) do nothing;

-- Tags
insert into tags (id, slug, name) values
  ('00000000-0000-0000-0002-000000000001', 'adn', 'ADN'),
  ('00000000-0000-0000-0002-000000000002', 'cerveau', 'Cerveau'),
  ('00000000-0000-0000-0002-000000000003', 'quantum', 'Quantique'),
  ('00000000-0000-0000-0002-000000000004', 'univers', 'Univers'),
  ('00000000-0000-0000-0002-000000000005', 'evolution', 'Évolution'),
  ('00000000-0000-0000-0002-000000000006', 'ia', 'Intelligence artificielle'),
  ('00000000-0000-0000-0002-000000000007', 'memoire', 'Mémoire'),
  ('00000000-0000-0000-0002-000000000008', 'crispr', 'CRISPR')
on conflict (slug) do nothing;

-- 10 articles
insert into articles (id, slug, type, status, category_id, title, summary, content, sources, word_count, reading_time_min, seo_title, seo_description, published_at)
values

-- 1
('00000000-0000-0000-0003-000000000001',
 'comment-fonctionne-crispr',
 'long', 'published',
 '00000000-0000-0000-0001-000000000001',
 'CRISPR-Cas9 : comment on modifie l''ADN comme du code',
 'La révolution génétique la plus importante depuis la découverte de la double hélice. CRISPR permet de couper, coller et réécrire le code du vivant avec une précision inédite.',
 '[{"id":"a1","type":"heading","content":"CRISPR-Cas9 : comment on modifie l''ADN comme du code"},{"id":"a2","type":"paragraph","content":[{"text":"CRISPR-Cas9 est une technologie d''édition génomique dérivée d''un système immunitaire naturel des bactéries."}]}]'::jsonb,
 '[]'::jsonb, 800, 4,
 'CRISPR-Cas9 expliqué — Neural Space',
 'Comment fonctionne CRISPR-Cas9, la technologie qui permet de modifier l''ADN avec une précision chirurgicale.',
 now() - interval '1 day'),

-- 2
('00000000-0000-0000-0003-000000000002',
 'big-bang-mythes-realites',
 'long', 'published',
 '00000000-0000-0000-0001-000000000003',
 'Le Big Bang : tout ce que vous croyez savoir est faux',
 'Non, le Big Bang n''était pas une explosion dans l''espace. Non, il n''y avait pas de "avant". La cosmologie moderne contredit presque tout ce que l''école nous a appris.',
 '[{"id":"b1","type":"heading","content":"Le Big Bang : tout ce que vous croyez savoir est faux"},{"id":"b2","type":"paragraph","content":[{"text":"L''image d''une immense explosion dans le vide est l''une des plus grandes erreurs pédagogiques de l''histoire des sciences."}]}]'::jsonb,
 '[]'::jsonb, 1200, 6,
 'Le Big Bang expliqué — Neural Space',
 'Les mythes et réalités du Big Bang, expliqués sans compromis.',
 now() - interval '2 days'),

-- 3
('00000000-0000-0000-0003-000000000003',
 'neurones-miroirs-empathie',
 'short', 'published',
 '00000000-0000-0000-0001-000000000002',
 'Les neurones miroirs : la base neurologique de l''empathie',
 'Découverts par accident dans les années 90, les neurones miroirs s''activent quand on observe quelqu''un faire une action — comme si on la faisait soi-même.',
 '[{"id":"c1","type":"heading","content":"Les neurones miroirs"},{"id":"c2","type":"paragraph","content":[{"text":"En 1992, des chercheurs de Parme observaient des macaques quand ils firent une découverte inattendue."}]}]'::jsonb,
 '[]'::jsonb, 350, 2,
 'Neurones miroirs — Neural Space',
 'Les neurones miroirs et leur rôle dans l''empathie humaine.',
 now() - interval '3 days'),

-- 4
('00000000-0000-0000-0003-000000000004',
 'matiere-noire-ce-quon-sait',
 'long', 'published',
 '00000000-0000-0000-0001-000000000003',
 'La matière noire : 27% de l''univers, zéro explication',
 'Elle est partout, elle tient les galaxies ensemble, et on ne sait absolument pas ce que c''est. Tour d''horizon de la plus grande énigme de la physique moderne.',
 '[{"id":"d1","type":"heading","content":"La matière noire"},{"id":"d2","type":"paragraph","content":[{"text":"Si on retire la matière ordinaire de l''univers, il reste 27% de quelque chose que la physique ne sait pas nommer."}]}]'::jsonb,
 '[]'::jsonb, 950, 5,
 'Matière noire expliquée — Neural Space',
 'Tout ce qu''on sait sur la matière noire, et surtout ce qu''on ne sait pas.',
 now() - interval '4 days'),

-- 5
('00000000-0000-0000-0003-000000000005',
 'sommeil-consolidation-memoire',
 'short', 'published',
 '00000000-0000-0000-0001-000000000002',
 'Pourquoi dormir consolide la mémoire',
 'Pendant le sommeil, le cerveau rejoue les événements de la journée à grande vitesse. Ce n''est pas du repos — c''est du travail cognitif intense.',
 '[{"id":"e1","type":"heading","content":"Pourquoi dormir consolide la mémoire"},{"id":"e2","type":"paragraph","content":[{"text":"Le sommeil paradoxal est la phase où le cerveau trie, compresse et archive les souvenirs de la journée."}]}]'::jsonb,
 '[]'::jsonb, 420, 2,
 'Sommeil et mémoire — Neural Space',
 'Comment le sommeil consolide la mémoire selon les neurosciences.',
 now() - interval '5 days'),

-- 6
('00000000-0000-0000-0003-000000000006',
 'intrication-quantique-expliquee',
 'long', 'published',
 '00000000-0000-0000-0000-000000000001',
 'L''intrication quantique : Einstein avait tort',
 '"Action fantôme à distance" — Einstein détestait cette idée. Pourtant, des décennies d''expériences lui ont donné tort. L''intrication quantique est réelle, mesurée, et toujours inexplicable.',
 '[{"id":"f1","type":"heading","content":"L''intrication quantique"},{"id":"f2","type":"equation","latex":"\\\\psi = \\\\frac{1}{\\\\sqrt{2}}(|00\\\\rangle + |11\\\\rangle)"}]'::jsonb,
 '[]'::jsonb, 1100, 6,
 'Intrication quantique — Neural Space',
 'L''intrication quantique expliquée : pourquoi Einstein avait tort.',
 now() - interval '6 days'),

-- 7
('00000000-0000-0000-0003-000000000007',
 'evolution-yeux',
 'short', 'published',
 '00000000-0000-0000-0001-000000000001',
 'L''œil a évolué 40 fois indépendamment',
 'La vision est si avantageuse que la nature l''a "inventée" des dizaines de fois, sur des lignées évolutives totalement séparées. Une démonstration spectaculaire de l''évolution convergente.',
 '[{"id":"g1","type":"heading","content":"L''œil a évolué 40 fois indépendamment"},{"id":"g2","type":"paragraph","content":[{"text":"La pieuvre et l''humain ont des yeux quasi-identiques, pourtant leur ancêtre commun était aveugle."}]}]'::jsonb,
 '[]'::jsonb, 380, 2,
 'Évolution des yeux — Neural Space',
 'Comment l''œil a évolué indépendamment 40 fois dans l''histoire du vivant.',
 now() - interval '7 days'),

-- 8
('00000000-0000-0000-0003-000000000008',
 'ia-et-cerveau-differences',
 'long', 'published',
 '00000000-0000-0000-0001-000000000002',
 'IA vs cerveau humain : ce que les LLM ne feront jamais',
 'Les grands modèles de langage sont impressionnants. Mais il existe des capacités cognitives fondamentales que les architectures actuelles ne peuvent structurellement pas reproduire.',
 '[{"id":"h1","type":"heading","content":"IA vs cerveau humain"},{"id":"h2","type":"paragraph","content":[{"text":"Un LLM traite 175 milliards de paramètres. Le cerveau humain, 86 milliards de neurones avec des connexions dynamiques."}]}]'::jsonb,
 '[]'::jsonb, 1050, 5,
 'IA vs cerveau humain — Neural Space',
 'Les différences fondamentales entre l''IA et le cerveau humain.',
 now() - interval '8 days'),

-- 9
('00000000-0000-0000-0003-000000000009',
 'entropie-fleche-du-temps',
 'long', 'published',
 '00000000-0000-0000-0000-000000000001',
 'L''entropie : pourquoi le temps ne va que dans un sens',
 'Les lois de la physique sont réversibles dans le temps — sauf une. L''entropie explique pourquoi les œufs cassés ne se reconstituent pas, et pourquoi le passé est différent du futur.',
 '[{"id":"i1","type":"heading","content":"L''entropie et la flèche du temps"},{"id":"i2","type":"equation","latex":"\\\\Delta S \\\\geq 0"},{"id":"i3","type":"paragraph","content":[{"text":"La deuxième loi de la thermodynamique est la seule loi physique qui distingue le passé du futur."}]}]'::jsonb,
 '[]'::jsonb, 900, 5,
 'Entropie et temps — Neural Space',
 'Pourquoi le temps ne va que dans un sens : l''entropie expliquée.',
 now() - interval '9 days'),

-- 10
('00000000-0000-0000-0003-000000000010',
 'placebo-biologie-croyance',
 'short', 'published',
 '00000000-0000-0000-0001-000000000002',
 'L''effet placebo est réel : la biologie de la croyance',
 'Avaler une pilule de sucre peut faire baisser la tension, réduire la douleur, et même shrink des tumeurs dans certains cas. L''effet placebo est l''une des preuves les plus troublantes du pouvoir du cerveau sur le corps.',
 '[{"id":"j1","type":"heading","content":"L''effet placebo"},{"id":"j2","type":"paragraph","content":[{"text":"Dans certaines études, un placebo est aussi efficace qu''un antidépresseur pour les dépressions légères à modérées."}]}]'::jsonb,
 '[]'::jsonb, 440, 2,
 'Effet placebo — Neural Space',
 'La biologie de l''effet placebo : comment la croyance modifie le corps.',
 now() - interval '10 days')

on conflict (slug) do nothing;

-- Article-tag associations
insert into article_tags (article_id, tag_id) values
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000001'), -- CRISPR → ADN
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000008'), -- CRISPR → CRISPR
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0002-000000000004'), -- Big Bang → Univers
  ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0002-000000000002'), -- Neurones → Cerveau
  ('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0002-000000000004'), -- Matière noire → Univers
  ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0002-000000000007'), -- Sommeil → Mémoire
  ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0002-000000000002'), -- Sommeil → Cerveau
  ('00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0002-000000000003'), -- Intrication → Quantique
  ('00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0002-000000000005'), -- Évolution → Évolution
  ('00000000-0000-0000-0003-000000000008', '00000000-0000-0000-0002-000000000006'), -- IA → IA
  ('00000000-0000-0000-0003-000000000008', '00000000-0000-0000-0002-000000000002'), -- IA → Cerveau
  ('00000000-0000-0000-0003-000000000009', '00000000-0000-0000-0002-000000000003'), -- Entropie → Quantique
  ('00000000-0000-0000-0003-000000000010', '00000000-0000-0000-0002-000000000002') -- Placebo → Cerveau
on conflict do nothing;
