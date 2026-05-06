import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "이용약관 — ShowVibe",
  description: "ShowVibe 서비스 이용약관",
};

const LAST_UPDATED = "2026.05.07";
const EFFECTIVE_DATE = "2026.05.07";

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
              시행일: {EFFECTIVE_DATE} · 최종 수정일: {LAST_UPDATED}
            </p>
          </header>

          <div className="space-y-8 text-[15px] leading-[1.75] text-text-medium">
            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                제1조 (목적)
              </h2>
              <p>
                본 약관은 ShowVibe(이하 &quot;서비스&quot;)가 제공하는 바이브코딩
                프로젝트 발견·분류·공유 플랫폼의 이용 조건과 절차, 운영자와
                회원의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                제2조 (정의)
              </h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>
                  &quot;운영자&quot;란 ShowVibe 서비스를 운영·관리하는 자(이하
                  &quot;회사&quot;)를 의미합니다. 사업자 정보는 본 약관 부칙에
                  별도로 명시합니다.
                </li>
                <li>
                  &quot;서비스&quot;란 운영자가 제공하는 모든 웹 기반 기능을
                  의미합니다.
                </li>
                <li>
                  &quot;회원&quot;이란 본 약관에 동의하고 가입 절차를 마친 자를
                  의미합니다.
                </li>
                <li>
                  &quot;프로젝트&quot;란 서비스에 등록·인덱싱된 웹사이트, 서비스,
                  앱 등 바이브코딩으로 제작된 결과물을 의미합니다.
                </li>
                <li>
                  &quot;제작자&quot;란 프로젝트의 저작자 또는 운영자로서 Claim
                  절차를 통해 인증된 회원을 의미합니다.
                </li>
                <li>
                  &quot;게시물&quot;이란 회원이 서비스에 등록(Submit)하거나
                  작성(댓글, 자기소개 등)한 모든 콘텐츠를 의미합니다.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                제3조 (약관의 효력 및 변경)
              </h2>
              <p className="mb-3">
                본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다. 회사는
                필요 시 약관을 변경할 수 있으며, 변경된 약관은 시행일 7일 전
                서비스 내 공지 또는 이메일로 통지합니다. 회원에게 불리한 변경의
                경우 시행일 30일 전 별도로 통지합니다.
              </p>
              <p>
                회원이 시행일 전까지 변경에 대한 거부 의사를 표시하지 않으면
                변경된 약관에 동의한 것으로 간주합니다. 회원이 변경에 동의하지
                않는 경우 시행일 전까지 탈퇴할 수 있으며, 탈퇴 전까지는 기존
                약관이 적용됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                제4조 (서비스의 제공)
              </h2>
              <p className="mb-3">
                서비스는 무료로 제공되며, 디스플레이 광고를 통해 운영됩니다.
                회사는 다음 기능을 제공하며, 기능은 운영상 변경·추가·중단될 수
                있습니다.
              </p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>바이브코딩 프로젝트 자동 발견·수집·분석</li>
                <li>프로젝트 검색·탐색·차트</li>
                <li>제작자 프로필, 댓글, 좋아요/저장, 공유</li>
                <li>제작자 직접 등록(Submit) 및 인증(Claim)</li>
                <li>매거진형 자동 분석 글 게재</li>
              </ul>
              <p className="mt-3">
                회사는 시스템 점검, 외부 인프라 장애 등 불가피한 경우 사전 또는
                사후 통지 후 서비스를 일시 중단할 수 있습니다.
              </p>
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
                을 따릅니다. 본인의 사이트 노출을 원치 않을 경우
                <a
                  href="/takedown"
                  className="text-coral hover:text-coral-hover ml-1"
                >
                  Takedown 요청
                </a>
                을 통해 삭제를 요청할 수 있으며, 저작권 침해 신고 및 게시중단
                절차는
                <a
                  href="/legal/copyright"
                  className="text-coral hover:text-coral-hover ml-1"
                >
                  저작권 정책
                </a>
                을 참조해주세요.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                제6조 (회원의 가입 자격 및 제한)
              </h2>
              <ol className="list-decimal pl-6 space-y-1.5">
                <li>
                  본 서비스는 만 14세 이상부터 회원가입이 가능합니다. 회사는 만
                  14세 미만의 가입을 허용하지 않으며, 가입 후 만 14세 미만임이
                  확인된 경우 즉시 계정을 정지하고 관련 정보를 삭제합니다.
                </li>
                <li>
                  회사는 다음의 경우 가입 승낙을 거부하거나 사후 해지할 수
                  있습니다.
                  <ul className="list-disc pl-6 space-y-1 mt-1.5">
                    <li>타인의 정보를 도용한 경우</li>
                    <li>14세 미만 아동이 가입한 경우</li>
                    <li>본 약관 또는 관련 법령을 위반한 사실이 확인된 경우</li>
                    <li>
                      이전에 본 약관 위반으로 이용 정지·해지된 회원이 재가입
                      신청한 경우
                    </li>
                  </ul>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                제7조 (회원의 의무)
              </h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>타인의 정보를 도용하지 않습니다.</li>
                <li>
                  서비스의 운영을 방해하거나 자동화 도구로 비정상적 트래픽을
                  발생시키지 않습니다.
                </li>
                <li>
                  타인의 저작권, 상표권, 명예 등 권리를 침해하는 콘텐츠를
                  게시하지 않습니다.
                </li>
                <li>
                  Claim 절차에서 허위 인증을 시도하지 않습니다.
                </li>
                <li>
                  음란, 폭력, 차별·혐오, 청소년 유해 콘텐츠를 게시·전송하지
                  않습니다.
                </li>
              </ul>
              <p className="mt-3">
                회사는 회원이 본 조의 의무를 위반한 경우 다음 조치를 단계적으로
                적용할 수 있으며, 회원은 통지 수령 후 14일 내
                <a
                  href="/contact"
                  className="text-coral hover:text-coral-hover ml-1"
                >
                  Contact
                </a>
                을 통해 이의를 제기할 수 있습니다.
              </p>
              <ol className="list-decimal pl-6 space-y-1 mt-2">
                <li>1차: 경고 통지 및 해당 게시물 삭제·비공개 처리</li>
                <li>2차: 7일 ~ 30일 이용 정지</li>
                <li>3차: 영구 이용 정지 (반복·악의적 위반 시 법적 조치 병행)</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                제8조 (게시물의 관리 및 임시조치)
              </h2>
              <ol className="list-decimal pl-6 space-y-1.5">
                <li>
                  회원이 게시한 게시물의 권리와 책임은 회원 본인에게 있습니다.
                </li>
                <li>
                  회사는 게시물이 다음에 해당한다고 판단되는 경우 사전 통지
                  없이 삭제·비공개 처리할 수 있습니다.
                  <ul className="list-disc pl-6 space-y-1 mt-1">
                    <li>타인의 명예·사생활·저작권·상표권을 침해하는 경우</li>
                    <li>음란물, 폭력적 내용, 차별·혐오 표현</li>
                    <li>스팸, 광고, 자동화 도구로 작성된 비정상 트래픽</li>
                    <li>관련 법령 또는 본 약관을 위반하는 경우</li>
                  </ul>
                </li>
                <li>
                  제3자로부터 권리 침해 신고가 접수된 경우, 회사는 저작권법
                  제103조 및 관련 법령에 따라 임시조치(게시중단)를 시행할 수
                  있으며, 게시자에게 그 사실을 통지합니다. 자세한 절차는
                  <a
                    href="/legal/copyright"
                    className="text-coral hover:text-coral-hover ml-1"
                  >
                    저작권 정책
                  </a>
                  을 따릅니다.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                제9조 (회원 탈퇴 및 계약 해지)
              </h2>
              <ol className="list-decimal pl-6 space-y-1.5">
                <li>
                  회원은 언제든지 서비스 내 [계정 → 탈퇴] 메뉴 또는
                  <a
                    href="/contact"
                    className="text-coral hover:text-coral-hover ml-1"
                  >
                    Contact
                  </a>
                  를 통해 탈퇴를 신청할 수 있습니다.
                </li>
                <li>
                  탈퇴 시 다음과 같이 처리됩니다.
                  <ul className="list-disc pl-6 space-y-1 mt-1">
                    <li>
                      회원 정보(이메일, 닉네임, 프로필 이미지)는 즉시 삭제
                    </li>
                    <li>
                      회원이 작성한 댓글·Submit 콘텐츠는 작성자 표시를 익명
                      처리한 후 게시 맥락 보존을 위해 유지(원치 않을 경우 탈퇴
                      신청 시 일괄 삭제 요청 가능)
                    </li>
                    <li>Claim된 프로젝트의 인증 권한은 해제</li>
                    <li>
                      법령상 보관 의무가 있는 정보는 개인정보처리방침에 따른
                      별도 기간 동안 보관
                    </li>
                  </ul>
                </li>
                <li>
                  회사는 회원이 제7조의 의무를 중대하게 위반한 경우 사전 통지
                  후 7일 내 이의가 없으면 계약을 해지할 수 있습니다.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                제10조 (광고)
              </h2>
              <p>
                서비스는 운영을 위해 Google AdSense 등의 디스플레이 광고와
                Sponsored 콘텐츠를 게재할 수 있으며, Sponsored 콘텐츠는
                &quot;Sponsored&quot; 라벨로 명확히 구분됩니다. 회원은
                <a
                  href="/legal/privacy"
                  className="text-coral hover:text-coral-hover ml-1"
                >
                  개인정보처리방침
                </a>
                에 안내된 방법으로 광고 개인화 쿠키를 거부할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                제11조 (지식재산권 및 콘텐츠 사용권)
              </h2>
              <p className="mb-3">
                서비스가 자체 생성한 분석 텍스트, UI, 로고는 ShowVibe에
                귀속됩니다. 회원이 등록·작성한 게시물의 저작권은 회원에게
                있습니다.
              </p>
              <p className="mb-3">
                회원은 회사에 다음 범위 내에서 무상·비독점·전세계·서비스 존속
                기간 동안의 사용권을 부여합니다.
              </p>
              <ol className="list-decimal pl-6 space-y-1">
                <li>서비스 화면 내 게시·전시·검색 노출</li>
                <li>서비스 운영·홍보를 위한 미리보기·SNS 공유 카드 생성</li>
                <li>백업·기술적 변환 (이미지 리사이즈, 텍스트 색인화 등)</li>
              </ol>
              <p className="mt-3">
                회원이 게시물을 삭제하거나 탈퇴하면 위 사용권은 즉시 종료되며,
                캐시·백업은 통상 30일 이내 자동 삭제됩니다. 회사는 회원의 사전
                서면 동의 없이 게시물을 제3자에게 재허락하거나 광고 소재로
                가공·판매하지 않습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                제12조 (책임 제한)
              </h2>
              <p>
                자세한 면책 사항은
                <a
                  href="/legal/disclaimer"
                  className="text-coral hover:text-coral-hover ml-1"
                >
                  면책조항
                </a>
                을 참고하세요. 천재지변, 외부 API 장애, 정전, 디도스 등 회사가
                합리적으로 통제할 수 없는 사유로 서비스가 중단되거나 데이터에
                손해가 발생한 경우, 회사는 그 책임이 면제될 수 있습니다. 다만
                회사의 고의 또는 중대한 과실로 인한 손해, 약관규제법·개인정보
                보호법 등 강행규정에 따라 면책할 수 없는 책임에 대해서는
                관련 법령에 따라 책임을 부담합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                제13조 (분쟁조정 및 준거법)
              </h2>
              <p>
                본 약관은 대한민국 법령에 따라 해석됩니다. 서비스와 관련하여
                분쟁이 발생할 경우 회사와 회원은 신의에 따라 성실히 협의하여
                해결합니다. 협의가 어려운 경우 민사소송법상 관할 법원에 제소할
                수 있으며, 회원이 한국에 거주하는 소비자인 경우 회원의 주소지를
                관할하는 법원에서도 소송을 제기할 수 있습니다. 분쟁조정은
                한국인터넷진흥원(KISA) 개인정보분쟁조정위원회 또는 한국소비자원
                등 관계 기관을 통해 신청할 수 있습니다.
              </p>
            </section>

            <section className="mt-10 pt-6 border-t border-stroke">
              <h2 className="text-base font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                부칙 — 운영자 정보
              </h2>
              <ul className="list-disc pl-6 space-y-1 text-sm text-text-medium">
                <li>서비스명: ShowVibe</li>
                <li>운영자: ShowVibe 운영팀</li>
                <li>
                  연락처:
                  <a
                    href="/contact"
                    className="text-coral hover:text-coral-hover ml-1"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  사업자 등록 후 상호·사업자등록번호·대표자·통신판매업
                  신고번호·소재지가 본 부칙에 갱신 게재됩니다.
                </li>
              </ul>
            </section>
          </div>
        </article>
      </main>
    </AppShell>
  );
}
