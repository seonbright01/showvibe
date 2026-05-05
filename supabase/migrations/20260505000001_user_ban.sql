-- =============================================================================
-- Migration: users.is_banned (admin 이용정지)
-- =============================================================================

alter table public.users
  add column if not exists is_banned boolean not null default false,
  add column if not exists banned_at timestamptz,
  add column if not exists banned_reason text;

comment on column public.users.is_banned is 'admin이 이용정지한 사용자 여부 (로그인 막거나 댓글/제출 등 막을 때 사용)';
comment on column public.users.banned_at is '이용정지 처리 시각';
comment on column public.users.banned_reason is '이용정지 사유 (admin 메모)';

create index if not exists idx_users_is_banned on public.users(is_banned) where is_banned = true;
