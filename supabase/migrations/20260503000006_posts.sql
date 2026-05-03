-- =============================================================================
-- ShowVibe — Vibe Posts (편집팀 매거진)
-- Migration: 20260503_006_posts.sql
-- 주간 핫이슈, 트렌드 분석, 도구 비교 등 편집 콘텐츠
-- =============================================================================

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_user_id uuid not null references public.users(id) on delete restrict,
  title text not null check (char_length(title) between 2 and 200),
  slug text not null unique,
  body_md text not null,
  excerpt text,
  category text,
  cover_image_url text,
  related_site_ids uuid[] not null default '{}',
  read_time_minutes int,
  view_count int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.posts is 'ShowVibe 편집팀이 발행하는 매거진 포스트 (published_at IS NOT NULL일 때만 공개)';
comment on column public.posts.related_site_ids is '본문에서 언급된 사이트 id 배열 (사이드바 연관 카드 표시용)';
comment on column public.posts.published_at is 'NULL이면 비공개 초안';

-- =============================================================================
-- 인덱스
-- =============================================================================
create index if not exists idx_posts_published
  on public.posts (published_at desc)
  where published_at is not null;

create index if not exists idx_posts_category_published
  on public.posts (category, published_at desc)
  where published_at is not null;

create index if not exists idx_posts_slug
  on public.posts (slug);

-- =============================================================================
-- updated_at 트리거 (init_schema.sql의 set_updated_at() 재사용)
-- =============================================================================
drop trigger if exists trg_posts_updated_at on public.posts;
create trigger trg_posts_updated_at
  before update on public.posts
  for each row
  execute function public.set_updated_at();

-- =============================================================================
-- RLS
-- =============================================================================
alter table public.posts enable row level security;

drop policy if exists posts_select_published on public.posts;
create policy posts_select_published on public.posts
  for select
  using (
    public.is_admin()
    or author_user_id = auth.uid()
    or published_at is not null
  );

drop policy if exists posts_admin_write on public.posts;
create policy posts_admin_write on public.posts
  for all
  using (public.is_admin())
  with check (public.is_admin());
