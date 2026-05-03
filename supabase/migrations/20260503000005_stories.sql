-- =============================================================================
-- ShowVibe — Maker Stories
-- Migration: 20260503_005_stories.sql
-- 메이커가 자신의 빌드 여정을 글로 남기는 콘텐츠 테이블
-- =============================================================================

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  maker_user_id uuid not null references public.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 200),
  slug text not null unique,
  body_md text not null,
  excerpt text,
  cover_image_url text,
  tags text[] not null default '{}',
  view_count int not null default 0,
  reply_count int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.stories is '메이커가 작성한 빌드 회고/스토리 (published_at IS NOT NULL일 때만 공개)';
comment on column public.stories.slug is 'URL-safe unique slug (예: building-lawflow-with-cursor)';
comment on column public.stories.published_at is 'NULL이면 비공개 초안';

-- =============================================================================
-- 인덱스
-- =============================================================================
create index if not exists idx_stories_published
  on public.stories (published_at desc)
  where published_at is not null;

create index if not exists idx_stories_maker
  on public.stories (maker_user_id, published_at desc);

create index if not exists idx_stories_slug
  on public.stories (slug);

-- =============================================================================
-- updated_at 트리거 (init_schema.sql의 set_updated_at() 재사용)
-- =============================================================================
drop trigger if exists trg_stories_updated_at on public.stories;
create trigger trg_stories_updated_at
  before update on public.stories
  for each row
  execute function public.set_updated_at();

-- =============================================================================
-- RLS
-- =============================================================================
alter table public.stories enable row level security;

drop policy if exists stories_select_published on public.stories;
create policy stories_select_published on public.stories
  for select
  using (
    public.is_admin()
    or maker_user_id = auth.uid()
    or published_at is not null
  );

drop policy if exists stories_insert_self on public.stories;
create policy stories_insert_self on public.stories
  for insert
  to authenticated
  with check (maker_user_id = auth.uid());

drop policy if exists stories_update_self on public.stories;
create policy stories_update_self on public.stories
  for update
  to authenticated
  using (maker_user_id = auth.uid() or public.is_admin())
  with check (maker_user_id = auth.uid() or public.is_admin());

drop policy if exists stories_delete_self on public.stories;
create policy stories_delete_self on public.stories
  for delete
  to authenticated
  using (maker_user_id = auth.uid() or public.is_admin());
