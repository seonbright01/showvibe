-- =============================================================================
-- Migration: users — column-level grant 정확한 패턴 (20260507000005 보강)
-- Purpose:   20260507000005 의 패턴 (`grant select on table` + `revoke select (cols)`)
--            은 Postgres 에서 작동하지 않음. column-level revoke 는 table-level
--            grant 를 덮어쓰지 못함 (PG docs:
--            https://www.postgresql.org/docs/current/sql-revoke.html — column 단위
--            revoke 는 column 단위 grant 만 제거).
--
-- 결과:      20260507000005 적용 후에도 anon 이 email/is_banned/banned_at/banned_reason
--            모두 SELECT 가능. PII 노출.
--
-- Fix:       (a) anon 의 모든 권한 revoke
--            (b) 안전 컬럼만 column-level grant — id, name, avatar_url, role, bio,
--                created_at
--
-- 차단 대상: email, is_banned, banned_at, banned_reason (PII 4개)
--
-- 검증:      이 migration 후
--              has_column_privilege('anon','public.users','email','SELECT') = false
--              has_column_privilege('anon','public.users','name','SELECT')  = true
--
-- 영향 범위: anon role 만. authenticated/service_role 은 별도 RLS/grant 로 유지.
-- =============================================================================

-- 1. anon 의 모든 권한 회수 (column-level + table-level 모두 정리).
revoke all on public.users from anon;

-- 2. 안전한 6개 컬럼만 명시 grant. PostgREST 가 이 grants 를 honor.
grant select (id, name, avatar_url, role, bio, created_at) on public.users to anon;
