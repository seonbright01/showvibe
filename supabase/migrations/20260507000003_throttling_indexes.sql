-- =============================================================================
-- Migration: throttling indexes + sites.submitted_by_user_id
-- Purpose:   server action 의 "최근 60초 N건 초과 reject" 쿼리(P3.4)를 효율적으로
--            지원하기 위한 인덱스 + sites 테이블 submitter 추적 컬럼.
-- Note:      마이그레이션 push 는 호출자가 직접 수행 (자동 적용 금지).
-- =============================================================================

-- 1. comments — (user_id, created_at desc) 는 이미 20260503000003 에 존재.
--    중복 idempotent 보장을 위해 명시.
create index if not exists idx_comments_user_created_at
  on public.comments (user_id, created_at desc);

-- 2. takedown_requests — anon throttle: requester_email + created_at desc.
create index if not exists idx_takedown_requests_email_created_at
  on public.takedown_requests (requester_email, created_at desc);

-- 3. claims — user 단위 brute-force 방지.
create index if not exists idx_claims_user_created_at
  on public.claims (user_id, created_at desc);

-- 4. sites — submit throttle 를 위한 컬럼 + partial index.
--    submitted_by_user_id 는 creator_submitted 출처로 등록한 user 추적용.
--    auto_collected/admin_curated 인 row 는 null.
alter table public.sites
  add column if not exists submitted_by_user_id uuid
    references public.users(id) on delete set null;

comment on column public.sites.submitted_by_user_id is
  'creator_submitted 출처로 사용자가 직접 등록한 경우 등록자 user_id (rate-limit 및 abuse 분석용)';

-- partial index: creator_submitted 만 대상 (대다수 row 는 auto_collected 이므로
-- 전체 인덱스보다 partial 이 디스크/메모리 효율적).
create index if not exists idx_sites_creator_submitted_user_created_at
  on public.sites (submitted_by_user_id, created_at desc)
  where source_type = 'creator_submitted';
