-- Seed all Neural Space categories.
-- Uses deterministic UUIDs (00000000-0000-0000-0002-XXXXXXXXXXXX) so they are
-- stable across environments (local, staging, prod).
-- ON CONFLICT (slug) DO NOTHING makes this safe to re-apply.

INSERT INTO categories (id, slug, name, color_hex) VALUES
  ('00000000-0000-0000-0002-000000000001', 'physique',                  'Physique',                  '#2233F0'),
  ('00000000-0000-0000-0002-000000000002', 'biologie',                  'Biologie',                  '#16A34A'),
  ('00000000-0000-0000-0003-000000000001', 'chimie',                    'Chimie',                    '#D97706'),
  ('00000000-0000-0000-0002-000000000003', 'mathematiques',             'Mathématiques',             '#7C3AED'),
  ('00000000-0000-0000-0002-000000000004', 'astronomie',                'Astronomie & Espace',       '#1E3A8A'),
  ('00000000-0000-0000-0002-000000000005', 'neurosciences',             'Neurosciences',             '#BE185D'),
  ('00000000-0000-0000-0002-000000000006', 'medecine-sante',            'Médecine & Santé',          '#059669'),
  ('00000000-0000-0000-0002-000000000007', 'sante-tech',                'Santé Tech',                '#0891B2'),
  ('00000000-0000-0000-0002-000000000008', 'intelligence-artificielle', 'Intelligence Artificielle', '#DC2626'),
  ('00000000-0000-0000-0002-000000000009', 'technologie',               'Technologie',               '#6D28D9'),
  ('00000000-0000-0000-0002-000000000010', 'environnement-climat',      'Environnement & Climat',    '#15803D'),
  ('00000000-0000-0000-0002-000000000011', 'ethique-societe',           'Éthique & Société',         '#B45309'),
  ('00000000-0000-0000-0002-000000000012', 'psychologie',               'Psychologie',               '#9333EA')
ON CONFLICT (slug) DO NOTHING;
