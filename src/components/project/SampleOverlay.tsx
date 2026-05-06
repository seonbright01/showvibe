// 미인증 사이트 스크린샷에 덧씌우는 워터마크 + 그레인 오버레이.
// 적용 조건: NOT (creator_uploaded OR isClaimed)
// 즉, 제작자 직접 업로드/인증/claim 된 콘텐츠에는 표시되지 않음.

interface SampleOverlayProps {
  /** 텍스트 크기 — sm: card(280px내외), lg: detail(800px내외) */
  size?: 'sm' | 'lg'
}

// SVG fractalNoise 텍스처 — atomic data URI, 외부 asset 의존 없음.
const GRAIN_SVG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/></svg>\")"

export function SampleOverlay({ size = 'sm' }: SampleOverlayProps) {
  const textClass =
    size === 'lg'
      ? 'text-7xl md:text-8xl'
      : 'text-3xl sm:text-4xl md:text-5xl'

  return (
    <>
      {/* 그레인 텍스처 — mix-blend-overlay 로 화면 위에 노이즈 합성 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-60"
        style={{
          backgroundImage: GRAIN_SVG,
          backgroundSize: '200px 200px',
        }}
      />
      {/* 어두운 톤 다운 — 화질 떨어진 느낌 강화 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black/15"
      />
      {/* 'sample' 워터마크 — 중앙, 회전, 두꺼운 글자 */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span
          aria-hidden="true"
          className={`select-none font-black uppercase tracking-[0.25em] text-white/55 ${textClass}`}
          style={{
            transform: 'rotate(-15deg)',
            textShadow:
              '0 2px 16px rgba(0,0,0,0.55), 0 0 4px rgba(0,0,0,0.4)',
            WebkitTextStroke: '1px rgba(0,0,0,0.3)',
          }}
        >
          sample
        </span>
      </div>
    </>
  )
}

/**
 * 콘텐츠가 "공식"(워터마크 미표시 대상)인지 판정.
 *  - creator가 직접 업로드한 스크린샷(media_source='creator_uploaded')이거나
 *  - 사이트가 claim 되어 인증 완료된 경우(sites.is_claimed=true)
 */
export function isOfficialMedia(
  isClaimed: boolean,
  mediaSource: string | null | undefined,
): boolean {
  return Boolean(isClaimed) || mediaSource === 'creator_uploaded'
}
