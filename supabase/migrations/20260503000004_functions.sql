-- =============================================================================
-- ShowVibe — Domain Functions & Triggers
-- Migration: 20260503_004_functions.sql
-- 사업기획서 13.2 (Trend Score) 기반
-- =============================================================================

-- =============================================================================
-- normalize_url(raw text) — 도메인+path 정규화
--   * scheme 보존 (http/https)
--   * www. 제거
--   * host lowercase
--   * trailing slash 제거 (path가 '/' 단독이 아닐 때)
-- =============================================================================
create or replace function public.normalize_url(raw text)
returns text
language plpgsql
immutable
as $$
declare
  trimmed text;
  scheme text;
  rest text;
  host text;
  path_part text;
  slash_pos int;
begin
  if raw is null then
    return null;
  end if;

  trimmed := btrim(raw);

  if trimmed = '' then
    return '';
  end if;

  -- scheme 분리
  if trimmed ~* '^https://' then
    scheme := 'https://';
    rest := substring(trimmed from 9);
  elsif trimmed ~* '^http://' then
    scheme := 'http://';
    rest := substring(trimmed from 8);
  else
    scheme := 'https://';
    rest := trimmed;
  end if;

  -- host / path 분리
  slash_pos := position('/' in rest);
  if slash_pos = 0 then
    host := rest;
    path_part := '';
  else
    host := substring(rest from 1 for slash_pos - 1);
    path_part := substring(rest from slash_pos);
  end if;

  -- host 정규화: lowercase + www. 제거
  host := lower(host);
  if host like 'www.%' then
    host := substring(host from 5);
  end if;

  -- path 정규화: trailing slash 제거 (단, path가 '/' 또는 비어있을 때 제외)
  if length(path_part) > 1 and right(path_part, 1) = '/' then
    path_part := left(path_part, length(path_part) - 1);
  end if;

  return scheme || host || path_part;
end;
$$;

comment on function public.normalize_url(text) is 'URL 정규화 (도메인 lowercase, www 제거, trailing slash 제거)';

-- =============================================================================
-- compute_trend_score(p_site_id, p_window) — 사업기획서 13.2 공식
--
-- Trend Score =
--   views * 1
--   + clicks * 3
--   + saves * 4
--   + comments * 2
--   + likes * 2
--   + shares * 5
--   + (claimed: +10, curated: +10)
--   - reports * 10
--   - failures * 20
-- =============================================================================
create or replace function public.compute_trend_score(
  p_site_id uuid,
  p_window interval default interval '7 days'
)
returns int
language plpgsql
stable
as $$
declare
  v_views int := 0;
  v_clicks int := 0;
  v_saves int := 0;
  v_likes int := 0;
  v_shares int := 0;
  v_comments int := 0;
  v_reports int := 0;
  v_failures int := 0;
  v_is_claimed boolean := false;
  v_source_type text;
  v_score int := 0;
  v_since timestamptz := now() - p_window;
begin
  -- 이벤트 카운트
  select
    count(*) filter (where event_type = 'view'),
    count(*) filter (where event_type = 'click'),
    count(*) filter (where event_type = 'save'),
    count(*) filter (where event_type = 'like'),
    count(*) filter (where event_type = 'share')
  into v_views, v_clicks, v_saves, v_likes, v_shares
  from public.site_events
  where site_id = p_site_id
    and created_at >= v_since;

  -- 댓글 카운트 (visible only, window 내 작성)
  select count(*)
  into v_comments
  from public.comments
  where site_id = p_site_id
    and status = 'visible'
    and created_at >= v_since;

  -- 신고 카운트 (해당 사이트 댓글에 대한 신고, window 내 발생)
  select count(*)
  into v_reports
  from public.comment_reports cr
  inner join public.comments c on c.id = cr.comment_id
  where c.site_id = p_site_id
    and cr.created_at >= v_since;

  -- 모니터링 실패 카운트
  select count(*)
  into v_failures
  from public.site_status_checks
  where site_id = p_site_id
    and result_status <> 'ok'
    and checked_at >= v_since;

  -- 사이트 메타
  select is_claimed, source_type
  into v_is_claimed, v_source_type
  from public.sites
  where id = p_site_id;

  v_score :=
    (v_views * 1)
    + (v_clicks * 3)
    + (v_saves * 4)
    + (v_comments * 2)
    + (v_likes * 2)
    + (v_shares * 5)
    + case when coalesce(v_is_claimed, false) then 10 else 0 end
    + case when v_source_type = 'admin_curated' then 10 else 0 end
    - (v_reports * 10)
    - (v_failures * 20);

  return v_score;
end;
$$;

comment on function public.compute_trend_score(uuid, interval) is 'Trend Score 계산 (사업기획서 13.2)';

-- =============================================================================
-- get_top_chart(p_window, p_category, p_limit) — 차트 페이지 RPC
-- 변동(change) = 직전 동일 길이 기간 대비 순위 차 (이전 순위 - 현재 순위)
-- 양수 = 상승, 음수 = 하락
-- =============================================================================
create or replace function public.get_top_chart(
  p_window interval default interval '7 days',
  p_category text default null,
  p_limit int default 50
)
returns table (
  rank int,
  change int,
  site_id uuid,
  score int
)
language plpgsql
stable
as $$
begin
  return query
  with eligible_sites as (
    select s.id
    from public.sites s
    left join public.site_analysis sa on sa.site_id = s.id
    where s.visibility = 'public'
      and s.status <> 'blocked'
      and (p_category is null or sa.category = p_category)
  ),
  current_scores as (
    select
      es.id as site_id,
      public.compute_trend_score(es.id, p_window) as score
    from eligible_sites es
  ),
  current_ranked as (
    select
      cs.site_id,
      cs.score,
      (row_number() over (order by cs.score desc, cs.site_id))::int as rank
    from current_scores cs
  ),
  previous_scores as (
    select
      es.id as site_id,
      public.compute_trend_score(es.id, p_window * 2) - public.compute_trend_score(es.id, p_window) as score
    from eligible_sites es
  ),
  previous_ranked as (
    select
      ps.site_id,
      (row_number() over (order by ps.score desc, ps.site_id))::int as prev_rank
    from previous_scores ps
  )
  select
    cr.rank,
    coalesce(pr.prev_rank - cr.rank, 0)::int as change,
    cr.site_id,
    cr.score
  from current_ranked cr
  left join previous_ranked pr on pr.site_id = cr.site_id
  order by cr.rank
  limit p_limit;
end;
$$;

comment on function public.get_top_chart(interval, text, int) is '차트 페이지 Top N (현재 순위 + 직전 기간 대비 변동)';

-- =============================================================================
-- 트리거: comment_reports INSERT 시 report_count 갱신 + auto-hide
-- 임계치: report_count >= 5
-- =============================================================================
create or replace function public.handle_comment_report_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report_count int;
begin
  -- report_count 동기화 (실 카운트 기반으로 일관성 보장)
  select count(*)
  into v_report_count
  from public.comment_reports
  where comment_id = new.comment_id;

  update public.comments
  set
    report_count = v_report_count,
    status = case
      when v_report_count >= 5 and status = 'visible' then 'hidden'
      else status
    end
  where id = new.comment_id;

  return new;
end;
$$;

drop trigger if exists trg_comment_report_insert on public.comment_reports;
create trigger trg_comment_report_insert
  after insert on public.comment_reports
  for each row
  execute function public.handle_comment_report_insert();
