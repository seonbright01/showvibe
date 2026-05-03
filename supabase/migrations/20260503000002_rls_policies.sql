-- =============================================================================
-- ShowVibe — RLS Policies
-- Migration: 20260503_002_rls_policies.sql
-- =============================================================================

-- =============================================================================
-- Helper: is_admin() — auth.uid()의 role이 'admin'인지 검사
-- =============================================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'admin'
  );
$$;

comment on function public.is_admin() is '현재 인증된 사용자가 admin인지 확인';

-- =============================================================================
-- RLS 활성화
-- =============================================================================
alter table public.users enable row level security;
alter table public.sites enable row level security;
alter table public.site_media enable row level security;
alter table public.site_analysis enable row level security;
alter table public.site_status_checks enable row level security;
alter table public.comments enable row level security;
alter table public.comment_reports enable row level security;
alter table public.site_events enable row level security;
alter table public.claims enable row level security;
alter table public.takedown_requests enable row level security;
alter table public.link_policies enable row level security;

-- =============================================================================
-- users
-- =============================================================================
drop policy if exists users_select_all on public.users;
create policy users_select_all on public.users
  for select
  using (true);

drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users
  for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

drop policy if exists users_admin_all on public.users;
create policy users_admin_all on public.users
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- sites
-- =============================================================================
drop policy if exists sites_select_public on public.sites;
create policy sites_select_public on public.sites
  for select
  using (
    public.is_admin()
    or (visibility = 'public' and status <> 'blocked')
  );

drop policy if exists sites_admin_write on public.sites;
create policy sites_admin_write on public.sites
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- site_media
-- =============================================================================
drop policy if exists site_media_select_public on public.site_media;
create policy site_media_select_public on public.site_media
  for select
  using (
    public.is_admin()
    or exists (
      select 1
      from public.sites s
      where s.id = site_media.site_id
        and s.visibility = 'public'
        and s.status <> 'blocked'
    )
  );

drop policy if exists site_media_admin_write on public.site_media;
create policy site_media_admin_write on public.site_media
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- site_analysis
-- =============================================================================
drop policy if exists site_analysis_select_public on public.site_analysis;
create policy site_analysis_select_public on public.site_analysis
  for select
  using (
    public.is_admin()
    or exists (
      select 1
      from public.sites s
      where s.id = site_analysis.site_id
        and s.visibility = 'public'
        and s.status <> 'blocked'
    )
  );

drop policy if exists site_analysis_admin_write on public.site_analysis;
create policy site_analysis_admin_write on public.site_analysis
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- link_policies
-- =============================================================================
drop policy if exists link_policies_select_public on public.link_policies;
create policy link_policies_select_public on public.link_policies
  for select
  using (
    public.is_admin()
    or exists (
      select 1
      from public.sites s
      where s.id = link_policies.site_id
        and s.visibility = 'public'
        and s.status <> 'blocked'
    )
  );

drop policy if exists link_policies_admin_write on public.link_policies;
create policy link_policies_admin_write on public.link_policies
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- site_status_checks (admin only)
-- =============================================================================
drop policy if exists site_status_checks_admin_select on public.site_status_checks;
create policy site_status_checks_admin_select on public.site_status_checks
  for select
  using (public.is_admin());

drop policy if exists site_status_checks_admin_insert on public.site_status_checks;
create policy site_status_checks_admin_insert on public.site_status_checks
  for insert
  with check (public.is_admin());

-- =============================================================================
-- comments
-- =============================================================================
drop policy if exists comments_select_visible on public.comments;
create policy comments_select_visible on public.comments
  for select
  using (
    public.is_admin()
    or status = 'visible'
  );

drop policy if exists comments_insert_self on public.comments;
create policy comments_insert_self on public.comments
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists comments_update_self on public.comments;
create policy comments_update_self on public.comments
  for update
  to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists comments_delete_self on public.comments;
create policy comments_delete_self on public.comments
  for delete
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- =============================================================================
-- comment_reports
-- =============================================================================
drop policy if exists comment_reports_insert_authenticated on public.comment_reports;
create policy comment_reports_insert_authenticated on public.comment_reports
  for insert
  to authenticated
  with check (reporter_user_id = auth.uid());

drop policy if exists comment_reports_admin_select on public.comment_reports;
create policy comment_reports_admin_select on public.comment_reports
  for select
  using (public.is_admin());

-- =============================================================================
-- site_events (insert anyone, select admin only — privacy)
-- =============================================================================
drop policy if exists site_events_insert_anyone on public.site_events;
create policy site_events_insert_anyone on public.site_events
  for insert
  with check (
    user_id is null
    or user_id = auth.uid()
  );

drop policy if exists site_events_admin_select on public.site_events;
create policy site_events_admin_select on public.site_events
  for select
  using (public.is_admin());

-- =============================================================================
-- claims
-- =============================================================================
drop policy if exists claims_insert_self on public.claims;
create policy claims_insert_self on public.claims
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists claims_select_owner_or_admin on public.claims;
create policy claims_select_owner_or_admin on public.claims
  for select
  using (
    user_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists claims_admin_update on public.claims;
create policy claims_admin_update on public.claims
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- takedown_requests (insert anyone, select/update admin only)
-- =============================================================================
drop policy if exists takedown_requests_insert_anyone on public.takedown_requests;
create policy takedown_requests_insert_anyone on public.takedown_requests
  for insert
  with check (true);

drop policy if exists takedown_requests_admin_select on public.takedown_requests;
create policy takedown_requests_admin_select on public.takedown_requests
  for select
  using (public.is_admin());

drop policy if exists takedown_requests_admin_update on public.takedown_requests;
create policy takedown_requests_admin_update on public.takedown_requests
  for update
  using (public.is_admin())
  with check (public.is_admin());
