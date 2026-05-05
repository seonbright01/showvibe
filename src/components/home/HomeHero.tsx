export function HomeHero() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 pt-6">
      <div
        className="sv-hero-glow relative overflow-hidden rounded-2xl border border-stroke bg-gradient-to-br from-bg-surface via-bg-elevated to-bg-surface"
        style={{ minHeight: 180 }}
      >
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
