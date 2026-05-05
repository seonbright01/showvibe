import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "면책조항 — ShowVibe",
  description:
    "ShowVibe의 자동 수집·AI 분석 결과의 정확성·완전성에 관한 면책 안내",
};

const LAST_UPDATED = "2026.05.03";

export default function DisclaimerPage() {
  return (
    <AppShell>
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-12">
          <header className="mb-10 pb-6 border-b border-stroke">
            <h1 className="text-3xl font-bold mb-2 font-[var(--font-outfit)]">
              면책조항
            </h1>
            <p className="text-sm text-text-muted">
              최종 수정일: {LAST_UPDATED}
            </p>
          </header>

          <div className="space-y-8 text-[15px] leading-[1.75] text-text-medium">
            <section>
              <p>
                ShowVibe(이하 &quot;서비스&quot;)는 바이브코딩 결과물의 발견과
                탐색을 돕는 무료 레퍼런스 플랫폼입니다. 서비스 이용에 앞서 다음
                사항을 반드시 확인해주세요.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                1. 자동 수집 데이터의 한계
              </h2>
              <p>
                서비스는 GitHub, Hacker News, 검색 API 및 공개된 웹페이지를
                대상으로 자동 크롤링·인덱싱을 수행합니다. 수집된 정보는 제작자의
                직접 제공이 아닐 수 있으며, 다음과 같은 한계를 가집니다.
              </p>
              <ul className="list-disc pl-6 space-y-1.5 mt-3">
                <li>
                  사이트 제목, 설명, 사용된 도구 추정값은 외부 데이터에 기반한
                  자동 추출 결과로, 실제와 다를 수 있습니다.
                </li>
                <li>
                  사이트 상태(Active / Slow / Archived 등)는 자동 모니터링 결과
                  이며 일시적인 네트워크 이슈로 잘못 표시될 수 있습니다.
                </li>
                <li>
                  사이트의 정상 운영 여부, 보안성, 신뢰성을 보증하지 않습니다.
                </li>
                <li>
                  서비스는 자동 수집된 콘텐츠의 정확성·합법성·저작권 적합성을
                  보증하지 않으며, 콘텐츠가 제3자의 권리를 침해하는 것으로
                  확인된 경우에는{" "}
                  <a
                    href="/legal/copyright"
                    className="text-coral hover:text-coral-hover"
                  >
                    저작권 정책
                  </a>
                  에 따라 신속히 처리합니다.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                2. AI 분석 결과의 추정성
              </h2>
              <p>
                서비스가 제공하는 분석 텍스트(About, 사용된 도구, 카테고리, 품질
                점수 등)는 대규모 언어 모델(LLM)이 생성한{" "}
                <strong className="text-text-high">자동 추정 결과</strong>입니다.
                다음 사항을 유의하세요.
              </p>
              <ul className="list-disc pl-6 space-y-1.5 mt-3">
                <li>
                  AI는 사실과 다른 정보를 생성할 수 있습니다(hallucination).
                </li>
                <li>
                  사용된 AI 코딩 도구(Cursor, Lovable, v0 등) 식별은 외부
                  단서(GitHub 메타데이터, Open Graph, 페이지 구조 등)에 기반한
                  추정이며, 100% 정확하지 않습니다.
                </li>
                <li>
                  AI 분석 결과를 인용하거나 의사결정의 근거로 삼기 전 반드시
                  원본 사이트와 제작자 발표를 확인하시기 바랍니다.
                </li>
                <li>
                  제작자가 Claim한 후에는 본인이 분석 텍스트를 수정·반박할 수
                  있습니다.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                3. 외부 링크
              </h2>
              <p>
                서비스에서 제공되는 외부 사이트 링크는 사용자 편의를 위한 것이며,
                해당 사이트의 콘텐츠, 보안, 운영 정책에 대해 ShowVibe는 어떠한
                책임도 지지 않습니다. 외부 사이트 방문은{" "}
                <strong className="text-text-high">
                  사용자 본인의 자기 책임 하
                </strong>
                에 이루어지며, 외부 사이트의 악성 코드, 피싱, 사기, 개인정보
                침해, 결제 분쟁 등으로 인해 발생하는 어떠한 손해에 대해서도
                ShowVibe는 책임을 지지 않습니다. 링크된 사이트의 운영 주체와
                ShowVibe는 별개의 법인 또는 개인이며, 제휴·보증·인증 관계가
                있음을 의미하지 않습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                4. 상표 및 제휴 관계
              </h2>
              <p>
                서비스에 언급되는 Cursor, Lovable, Replit, Bolt, v0 등 모든 AI
                코딩 도구·서비스 명칭과 상표는 해당 권리자에게 귀속됩니다.
                ShowVibe는 이들 도구·서비스의 제작사와 공식 제휴 관계가 아니며,
                보증·인증을 받지 않았습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                5. 책임 제한
              </h2>
              <p>
                ShowVibe는 무료로 제공되는 베스트 에포트(best-effort) 서비스
                입니다. 서비스 이용 또는 이용 불가, 분석 결과의 부정확성, 외부
                사이트 방문 결과로 인한 어떠한 직간접적 손해에 대해서도 ShowVibe
                는 책임을 지지 않습니다(법령상 강제되는 책임은 제외).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                6. 정정·삭제 요청
              </h2>
              <p>
                자신의 사이트 정보가 잘못 표시되었거나 노출을 원치 않는 경우
                <a
                  href="/takedown"
                  className="text-coral hover:text-coral-hover ml-1"
                >
                  Takedown 요청
                </a>
                또는
                <a
                  href="/claim"
                  className="text-coral hover:text-coral-hover ml-1"
                >
                  Claim
                </a>
                절차를 통해 수정을 요청할 수 있습니다.
              </p>
            </section>

            <section className="mt-10 pt-6 border-t border-stroke">
              <p className="text-sm text-text-muted italic">
                본 면책조항은 외부 법무 검토 전 임시본이며, 사업자 등록 및
                정식 법무 자문 후 정식판으로 업데이트됩니다.
              </p>
            </section>
          </div>
        </article>
      </main>
    </AppShell>
  );
}
