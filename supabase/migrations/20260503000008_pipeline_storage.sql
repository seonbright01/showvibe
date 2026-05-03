-- =============================================================================
-- ShowVibe — Pipeline storage (스크린샷 버킷 등록)
-- Migration: 20260503_008_pipeline_storage.sql
-- =============================================================================

-- 스크린샷 저장용 storage 버킷 (public read)
insert into storage.buckets (id, name, public)
values ('site-screenshots', 'site-screenshots', true)
on conflict (id) do nothing;

-- service_role 만 upload/update/delete 가능 (자동 적용 — service_role bypasses RLS)
-- 공개 read 정책
drop policy if exists "site-screenshots public read" on storage.objects;
create policy "site-screenshots public read"
on storage.objects
for select
to public
using (bucket_id = 'site-screenshots');

-- =============================================================================
-- sites 테이블 인덱스 보강 (파이프라인 큐 쿼리 최적화)
-- =============================================================================
create index if not exists idx_sites_first_discovered
  on public.sites (first_discovered_at asc);

create index if not exists idx_sites_visibility_status
  on public.sites (visibility, status);
