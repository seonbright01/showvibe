-- =============================================================================
-- ShowVibe — Social actions (좋아요·책갈피)
-- Migration: 20260503_010_social_actions.sql
-- 사용자 요청: 회원 전용 좋아요/저장 기능 + 책갈피는 제3자 노출 X
-- =============================================================================

-- =============================================================================
-- 1. site_likes (좋아요 — 카운트 공개)
-- =============================================================================
create table if not exists public.site_likes (
  site_id uuid not null references public.sites(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (site_id, user_id)
);

create index if not exists idx_site_likes_site on public.site_likes (site_id);
create index if not exists idx_site_likes_user on public.site_likes (user_id);

comment on table public.site_likes is '사이트 좋아요 (한 사용자 한 번, 카운트는 공개)';

alter table public.site_likes enable row level security;

drop policy if exists "site_likes_select_anyone" on public.site_likes;
create policy "site_likes_select_anyone"
  on public.site_likes for select
  to public
  using (true);

drop policy if exists "site_likes_insert_self" on public.site_likes;
create policy "site_likes_insert_self"
  on public.site_likes for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "site_likes_delete_self" on public.site_likes;
create policy "site_likes_delete_self"
  on public.site_likes for delete
  to authenticated
  using (auth.uid() = user_id);

-- =============================================================================
-- 2. site_saves (책갈피 — 본인만 조회)
-- =============================================================================
create table if not exists public.site_saves (
  site_id uuid not null references public.sites(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  note text,
  primary key (site_id, user_id)
);

create index if not exists idx_site_saves_user_created
  on public.site_saves (user_id, created_at desc);

comment on table public.site_saves is '책갈피/저장 (본인만 조회 가능, 제3자 노출 X)';

alter table public.site_saves enable row level security;

drop policy if exists "site_saves_select_self" on public.site_saves;
create policy "site_saves_select_self"
  on public.site_saves for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "site_saves_insert_self" on public.site_saves;
create policy "site_saves_insert_self"
  on public.site_saves for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "site_saves_delete_self" on public.site_saves;
create policy "site_saves_delete_self"
  on public.site_saves for delete
  to authenticated
  using (auth.uid() = user_id);
