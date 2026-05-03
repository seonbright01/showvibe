import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "이용약관 — ShowVibe",
  description: "ShowVibe 서비스 이용약관",
};

const LAST_UPDATED = "2026.05.03";

export default function TermsPage() {
  return (
    <AppShell>
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-12">
          <header className="mb-10 pb-6 border-b border-stroke">
            <h1 className="text-3xl font-bold mb-2 font-[var(--font-outfit)]">
              이용약관
            </h1>
            <p className="text-sm text-text-muted">
              최종 수정일: {LAST_UPDATED}
            </p>
          </header>

          <div className="space-y-8 text-[15px] leading-[1.75] text-text-medium">
            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                제1조 (목적)
              </h2>
              <p>
                본 약관은 ShowVibe(이하 &quot;서비스&quot;)가 제공하는 바이브코딩
                프로젝트 발견·분류·공유 플랫폼의 이용 조건과 절차, 회사와 회원의
                권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                제2조 (정의)
              </h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>
                  &quot;서비스&quot;란 ShowVibe가 제공하는 모든 웹 기반 기능을
                  의미합니다.
                </li>
                <li>
                  &quot;회원&quot;이란 본 약관에 동의하고 가입한 자를 의미합니다.
                </li>
                <li>
                  &quot;프로젝트&quot;란 서비스에 등록된 웹사이트, 서비스, 앱 등
                  바이브코딩으로 제작된 결과물을 의미합니다.
                </li>
                <li>
                  &quot;제작자&quot;란 프로젝트의 저작자 또는 운영자로서 Claim
                  절차를 통해 인증된 회원을 의미합니다.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                제3조 (약관의 효력 및 변경)
              </h2>
              <p>
                본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다. 회사는
                필요 시 약관을 변경할 수 있으며, 변경된 약관은 시행일 7일 전
                서비스 내 공지를 통해 통지합니다. 회원에게 불리한 변경의 경우
                30일 전 통지합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                제4조 (서비스의 제공)
              </h2>
              <p className="mb-3">
                서비스는 무료로 제공되며, 광고 기반으로 운영됩니다. 다음 기능을
                포함합니다.
              </p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>바이브코딩 프로젝트 자동 발견·수집·분석</li>
                <li>프로젝트 검색·탐색·차트·컬렉션</li>
                <li>제작자 프로필, 댓글, 저장, 공유</li>
                <li>제작자 직접 등록(Submit) 및 인증(Claim)</li>
                <li>뉴스레터 구독</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                제5조 (자동 수집 및 게시)
              </h2>
              <p>
                서비스는 공개된 웹페이지, GitHub, Hacker News, 검색 API 등으로
                부터 바이브코딩 관련 사이트를 자동으로 발견하여 인덱싱합니다.
                수집 시 robots.txt 및 사이트 정책을 준수하며, 자세한 정책은
                <a
                  href="/legal/bot-policy"
                  className="text-coral hover:text-coral-hover ml-1"
                >
                  Bot 정책
                </a>
                을 따릅니다. 본인의 사이트 노출을 원치 않을 경우 삭제 요청을
                접수할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                제6조 (회원의 의무)
              </h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>타인의 정보를 도용하지 않습니다.</li>
                <li>
                  서비스의 운영을 방해하거나 자동화 도구로 비정상적 트래픽을
                  발생시키지 않습니다.
                </li>
                <li>
                  타인의 저작권, 상표권, 명예 등 권리를 침해하는 콘텐츠를 게시
                  하지 않습니다.
                </li>
                <li>
                  Claim 절차에서 허위 인증을 시도하지 않습니다 (위반 시 영구
                  차단 및 법적 조치).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                제7조 (광고)
              </h2>
              <p>
                서비스는 운영을 위해 Google AdSense 등의 디스플레이 광고와
                Sponsored 콘텐츠를 게재할 수 있으며, Sponsored 콘텐츠는
                &quot;Sponsored&quot; 라벨로 명확히 구분됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                제8조 (지식재산권)
              </h2>
              <p>
                서비스가 자체 생성한 분석 텍스트, UI, 로고는 ShowVibe에 귀속
                됩니다. 회원이 등록한 콘텐츠의 저작권은 회원에게 있으며, 회원은
                서비스 운영에 필요한 범위 내에서 이를 사용할 권한을 회사에
                부여합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                제9조 (서비스 면책)
              </h2>
              <p>
                자세한 면책 사항은
                <a
                  href="/legal/disclaimer"
                  className="text-coral hover:text-coral-hover ml-1"
                >
                  면책조항
                </a>
                을 참고하세요. 천재지변, 외부 API 장애 등 회사의 합리적 통제
                범위를 벗어난 사유로 인한 서비스 중단에 대해 회사는 책임을 지지
                않습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                제10조 (준거법 및 분쟁 해결)
              </h2>
              <p>
                본 약관은 대한민국 법령에 따라 해석됩니다. 서비스와 관련하여
                분쟁이 발생할 경우 회사 본점 소재지 관할 법원을 1심 관할 법원
                으로 합니다.
              </p>
            </section>
          </div>
        </article>
      </main>
    </AppShell>
  );
}
