-- =============================================================================
-- 뉴스레터 기능 제거 (2026-05-04)
-- =============================================================================
-- 사유: ShowVibe MVP 범위에서 뉴스레터 기능 제외
-- CASCADE로 idx_newsletter_subscribers_status, idx_newsletter_subscribers_token,
-- RLS 정책 4개(insert_anyone/admin_select/admin_update/admin_delete) 자동 제거.
-- 데이터 손실 없음 (drop 시점 0건 — 서비스 시작 전).

drop table if exists public.newsletter_subscribers cascade;
