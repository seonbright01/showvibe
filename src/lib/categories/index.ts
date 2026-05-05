/**
 * ShowVibe — 프로젝트 카테고리 단일 진실 소스 (SSOT)
 *
 * 한 곳에 정의하면 다음이 일관 적용:
 *  - /submit Category 셀렉트
 *  - /explore Category 필터
 *  - /chart Category 토글
 *  - /admin/review Category 수정 select
 *  - /admin/sites Category 필터 (선택)
 */

export interface ProjectCategory {
  /** canonical 식별자 (DB sites.category / site_analysis.category 에 저장) */
  id: string
  /** UI 노출 라벨 */
  label: string
  /** 설명 (admin 분류 가이드용) */
  description: string
}

export const PROJECT_CATEGORIES: readonly ProjectCategory[] = [
  {
    id: 'Design',
    label: 'Design',
    description: '웹페이지, 포트폴리오, 디자인 결과물 등',
  },
  {
    id: 'Development Tool',
    label: 'Development Tool',
    description:
      '제작과 관련된 툴 — 코드 에디터, AI 프롬프트 생성기, 에이전트 생성기, 웹페이지 builder 등',
  },
  {
    id: 'Creative Tool',
    label: 'Creative Tool',
    description:
      '창작과 관련된 툴 — 이미지 생성, 문서 생성, 음악 생성, 창작 보조 등',
  },
  {
    id: 'Platform',
    label: 'Platform',
    description: '모든 종류의 플랫폼',
  },
  {
    id: 'Game',
    label: 'Game',
    description: '게임',
  },
  {
    id: 'Others',
    label: 'Others',
    description: '위 카테고리로 분류되지 않는 것들',
  },
] as const

/** 라벨 배열 (셀렉트 옵션용) */
export const PROJECT_CATEGORY_LABELS: readonly string[] = PROJECT_CATEGORIES.map(
  (c) => c.label,
)

/** 라벨 또는 id로 카테고리 검증 */
export function isValidProjectCategory(value: string): boolean {
  return PROJECT_CATEGORIES.some(
    (c) => c.id === value || c.label === value,
  )
}
