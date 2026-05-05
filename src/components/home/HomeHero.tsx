interface Particle {
  size: number
  top: string
  left: string
  anim: 'a' | 'b' | 'c'
  duration: number
  delay: number
  warm?: boolean
}

const PARTICLES: readonly Particle[] = [
  { size: 220, top: '-30%', left: '5%',  anim: 'a', duration: 14, delay: 0 },
  { size: 180, top: '40%',  left: '15%', anim: 'b', duration: 18, delay: -3, warm: true },
  { size: 260, top: '-10%', left: '40%', anim: 'c', duration: 16, delay: -5 },
  { size: 200, top: '55%',  left: '55%', anim: 'a', duration: 20, delay: -2, warm: true },
  { size: 160, top: '20%',  left: '75%', anim: 'b', duration: 13, delay: -7 },
  { size: 240, top: '-20%', left: '85%', anim: 'c', duration: 17, delay: -1, warm: true },
  { size: 140, top: '70%',  left: '30%', anim: 'a', duration: 15, delay: -4 },
  { size: 200, top: '60%',  left: '90%', anim: 'b', duration: 19, delay: -6 },
] as const

export function HomeHero() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 pt-6">
      <div
        className="sv-hero-glow relative overflow-hidden rounded-2xl border border-stroke bg-gradient-to-br from-bg-surface via-bg-elevated to-bg-surface"
        style={{ minHeight: 200 }}
      >
        {/* 코랄 입자 파동 — 배경 */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className={`sv-particle ${p.warm ? 'sv-particle-warm' : ''}`}
              style={{
                width: p.size,
                height: p.size,
                top: p.top,
                left: p.left,
                animation: `sv-particle-drift-${p.anim} ${p.duration}s ease-in-out infinite`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col gap-2.5 px-6 py-7 md:px-10 md:py-8">
          <p className="sv-hero-rise text-[11px] font-mono uppercase tracking-[0.18em] text-coral">
            Show your vibe · Find your tribe
          </p>
          <h1
            className="sv-hero-rise font-[var(--font-outfit)] text-[26px] md:text-[32px] font-black leading-[1.1] tracking-tight"
            style={{ animationDelay: '0.08s' }}
          >
            <span className="sv-hero-text">Discover vibe-coded</span>
            <br />
            <span className="text-text-high">projects that stay alive.</span>
          </h1>
          <p
            className="sv-hero-rise text-[13.5px] text-text-medium leading-relaxed max-w-xl"
            style={{ animationDelay: '0.16s' }}
          >
            바이브 코딩 프로젝트 레퍼런스북, 당신의 프로젝트를 업로드하고 시장의
            반응을 확인하세요.
          </p>
        </div>
      </div>
    </section>
  )
}
