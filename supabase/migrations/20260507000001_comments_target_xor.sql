-- =============================================================================
-- Migration: comments target XOR 제약 보강
-- 기존 OR 제약(comments_target_check)을 XOR 제약으로 교체.
-- 한 댓글은 site 또는 post 중 정확히 하나에만 속해야 한다.
-- =============================================================================

-- 사전 검증: 위반 행이 있으면 마이그레이션 실패시키기
do $$
declare
  v_violators integer;
  v_orphans integer;
begin
  select count(*) into v_violators
    from public.comments
    where site_id is not null and post_id is not null;

  select count(*) into v_orphans
    from public.comments
    where site_id is null and post_id is null;

  if v_violators > 0 then
    raise exception 'XOR migration aborted: % rows have both site_id and post_id', v_violators;
  end if;

  if v_orphans > 0 then
    raise exception 'XOR migration aborted: % rows have neither site_id nor post_id', v_orphans;
  end if;
end $$;

-- 기존 OR 제약 제거
alter table public.comments drop constraint if exists comments_target_check;

-- XOR 제약 추가 (둘 중 정확히 하나만 NOT NULL)
alter table public.comments
  add constraint comments_target_xor
  check ((site_id is not null) <> (post_id is not null));
