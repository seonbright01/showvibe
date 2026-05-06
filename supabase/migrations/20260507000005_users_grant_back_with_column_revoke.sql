-- =============================================================================
-- Migration: users — column-level grant 정정 (P3.8 emergency fix)
-- Purpose:   20260507000004 의 'revoke select on public.users from anon' 가
--            모든 join 쿼리(getTrendingSites/getEditorsPick/getPosts/Chart 등) 를
--            깨뜨림. anon 시점에 sites:users(...) join 시 42501 permission denied
--            발생 → 익명 사용자에게 홈/explore/posts/chart 콘텐츠 누락.
--
-- Fix:       table-level SELECT 권한은 회복하되, column-level revoke 로
--            email/is_banned/banned_at/banned_reason 만 차단. PostgREST 가
--            column privileges 를 honor 하므로 anon 이 select=email 시도하면
--            여전히 거부. 그러나 안전 컬럼(id/name/avatar_url/role/bio 등)은
--            노출되어 join 정상 작동.
--
-- 검증:      이 migration 후
--              has_column_privilege('anon', 'public.users', 'email', 'SELECT')   = false
--              has_column_privilege('anon', 'public.users', 'name', 'SELECT')    = true
--              has_column_privilege('anon', 'public.users', 'is_banned', 'SELECT') = false
-- =============================================================================

-- 1. table-level SELECT 회복 — anon 이 join 으로 user 정보를 읽을 수 있어야 함.
grant select on public.users to anon;

-- 2. 민감 컬럼 column-level revoke — PII 보호 유지.
revoke select (email, is_banned, banned_at, banned_reason) on public.users from anon;
