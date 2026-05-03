-- =============================================================================
-- ShowVibe — Initial Schema
-- Migration: 20260503_001_init_schema.sql
-- 사업기획서 19장 + 13.2 기반
-- =============================================================================

-- Required extensions
create extension if not exists "pgcrypto";

-- =============================================================================
-- 1. users (auth.users 1:1 확장)
-- =============================================================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'creator', 'admin')),
  bio text,
  created_at timestamptz not null default now()
);

comment on table public.users is 'ShowVibe 사용자 프로필 (auth.users 확장)';

-- =============================================================================
-- 2. sites
-- =============================================================================
create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  normalized_url text not null unique,
  description text,
  source_type text not null check (source_type in ('auto_collected', 'creator_submitted', 'admin_curated')),
  source_platform text,
  status text not null default 'unknown' check (status in ('active', 'slow', 'degraded', 'archived', 'blocked', 'unknown')),
  visibility text not null default 'unlisted' check (visibility in ('public', 'unlisted', 'private')),
  is_claimed boolean not null default false,
  claimed_by_user_id uuid references public.users(id) on delete set null,
  first_discovered_at timestamptz not null default now(),
  last_checked_at timestamptz not null default now(),
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.sites is 'ShowVibe 인덱스에 등록된 바이브코딩 사이트';
comment on column public.sites.normalized_url is '도메인+path 정규화된 URL (중복 방지용 unique key)';

-- =============================================================================
-- 3. site_media
-- =============================================================================
create table if not exists public.site_media (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  media_type text not null check (media_type in ('screenshot', 'video', 'og_image')),
  media_source text not null check (media_source in ('system_captured', 'creator_uploaded', 'og_image')),
  image_url text not null,
  image_resolution text not null default 'low' check (image_resolution in ('low', 'high')),
  is_primary boolean not null default false,
  captured_at timestamptz not null default now()
);

comment on table public.site_media is '사이트 스크린샷/이미지/비디오 자산';

-- =============================================================================
-- 4. site_analysis
-- =============================================================================
create table if not exists public.site_analysis (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null unique references public.sites(id) on delete cascade,
  ai_summary text,
  article_summary text,
  main_features jsonb not null default '[]'::jsonb,
  category text,
  tool_guess text,
  vibe_score int check (vibe_score between 0 and 100),
  quality_score int check (quality_score between 0 and 100),
  risk_score int check (risk_score between 0 and 100),
  ui_pattern text check (ui_pattern in ('dashboard', 'landing', 'marketplace', 'blog', 'portfolio', 'saas', 'tool', 'other')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.site_analysis is 'AI 분석 결과 (사이트당 1행)';
comment on column public.site_analysis.article_summary is '300-500자, AdSense SEO용 본문';

-- =============================================================================
-- 5. site_status_checks (생존 모니터링 로그)
-- =============================================================================
create table if not exists public.site_status_checks (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  checked_at timestamptz not null default now(),
  method text not null check (method in ('HEAD', 'GET')),
  http_status int,
  response_time_ms int,
  final_url text,
  result_status text not null check (result_status in ('ok', 'error', 'timeout', 'blocked', 'parking')),
  error_message text,
  screenshot_changed boolean
);

comment on table public.site_status_checks is '생존 모니터링 워커가 기록하는 체크 로그';

-- =============================================================================
-- 6. comments
-- =============================================================================
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  body text not null check (char_length(body) between 2 and 2000),
  status text not null default 'visible' check (status in ('visible', 'hidden', 'deleted')),
  like_count int not null default 0,
  report_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.comments is '사이트 댓글';

-- =============================================================================
-- 7. comment_reports
-- =============================================================================
create table if not exists public.comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  reporter_user_id uuid not null references public.users(id) on delete cascade,
  reason text not null check (reason in ('spam', 'abuse', 'ad', 'privacy', 'other')),
  detail text,
  created_at timestamptz not null default now(),
  unique (comment_id, reporter_user_id)
);

comment on table public.comment_reports is '댓글 신고 (중복 신고 방지 unique 적용)';

-- =============================================================================
-- 8. site_events (트래픽/이벤트 — trend score 핵심)
-- =============================================================================
create table if not exists public.site_events (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  event_type text not null check (event_type in ('view', 'click', 'save', 'share', 'like')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.site_events is '트래픽/상호작용 이벤트 (trend score 계산 근거)';

-- =============================================================================
-- 9. claims (제작자 인증)
-- =============================================================================
create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  claim_method text not null check (claim_method in ('github', 'meta_tag', 'dns', 'manual')),
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  verification_token text,
  verified_at timestamptz,
  rejected_reason text,
  created_at timestamptz not null default now()
);

comment on table public.claims is '제작자 사이트 소유권 인증 요청';

-- =============================================================================
-- 10. takedown_requests
-- =============================================================================
create table if not exists public.takedown_requests (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete set null,
  target_url text not null,
  requester_email text not null,
  requester_name text,
  request_type text not null check (request_type in ('copyright', 'privacy', 'defamation', 'other')),
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'info_required')),
  admin_note text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.takedown_requests is 'Notice & Takedown 요청 (사업기획서 9.3)';

-- =============================================================================
-- 11. link_policies (개별 사이트 rel 정책)
-- =============================================================================
create table if not exists public.link_policies (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null unique references public.sites(id) on delete cascade,
  rel_policy text not null default 'nofollow_sponsored' check (rel_policy in ('dofollow', 'nofollow', 'nofollow_sponsored', 'ugc')),
  reason text,
  updated_at timestamptz not null default now()
);

comment on table public.link_policies is '사이트별 외부 링크 rel 속성 정책 (사업기획서 11.2)';

-- =============================================================================
-- 트리거: updated_at 자동 갱신
-- =============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_sites_updated_at on public.sites;
create trigger trg_sites_updated_at
  before update on public.sites
  for each row
  execute function public.set_updated_at();

drop trigger if exists trg_site_analysis_updated_at on public.site_analysis;
create trigger trg_site_analysis_updated_at
  before update on public.site_analysis
  for each row
  execute function public.set_updated_at();

drop trigger if exists trg_comments_updated_at on public.comments;
create trigger trg_comments_updated_at
  before update on public.comments
  for each row
  execute function public.set_updated_at();

drop trigger if exists trg_link_policies_updated_at on public.link_policies;
create trigger trg_link_policies_updated_at
  before update on public.link_policies
  for each row
  execute function public.set_updated_at();

-- =============================================================================
-- 트리거: auth.users INSERT 시 public.users 자동 생성
-- =============================================================================
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  derived_name text;
begin
  derived_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(coalesce(new.email, ''), '@', 1),
    'user'
  );

  insert into public.users (id, name, email, avatar_url, role)
  values (
    new.id,
    derived_name,
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'avatar_url',
    'user'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();
