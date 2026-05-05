import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Bot 정책 — ShowVibe",
  description:
    "ShowVibeBot의 User-Agent, robots.txt 준수, 크롤링 빈도 및 차단 방법",
};

const LAST_UPDATED = "2026.05.03";

export default function BotPolicyPage() {
  return (
    <AppShell>
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-12">
          <header className="mb-10 pb-6 border-b border-stroke">
            <h1 className="text-3xl font-bold mb-2 font-[var(--font-outfit)]">
              Bot 및 데이터 수집 정책
            </h1>
            <p className="text-sm text-text-muted">
              최종 수정일: {LAST_UPDATED}
            </p>
          </header>

          <div className="space-y-8 text-[15px] leading-[1.75] text-text-medium">
            <section>
              <p>
                ShowVibe는 바이브코딩 결과물을 발견·인덱싱하기 위해 자체 크롤러
                <strong className="text-text-high"> ShowVibeBot</strong>을
                운영합니다. 본 정책은 ShowVibeBot의 동작 방식, 사이트 운영자의
                권리, 차단 방법을 안내합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                1. User-Agent
              </h2>
              <p className="mb-3">
                ShowVibeBot은 모든 요청에 다음 User-Agent를 포함합니다.
              </p>
              <pre className="bg-bg-elevated border border-stroke rounded-lg px-4 py-3 text-[13px] text-text-high font-mono overflow-x-auto">
                <code>ShowVibeBot/1.0 (+https://showvibe.app/legal/bot-policy)</code>
              </pre>
              <p className="mt-3">
                서버 액세스 로그에서 위 문자열로 ShowVibeBot의 방문을 식별할 수
                있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                2. robots.txt 준수
              </h2>
              <p>
                ShowVibeBot은 RFC 9309(Robots Exclusion Protocol)를 따릅니다.
                사이트의 <code className="text-text-high">/robots.txt</code>{" "}
                파일에 다음 규칙을 추가하면 ShowVibeBot의 접근을 차단할 수
                있습니다.
              </p>
              <pre className="bg-bg-elevated border border-stroke rounded-lg px-4 py-3 text-[13px] text-text-high font-mono overflow-x-auto mt-3">
                <code>{`User-agent: ShowVibeBot
Disallow: /`}</code>
              </pre>
              <p className="mt-3">
                특정 경로만 차단하려면{" "}
                <code className="text-text-high">Disallow</code> 값을 변경하세요.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                3. 크롤링 동작 방식
              </h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>
                  최초 방문 시 가능한 경우{" "}
                  <code className="text-text-high">HEAD</code> 메서드를 우선
                  시도하여 부하를 최소화합니다.
                </li>
                <li>
                  같은 호스트에 대해 분당 최대 6회 이내로 요청 간격을 둡니다
                  (rate limit).
                </li>
                <li>
                  4xx/5xx 응답을 반복 수신하면 일정 기간 재방문을 자동 중단
                  합니다.
                </li>
                <li>
                  공개된 메타데이터(HTML title, meta description, Open Graph,
                  oEmbed)만 수집합니다. 비공개 페이지/로그인 후 페이지는 수집
                  하지 않습니다.
                </li>
                <li>
                  스크린샷은 최초 발견 후 고득점 후보에 한해 1회 생성하며, 추후
                  에는 30일 이상 간격으로만 갱신합니다.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                4. 수집 데이터의 사용
              </h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>
                  공개 인덱스(검색·차트·컬렉션)에 사이트 정보를 표시합니다.
                </li>
                <li>AI 분석 모델의 입력으로 사용합니다.</li>
                <li>
                  서비스의 통계·연구 목적으로 비식별화된 형태로 활용할 수
                  있습니다.
                </li>
                <li>
                  제3자에게 원본 콘텐츠를 그대로 제공하거나 판매하지 않습니다.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                5. 사이트 노출 거부 / 삭제 요청
              </h2>
              <p>robots.txt 차단 외에도 다음 방법을 사용할 수 있습니다.</p>
              <ul className="list-disc pl-6 space-y-1.5 mt-3">
                <li>
                  <a
                    href="/takedown?type=removal"
                    className="text-coral hover:text-coral-hover"
                  >
                    Site Removal Request
                  </a>
                  : 즉시 인덱스에서 사이트 제거를 요청합니다.
                </li>
                <li>
                  <a
                    href="/takedown"
                    className="text-coral hover:text-coral-hover"
                  >
                    Copyright / Takedown Request
                  </a>
                  : 저작권 침해 신고.
                </li>
                <li>
                  <a
                    href="/takedown?type=privacy"
                    className="text-coral hover:text-coral-hover"
                  >
                    Privacy Report
                  </a>
                  : 개인정보 노출 신고.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                6. 문의
              </h2>
              <p>
                ShowVibeBot 관련 문의나 비정상적인 트래픽이 관측될 경우
                <a
                  href="/contact"
                  className="text-coral hover:text-coral-hover ml-1"
                >
                  Contact
                </a>
                를 통해 알려주세요. 즉시 차단 또는 동작 조정을 검토합니다.
              </p>
            </section>
          </div>
        </article>
      </main>
    </AppShell>
  );
}
