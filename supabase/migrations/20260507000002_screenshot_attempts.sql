-- =============================================================================
-- Migration: sites.screenshot_attempts 컬럼 추가 (스크린샷 워커 무한 재시도 방지)
-- 매 cron 실행 시 캡처 실패하면 attempts +1, 3회 도달하면 큐에서 제외.
-- =============================================================================

alter table public.sites
  add column if not exists screenshot_attempts integer not null default 0;

create index if not exists idx_sites_screenshot_attempts
  on public.sites(screenshot_attempts);
