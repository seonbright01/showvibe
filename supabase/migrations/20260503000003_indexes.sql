-- =============================================================================
-- ShowVibe — Indexes
-- Migration: 20260503_003_indexes.sql
-- =============================================================================

-- sites
create index if not exists idx_sites_status_active
  on public.sites (status, last_active_at desc)
  where visibility = 'public';

create index if not exists idx_sites_visibility
  on public.sites (visibility, status);

create index if not exists idx_sites_claimed_by
  on public.sites (claimed_by_user_id)
  where is_claimed = true;

create index if not exists idx_sites_source_platform
  on public.sites (source_platform)
  where source_platform is not null;

create index if not exists idx_sites_name_search
  on public.sites
  using gin (to_tsvector('simple', name || ' ' || coalesce(description, '')));

-- site_media
create index if not exists idx_site_media_primary
  on public.site_media (site_id)
  where is_primary = true;

-- site_analysis
create index if not exists idx_site_analysis_category
  on public.site_analysis (category);

-- comments
create index if not exists idx_comments_site_created
  on public.comments (site_id, created_at desc)
  where status = 'visible';

create index if not exists idx_comments_user
  on public.comments (user_id, created_at desc);

-- site_events
create index if not exists idx_events_site_type_time
  on public.site_events (site_id, event_type, created_at desc);

create index if not exists idx_events_user_time
  on public.site_events (user_id, created_at desc)
  where user_id is not null;

-- site_status_checks
create index if not exists idx_status_checks_site_time
  on public.site_status_checks (site_id, checked_at desc);

-- claims
create index if not exists idx_claims_site
  on public.claims (site_id, status);

-- takedown_requests
create index if not exists idx_takedown_status
  on public.takedown_requests (status, created_at desc);
