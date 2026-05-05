-- =============================================================================
-- Migration: comments에 post_id 추가 (포스트 댓글 활성화)
-- comments 테이블을 polymorphic 하게 사용 — site 댓글 또는 post 댓글
-- =============================================================================

-- post_id 컬럼 추가 (posts 테이블 참조)
alter table public.comments
  add column if not exists post_id uuid references public.posts(id) on delete cascade;

-- site_id를 nullable로 변경 (post 댓글일 때는 NULL)
alter table public.comments
  alter column site_id drop not null;

-- 둘 중 하나만 NOT NULL이어야 함 (XOR 제약)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'comments_target_xor'
  ) then
    alter table public.comments
      add constraint comments_target_xor
      check (
        (site_id is not null and post_id is null)
        or (site_id is null and post_id is not null)
      );
  end if;
end $$;

-- post_id 조회 빠르게
create index if not exists idx_comments_post_id
  on public.comments(post_id, created_at desc)
  where post_id is not null;

comment on column public.comments.post_id is '포스트(매거진) 댓글일 때 참조. site 댓글이면 NULL.';
