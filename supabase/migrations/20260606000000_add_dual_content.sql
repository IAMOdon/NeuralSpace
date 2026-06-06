-- Add support for dual-content articles (simplified + scientific versions)
alter table articles
add column content_simplified jsonb,
add column content_scientific jsonb,
add column has_dual_content boolean default false;

-- Backfill: existing articles map 'content' to 'content_simplified', scientific is null
update articles
set content_simplified = content,
    has_dual_content = false
where has_dual_content is false;

-- Create index for filtering articles with dual content
create index articles_has_dual_content_idx on articles(has_dual_content);
