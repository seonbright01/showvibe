import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "저작권 정책 및 게시중단 절차 — ShowVibe",
  description:
    "ShowVibe의 저작권 침해 신고 절차(한국 저작권법 §103) 및 DMCA designated agent 안내",
};

const LAST_UPDATED = "2026.05.06";

export default function CopyrightPage() {
  return (
    <AppShell>
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-12">
          <header className="mb-10 pb-6 border-b border-stroke">
            <h1 className="text-3xl font-bold mb-2 font-[var(--font-outfit)]">
              저작권 정책 및 게시중단 절차
            </h1>
            <p className="text-sm text-text-muted">
              최종 수정일: {LAST_UPDATED}
            </p>
          </header>

          <div className="space-y-8 text-[15px] leading-[1.75] text-text-medium">
            <section>
              <p>
                ShowVibe(이하 &quot;서비스&quot;)는 사용자 및 자체 크롤러가 등록·
                수집한 사이트의 Open Graph 이미지, 스크린샷, 제목, 설명, 자동
                추정 메타데이터 등을 참조용으로 보관·게시합니다. 본 정책은
                저작권 침해가 발생하였다고 판단될 때의 신고 절차와 서비스의
                대응 원칙을 안내합니다. 정당한 권리자의 요청에 대해서는 법령이
                정하는 절차에 따라 신속히 처리합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                1. 한국 저작권법 §103 게시중단 절차
              </h2>
              <p className="mb-3">
                대한민국 저작권법 제103조(복제·전송의 중단)에 따라 권리자는
                자신의 저작물이 무단 복제·전송되고 있다고 판단되는 경우 서비스
                에 게시중단을 요청할 수 있습니다.
              </p>

              <h3 className="text-base font-semibold text-text-high mt-5 mb-2">
                1-1. 신고 방법
              </h3>
              <p className="mb-3">
                전용 이메일{" "}
                <a
                  href="mailto:copyright@showvibe.app"
                  className="text-coral hover:text-coral-hover"
                >
                  copyright@showvibe.app
                </a>{" "}
                또는 서비스 내{" "}
                <a
                  href="/contact"
                  className="text-coral hover:text-coral-hover"
                >
                  Contact
                </a>
                를 통해 접수해주세요.
              </p>

              <h3 className="text-base font-semibold text-text-high mt-5 mb-2">
                1-2. 신고 시 포함해야 할 정보
              </h3>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>저작권자(또는 정당하게 위임받은 대리인)의 신원 정보</li>
                <li>
                  침해되었다고 주장하는 콘텐츠의 위치(서비스 내 URL) — 가능
                  하면 사이트 ID 또는 페이지 캡처 첨부
                </li>
                <li>
                  본인이 해당 저작물의 권리자임을 소명할 수 있는 자료
                  (저작물 등록증, 원본 파일 메타데이터, 소셜 계정 등)
                </li>
                <li>신고자 연락처(이메일·전화)</li>
                <li>
                  &quot;신고 내용이 사실과 다를 경우 발생하는 모든 책임은
                  본인에게 있음&quot;을 인정하는 자필 또는 전자 서명
                </li>
              </ul>

              <h3 className="text-base font-semibold text-text-high mt-5 mb-2">
                1-3. 처리 SLA
              </h3>
              <p>
                위 요건이 모두 갖추어진 신고에 대해서는{" "}
                <strong className="text-text-high">
                  접수 후 영업일 기준 7일 이내
                </strong>{" "}
                해당 콘텐츠의 노출을 중단하거나 인덱스에서 제거합니다. 자료
                보완이 필요한 경우 추가 영업일이 소요될 수 있으며, 처리 결과는
                신고자에게 이메일로 회신합니다.
              </p>

              <h3 className="text-base font-semibold text-text-high mt-5 mb-2">
                1-4. 복원(재게시) 요청
              </h3>
              <p>
                게시중단 통보를 받은 게시자는 자신의 게시물이 정당한 권리에
                기반하거나 인용·공정이용 범위 내에 있다고 판단할 경우, 동일한
                채널을 통해{" "}
                <strong className="text-text-high">복원 요청서</strong>를 제출
                할 수 있습니다. 복원 요청에는 게시자의 신원, 게시물 위치,
                권리 보유 또는 적법성 소명 자료, 자필/전자 서명이 포함되어야
                합니다. 서비스는 복원 요청을 검토하여 7일 이내에 결과를
                통지합니다.
              </p>

              <h3 className="text-base font-semibold text-text-high mt-5 mb-2">
                1-5. 형사상 책임 고지
              </h3>
              <p>
                저작권법 제103조 제6항 및 형법 제156조에 따라, 본인 권리가
                아닌 저작물에 대해 게시중단을 허위로 요청하거나 정당한 게시물
                의 복원을 허위로 요청하는 경우 형사 처벌 및 민사 손해배상
                책임을 부담할 수 있음을 알려드립니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                2. DMCA Designated Agent 절차 (US 사용자 대상)
              </h2>
              <p className="mb-3">
                서비스는 미국 17 U.S.C. § 512(c) safe harbor 적용을 받기 위해
                DMCA designated agent를 미국 저작권청(U.S. Copyright Office)에
                등록할 예정입니다(사업자 등록 후 게시 예정). 등록이 완료되면
                agent의 성명·주소·이메일·전화번호를 본 페이지와 별도 약관
                페이지에 게시하겠습니다.
              </p>

              <h3 className="text-base font-semibold text-text-high mt-5 mb-2">
                2-1. 잠정 신고 채널
              </h3>
              <p className="mb-3">
                designated agent 등록이 완료되기 전까지는 위 한국 절차와
                동일하게{" "}
                <a
                  href="mailto:copyright@showvibe.app"
                  className="text-coral hover:text-coral-hover"
                >
                  copyright@showvibe.app
                </a>{" "}
                으로 접수하실 수 있으며, 영문으로 작성된 DMCA 형식의 신고도
                동일하게 처리합니다.
              </p>

              <h3 className="text-base font-semibold text-text-high mt-5 mb-2">
                2-2. DMCA Takedown Notice 권장 형식 (English)
              </h3>
              <p className="mb-3">
                A valid DMCA takedown notice should include the following
                elements as required by 17 U.S.C. § 512(c)(3):
              </p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>
                  Identification of the copyrighted work claimed to have been
                  infringed
                </li>
                <li>
                  Identification of the allegedly infringing material and the
                  URL on the service
                </li>
                <li>
                  Contact information of the complaining party (name, address,
                  phone, email)
                </li>
                <li>
                  A statement that the complaining party has a good faith
                  belief that the use is not authorized
                </li>
                <li>
                  A statement, under penalty of perjury, that the information
                  is accurate and the complaining party is authorized to act
                </li>
                <li>
                  Physical or electronic signature of the copyright owner or
                  authorized agent
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                3. 자동 수집 및 캐싱 정책
              </h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>
                  서비스의 크롤러 ShowVibeBot은 RFC 9309(robots.txt)을 준수
                  합니다. 자세한 내용은{" "}
                  <a
                    href="/legal/bot-policy"
                    className="text-coral hover:text-coral-hover"
                  >
                    Bot 정책
                  </a>{" "}
                  을 참고하세요.
                </li>
                <li>
                  사이트의 Open Graph 이미지·스크린샷·제목·설명은 출처를
                  연결한 상태로 인용·참조 목적에 한해 보관되며, 합리적인 fair
                  use / 공정이용 범위 내에서만 표시됩니다.
                </li>
                <li>
                  권리자가 1조의 절차에 따라 삭제를 요청하는 경우 즉시
                  인덱스·캐시·스크린샷·OG 이미지를 함께 제거합니다.
                </li>
                <li>
                  사용자가 직접 등록(Submit) 또는 Claim한 사이트의 콘텐츠는
                  자동 갱신 파이프라인이 덮어쓰지 않습니다(fill-if-empty 정책).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                4. 연락처
              </h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>
                  저작권 신고 전용:{" "}
                  <a
                    href="mailto:copyright@showvibe.app"
                    className="text-coral hover:text-coral-hover"
                  >
                    copyright@showvibe.app
                  </a>
                </li>
                <li>
                  일반 문의:{" "}
                  <a
                    href="/contact"
                    className="text-coral hover:text-coral-hover"
                  >
                    /contact
                  </a>
                </li>
                <li>회사명·사업자등록번호·대표자: (사업자 등록 후 게시 예정)</li>
              </ul>
            </section>

            <section className="mt-10 pt-6 border-t border-stroke">
              <p className="text-sm text-text-muted italic">
                본 정책은 외부 법무 검토 전 임시본이며, 사업자 등록 및 정식
                법무 자문 후 정식판으로 업데이트됩니다.
              </p>
            </section>
          </div>
        </article>
      </main>
    </AppShell>
  );
}
