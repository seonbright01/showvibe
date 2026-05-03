-- =============================================================================
-- ShowVibe — Newsletter Subscribers
-- Migration: 20260503_007_newsletter.sql
-- 사업기획서 기반: 무료 뉴스레터 구독 (이메일 + double opt-in 토큰)
-- =============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'unsubscribed')),
  confirmation_token text,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.newsletter_subscribers is 'ShowVibe 주간 뉴스레터 구독자 (double opt-in)';
comment on column public.newsletter_subscribers.confirmation_token is '이메일 확인용 일회성 토큰 (status=pending에서만 유효)';
comment on column public.newsletter_subscribers.source is '구독 유입 출처 (homepage, footer 등)';

create index if not exists idx_newsletter_subscribers_status
  on public.newsletter_subscribers (status);

create index if not exists idx_newsletter_subscribers_token
  on public.newsletter_subscribers (confirmation_token)
  where confirmation_token is not null;

-- =============================================================================
-- RLS
-- =============================================================================
alter table public.newsletter_subscribers enable row level security;

-- 누구나 구독 가능 (INSERT만 허용, 이메일 중복은 unique 제약으로 차단)
drop policy if exists newsletter_insert_anyone on public.newsletter_subscribers;
create policy newsletter_insert_anyone on public.newsletter_subscribers
  for insert
  with check (true);

-- 조회/수정/삭제는 admin 전용
drop policy if exists newsletter_admin_select on public.newsletter_subscribers;
create policy newsletter_admin_select on public.newsletter_subscribers
  for select
  using (public.is_admin());

drop policy if exists newsletter_admin_update on public.newsletter_subscribers;
create policy newsletter_admin_update on public.newsletter_subscribers
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists newsletter_admin_delete on public.newsletter_subscribers;
create policy newsletter_admin_delete on public.newsletter_subscribers
  for delete
  using (public.is_admin());
