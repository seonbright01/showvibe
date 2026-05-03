-- =============================================================================
-- ShowVibe — Recheck System (재검토 메커니즘)
-- Migration: 20260503_009_recheck_system.sql
-- 사용자 요청: blocked/archived 사이트의 자동 재검토 + claim 시 자동 unblock
-- =============================================================================

-- sites 테이블에 재검토 관련 컬럼 추가
alter table public.sites add column if not exists block_reason text;
alter table public.sites add column if not exists recheck_eligible_at timestamptz;
alter table public.sites add column if not exists recheck_count int not null default 0;

comment on column public.sites.block_reason is 'L0 거부/admin reject/archive 사유 (UI/디버깅용)';
comment on column public.sites.recheck_eligible_at is '재검토 가능 시점 (지나면 recheck cron이 픽업)';
comment on column public.sites.recheck_count is '재검토 시도 횟수 (지수 백오프용)';

-- recheck 큐 인덱스
create index if not exists idx_sites_recheck
  on public.sites (recheck_eligible_at)
  where status in ('blocked', 'archived');
