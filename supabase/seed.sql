-- =============================================================================
-- ShowVibe — Development Seed Data
-- 개발 환경 전용. src/data/mock.ts 와 동일한 합성 데이터 (PII 없음).
-- idempotent: ON CONFLICT DO NOTHING.
--
-- 주의: auth.users 는 Supabase Auth 가 관리하므로 여기서는 public.users 를 직접 INSERT
--       하지 않습니다. FK references auth.users(id) 제약 때문입니다.
--       사용자가 필요한 시나리오는 scripts/seed-from-mock.ts 를 사용하세요.
-- =============================================================================

-- =============================================================================
-- sites
-- =============================================================================
insert into public.sites (
  id, name, url, normalized_url, description,
  source_type, source_platform, status, visibility,
  is_claimed, claimed_by_user_id,
  first_discovered_at, last_checked_at, last_active_at
) values
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'LawFlow',
    'https://lawflow.app',
    public.normalize_url('https://lawflow.app'),
    'AI 기반 법률 문서 자동 생성 SaaS. 계약서, NDA, 이용약관 등을 프롬프트로 작성.',
    'auto_collected', 'Cursor', 'active', 'public',
    false, null,
    '2026-03-10T08:00:00Z', '2026-05-02T14:30:00Z', '2026-05-02T14:30:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000002'::uuid,
    'StudyPal',
    'https://studypal.io',
    public.normalize_url('https://studypal.io'),
    'AI 튜터와 함께하는 개인화 학습 플랫폼. 퀴즈 자동 생성 및 진도 추적.',
    'creator_submitted', 'Lovable', 'active', 'public',
    false, null,
    '2026-02-20T10:00:00Z', '2026-05-01T09:15:00Z', '2026-05-01T09:15:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000003'::uuid,
    'PixelBoard',
    'https://pixelboard.design',
    public.normalize_url('https://pixelboard.design'),
    '디자이너를 위한 AI 무드보드 생성기. 키워드로 컬러팔레트와 레이아웃 제안.',
    'auto_collected', 'Bolt', 'active', 'public',
    false, null,
    '2026-04-01T12:00:00Z', '2026-05-02T16:00:00Z', '2026-05-02T16:00:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000004'::uuid,
    'InvoiceSnap',
    'https://invoicesnap.co',
    public.normalize_url('https://invoicesnap.co'),
    '프리랜서용 인보이스 자동화 도구. 시간 추적부터 청구서 발행까지 원스톱.',
    'creator_submitted', 'Replit', 'slow', 'public',
    false, null,
    '2026-01-15T09:00:00Z', '2026-04-28T11:00:00Z', '2026-04-20T08:00:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000005'::uuid,
    'MealPrep AI',
    'https://mealprep.ai',
    public.normalize_url('https://mealprep.ai'),
    '냉장고 사진을 찍으면 레시피를 추천해주는 AI 앱. 영양 분석 포함.',
    'auto_collected', 'v0', 'active', 'public',
    false, null,
    '2026-04-05T15:00:00Z', '2026-05-02T10:00:00Z', '2026-05-02T10:00:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000006'::uuid,
    'FitTrack Pro',
    'https://fittrackpro.app',
    public.normalize_url('https://fittrackpro.app'),
    '운동 루틴 생성과 진행 상황 시각화. AI 코치가 폼 교정 피드백 제공.',
    'admin_curated', 'Cursor', 'archived', 'public',
    false, null,
    '2025-11-20T08:00:00Z', '2026-03-01T12:00:00Z', '2026-01-15T10:00:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000007'::uuid,
    'PetCare Hub',
    'https://petcarehub.com',
    public.normalize_url('https://petcarehub.com'),
    '반려동물 건강 관리 대시보드. 예방접종 일정, 식단 추적, 수의사 예약.',
    'creator_submitted', 'Lovable', 'active', 'public',
    false, null,
    '2026-03-25T14:00:00Z', '2026-05-02T18:00:00Z', '2026-05-02T18:00:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000008'::uuid,
    'ResumeForge',
    'https://resumeforge.ai',
    public.normalize_url('https://resumeforge.ai'),
    'AI 이력서 빌더. JD를 붙여넣으면 맞춤형 이력서와 자기소개서 생성.',
    'auto_collected', 'Bolt', 'active', 'public',
    false, null,
    '2026-04-12T11:00:00Z', '2026-05-02T09:00:00Z', '2026-05-02T09:00:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000009'::uuid,
    'BudgetBuddy',
    'https://budgetbuddy.finance',
    public.normalize_url('https://budgetbuddy.finance'),
    '개인 재무 관리 앱. 카드 내역 자동 분류, 절약 목표 설정, 소비 리포트.',
    'auto_collected', 'Replit', 'degraded', 'public',
    false, null,
    '2026-02-10T07:00:00Z', '2026-05-01T20:00:00Z', '2026-04-25T15:00:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000010'::uuid,
    'TravelMate',
    'https://travelmate.world',
    public.normalize_url('https://travelmate.world'),
    '여행 일정 AI 플래너. 예산, 관심사, 날씨 기반 맞춤형 여행 코스 추천.',
    'creator_submitted', 'v0', 'active', 'public',
    false, null,
    '2026-04-18T13:00:00Z', '2026-05-02T17:00:00Z', '2026-05-02T17:00:00Z'
  )
on conflict (normalized_url) do nothing;

-- =============================================================================
-- site_analysis
-- =============================================================================
insert into public.site_analysis (
  site_id, ai_summary, article_summary, main_features,
  category, tool_guess, vibe_score, quality_score, risk_score, ui_pattern
) values
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Cursor로 빌드된 LegalTech SaaS. 깔끔한 대시보드 UI에 문서 에디터 통합.',
    null,
    '["AI 문서 생성", "템플릿 라이브러리", "전자서명", "버전 관리"]'::jsonb,
    'LegalTech', 'Cursor', 92, 88, 12, 'saas'
  ),
  (
    '00000000-0000-0000-0000-000000000002'::uuid,
    'Lovable로 제작된 EdTech 플랫폼. 인터랙티브 퀴즈와 게이미피케이션 요소.',
    'Product Hunt에서 2위 달성. 출시 첫 주 3,000명 가입.',
    '["AI 퀴즈 생성", "학습 진도 추적", "스페이스드 리피티션", "리더보드"]'::jsonb,
    'EdTech', 'Lovable', 87, 85, 8, 'dashboard'
  ),
  (
    '00000000-0000-0000-0000-000000000003'::uuid,
    'Bolt로 만든 디자인 도구. 드래그앤드롭 인터페이스가 인상적.',
    null,
    '["AI 컬러팔레트", "무드보드 에디터", "Figma 내보내기", "트렌드 분석"]'::jsonb,
    'Design Tool', 'Bolt', 94, 90, 5, 'tool'
  ),
  (
    '00000000-0000-0000-0000-000000000004'::uuid,
    'Replit에서 빌드된 프리랜서 도구. 기능은 좋으나 응답 속도 개선 필요.',
    null,
    '["시간 추적", "인보이스 생성", "결제 연동", "세금 계산"]'::jsonb,
    'SaaS', 'Replit', 72, 68, 25, 'saas'
  ),
  (
    '00000000-0000-0000-0000-000000000005'::uuid,
    'v0로 제작된 AI 레시피 앱. 비주얼이 뛰어나고 UX가 직관적.',
    'HackerNews 프론트 페이지 진출. 이미지 인식 정확도 높음.',
    '["이미지 식재료 인식", "AI 레시피 추천", "영양 분석", "쇼핑 리스트"]'::jsonb,
    'AI Tool', 'v0', 89, 86, 10, 'tool'
  ),
  (
    '00000000-0000-0000-0000-000000000006'::uuid,
    'Cursor로 만들었으나 현재 아카이브 상태. 피트니스 트래킹 대시보드.',
    null,
    '["운동 루틴 생성", "진행 차트", "AI 폼 교정", "커뮤니티"]'::jsonb,
    'HealthTech', 'Cursor', 65, 60, 40, 'dashboard'
  ),
  (
    '00000000-0000-0000-0000-000000000007'::uuid,
    'Lovable로 빌드된 펫케어 플랫폼. 귀여운 UI와 실용적인 기능 조합.',
    null,
    '["건강 기록", "예방접종 알림", "수의사 예약", "식단 관리"]'::jsonb,
    'PetTech', 'Lovable', 83, 80, 15, 'dashboard'
  ),
  (
    '00000000-0000-0000-0000-000000000008'::uuid,
    'Bolt 기반 이력서 빌더. JD 분석 후 키워드 최적화된 이력서 생성.',
    'Reddit r/jobs에서 바이럴. 주간 1만 건 이력서 생성.',
    '["JD 분석", "ATS 최적화", "다국어 지원", "PDF 내보내기"]'::jsonb,
    'AI Tool', 'Bolt', 91, 87, 9, 'tool'
  ),
  (
    '00000000-0000-0000-0000-000000000009'::uuid,
    'Replit으로 만든 가계부 앱. 기능은 많으나 일부 API 에러 발생 중.',
    null,
    '["자동 분류", "예산 설정", "소비 리포트", "절약 챌린지"]'::jsonb,
    'FinTech', 'Replit', 70, 62, 35, 'dashboard'
  ),
  (
    '00000000-0000-0000-0000-000000000010'::uuid,
    'v0로 제작된 여행 플래너. 지도 연동과 일정 최적화가 강점.',
    'Product Hunt 오늘의 제품 선정.',
    '["AI 일정 생성", "예산 최적화", "날씨 연동", "현지 맛집 추천"]'::jsonb,
    'Travel', 'v0', 88, 84, 11, 'tool'
  )
on conflict (site_id) do nothing;

-- =============================================================================
-- site_media
-- =============================================================================
insert into public.site_media (
  site_id, media_type, media_source, image_url, image_resolution, is_primary, captured_at
) values
  ('00000000-0000-0000-0000-000000000001'::uuid, 'screenshot', 'system_captured',  '/mock/screenshots/lawflow.webp',     'high', true, '2026-05-02T14:30:00Z'),
  ('00000000-0000-0000-0000-000000000002'::uuid, 'screenshot', 'creator_uploaded', '/mock/screenshots/studypal.webp',    'high', true, '2026-05-01T09:15:00Z'),
  ('00000000-0000-0000-0000-000000000003'::uuid, 'screenshot', 'system_captured',  '/mock/screenshots/pixelboard.webp',  'high', true, '2026-05-02T16:00:00Z'),
  ('00000000-0000-0000-0000-000000000005'::uuid, 'screenshot', 'system_captured',  '/mock/screenshots/mealprep.webp',    'high', true, '2026-05-02T10:00:00Z'),
  ('00000000-0000-0000-0000-000000000008'::uuid, 'screenshot', 'og_image',         '/mock/screenshots/resumeforge.webp', 'high', true, '2026-05-02T09:00:00Z'),
  ('00000000-0000-0000-0000-000000000010'::uuid, 'screenshot', 'creator_uploaded', '/mock/screenshots/travelmate.webp',  'high', true, '2026-05-02T17:00:00Z')
on conflict do nothing;

-- =============================================================================
-- 끝.
-- =============================================================================
