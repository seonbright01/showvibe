import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "면책조항 — ShowVibe",
  description:
    "ShowVibe의 자동 수집·AI 분석 결과의 정확성·완전성에 관한 면책 안내",
};

const LAST_UPDATED = "2026.05.07";
const EFFECTIVE_DATE = "2026.05.07";

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
              시행일: {EFFECTIVE_DATE} · 최종 수정일: {LAST_UPDATED}
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
                  제작자 또는 권리자는 본 면책조항 제6조의 절차를 통해 분석
                  텍스트의 정정·삭제·노출 거부를 요청할 수 있으며, Claim 인증을
                  마친 회원은 본인 사이트의 분석 텍스트를 직접 수정할 수
                  있습니다.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                3. 외부 링크
              </h2>
              <p>
                서비스에서 제공되는 외부 사이트 링크는 이용자의 편의를 위한
                것이며, 해당 사이트의 콘텐츠·보안·운영은 ShowVibe와 무관합니다.
                외부 사이트 방문은 이용자의 판단과 책임 하에 이루어지며, 외부
                사이트로 인한 손해에 대해 회사는 원칙적으로 책임을 지지
                않습니다. 다만 회사가 외부 사이트의 위법성·악성성을 명백히
                인지하였음에도 합리적 기간 내 노출 차단 등 적절한 조치를 취하지
                않은 경우, 회사의 고의 또는 중대한 과실에 대해 관련 법령에 따라
                책임을 부담합니다. 회원이 의심스러운 사이트를 발견한 경우{" "}
                <a
                  href="/takedown"
                  className="text-coral hover:text-coral-hover"
                >
                  Takedown 요청
                </a>
                을 통해 신고해주시기 바랍니다. 링크된 사이트의 운영 주체와
                ShowVibe는 별개이며, 제휴·보증·인증 관계가 있음을 의미하지
                않습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                4. 상표 및 제휴 관계
              </h2>
              <p>
                서비스에 언급되는 Cursor, Lovable, Replit, Bolt, v0, Windsurf
                등 AI 코딩 도구·서비스의 명칭과 상표는 모두 해당 권리자에게
                귀속됩니다. ShowVibe는 이들 도구·서비스의 제작사와 공식 제휴
                관계가 아니며, 보증·인증을 받지 않았습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                5. 책임 제한
              </h2>
              <p className="mb-3">
                ShowVibe는 무료로 제공되는 베스트 에포트(best-effort)
                서비스로서, 다음 범위에서 회사의 책임이 제한됩니다.
              </p>
              <ul className="list-disc pl-6 space-y-1.5 mb-3">
                <li>
                  서비스의 일시적 중단·지연으로 인한 손해(천재지변, 외부 API
                  장애, 정전, 디도스 등 회사가 합리적으로 통제할 수 없는 사유)
                </li>
                <li>
                  자동 수집·AI 분석 결과의 단순 부정확성에 따른 의사결정 결과
                </li>
                <li>외부 사이트 방문 결과로 발생한 부수적·간접적 손해</li>
              </ul>
              <p className="mb-3">
                다만 다음의 경우에는 본 면책이 적용되지 않으며, 회사는 관련
                법령에 따라 책임을 부담합니다.
              </p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>회사의 고의 또는 중대한 과실로 인한 손해</li>
                <li>
                  인격권 침해, 명예훼손 등 강행규정에 따라 면책할 수 없는 책임
                </li>
                <li>
                  약관규제법, 개인정보 보호법, 소비자기본법 등 관계 법령에 따라
                  면책이 제한되는 경우
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                6. 정정·삭제·노출 거부 요청
              </h2>
              <p className="mb-3">
                자신의 사이트 또는 본인이 등장하는 콘텐츠에 대해 다음과 같이
                요청할 수 있으며, 회사는 영업일 기준 7일 이내 처리 결과를
                회신합니다(거절 시 사유 명시, 추가 자료 제출 시 재심 가능).
              </p>
              <ol className="list-decimal pl-6 space-y-1.5">
                <li>
                  <strong className="text-text-high">노출 완전 중단(Takedown)</strong>{" "}
                  — 사이트가 검색·차트·매거진 등 모든 영역에서 제거됩니다 →{" "}
                  <a
                    href="/takedown"
                    className="text-coral hover:text-coral-hover"
                  >
                    /takedown
                  </a>
                </li>
                <li>
                  <strong className="text-text-high">분석 텍스트 정정</strong>{" "}
                  — Claim 없이도 AI 자동 생성 텍스트의 사실 오류만 정정 요청 →{" "}
                  <a
                    href="/contact"
                    className="text-coral hover:text-coral-hover"
                  >
                    /contact
                  </a>
                  (제목: &quot;분석 정정&quot;)
                </li>
                <li>
                  <strong className="text-text-high">제작자 인증 후 직접 편집</strong>{" "}
                  — 인증을 마친 회원은 본인 사이트의 About·도구·카테고리를 직접
                  편집 →{" "}
                  <a href="/claim" className="text-coral hover:text-coral-hover">
                    /claim
                  </a>
                </li>
                <li>
                  <strong className="text-text-high">노출 범위 조정</strong> —
                  특정 영역(예: 매거진 게재)에서만 제외 요청 →{" "}
                  <a
                    href="/contact"
                    className="text-coral hover:text-coral-hover"
                  >
                    /contact
                  </a>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                7. 자동 분류·점수에 대한 이의 제기
              </h2>
              <p>
                회사가 게시한 카테고리, 사용된 도구 추정, 품질 점수, Active /
                Slow / Archived 상태 표시는 모두 자동 알고리즘 또는 LLM의 추정
                결과입니다. 회원은 (1) 분류·점수 산출의 근거 설명 요청,
                (2) 부정확한 분류·상태 표시의 정정 요청, (3) 자동 분류 결과
                노출 거부(원본 사이트 정보만 유지하고 자동 추정 메타는 숨김)를
                요청할 수 있으며, 요청은{" "}
                <a href="/contact" className="text-coral hover:text-coral-hover">
                  Contact
                </a>
                를 통해 접수합니다. 회사는 내부 검토 후 영업일 7일 내 회신
                합니다.
              </p>
            </section>
          </div>
        </article>
      </main>
    </AppShell>
  );
}
