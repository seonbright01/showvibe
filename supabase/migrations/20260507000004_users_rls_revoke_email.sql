-- =============================================================================
-- Migration: users RLS — revoke email exposure to anon (P3.8)
-- Purpose:   public.users 에는 email/is_banned/banned_reason 같은 PII 가 있음.
--            기존 users_select_all 정책은 anon 도 모든 row 의 email 까지 읽을 수
--            있게 노출. anon role 의 SELECT 권한을 revoke 하고, 안전한 컬럼만
--            노출하는 view (user_profiles_public) 제공.
--
-- Note:      admin/server-action 코드는 createAdminClient() / createServiceClient()
--            로 service-role 키를 사용 → RLS 우회. 따라서 이 마이그레이션이
--            admin 콘솔의 사용자 조회/수정 경로에 영향을 주지 않음.
--            authenticated 사용자의 자기 row 조회/업데이트 도 기존 정책
--            (users_update_self) 으로 계속 가능.
-- =============================================================================

-- 1. anon role 의 public.users 직접 SELECT 권한 revoke.
revoke select on public.users from anon;

-- 2. 안전한 publicly-readable view — 이름/아바타/role 만 노출.
--    email/is_banned/banned_at/banned_reason/bio/created_at 은 제외.
create or replace view public.user_profiles_public as
select
  id,
  name,
  avatar_url,
  role
from public.users;

comment on view public.user_profiles_public is
  'public.users 의 안전한 sub-projection — email/banned/bio 미포함. anon/authenticated 가 read 가능.';

-- 3. view SELECT 권한 부여.
grant select on public.user_profiles_public to anon, authenticated;
