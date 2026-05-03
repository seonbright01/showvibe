-- =============================================================================
-- ShowVibe — Editor's Pick (admin only)
-- Migration: 20260503_011_editors_pick.sql
-- 사용자 요청: admin만 Editor's Pick 선정 + 추천 멘트 입력
-- =============================================================================

alter table public.sites add column if not exists is_editors_pick boolean not null default false;
alter table public.sites add column if not exists editors_note text;
alter table public.sites add column if not exists editors_pick_updated_at timestamptz;
alter table public.sites add column if not exists editors_pick_updated_by uuid references public.users(id) on delete set null;

comment on column public.sites.is_editors_pick is 'admin이 Editor''s Pick으로 선정한 사이트 여부';
comment on column public.sites.editors_note is '에디터 추천 멘트 (홈 Editor''s Pick 카드 아래 표시)';

create index if not exists idx_sites_editors_pick
  on public.sites (editors_pick_updated_at desc)
  where is_editors_pick = true;
