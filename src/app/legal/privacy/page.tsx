import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "개인정보처리방침 — ShowVibe",
  description: "ShowVibe가 수집·처리하는 개인정보의 항목, 목적, 보관 기간",
};

const LAST_UPDATED = "2026.05.03";

export default function PrivacyPage() {
  return (
    <AppShell>
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-12">
          <header className="mb-10 pb-6 border-b border-stroke">
            <h1 className="text-3xl font-bold mb-2 font-[var(--font-outfit)]">
              개인정보처리방침
            </h1>
            <p className="text-sm text-text-muted">
              최종 수정일: {LAST_UPDATED}
            </p>
          </header>

          <div className="space-y-8 text-[15px] leading-[1.75] text-text-medium">
            <section>
              <p>
                ShowVibe(이하 &quot;서비스&quot;)는 개인정보 보호법 등 관련 법령
                을 준수하며, 회원의 개인정보를 안전하게 보호하기 위해 다음과 같은
                방침을 운영합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                1. 수집하는 개인정보 항목
              </h2>
              <p className="mb-3">
                서비스는 다음의 최소한의 정보만 수집합니다.
              </p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>
                  <strong className="text-text-high">필수:</strong> 이메일 주소
                  (회원가입, 뉴스레터 구독)
                </li>
                <li>
                  <strong className="text-text-high">자동 수집:</strong> IP 주소,
                  User-Agent, 쿠키, 접속 시간, 방문 페이지
                </li>
                <li>
                  <strong className="text-text-high">소셜 로그인 시:</strong>{" "}
                  GitHub/Google 등 OAuth 제공자가 전달하는 프로필 정보 (이름,
                  아바타 URL)
                </li>
                <li>
                  <strong className="text-text-high">선택:</strong> 닉네임, 자기
                  소개, 프로필 이미지 (회원이 직접 입력)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                2. 개인정보 수집·이용 목적
              </h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>회원 식별 및 본인 인증</li>
                <li>서비스 제공 및 개인 맞춤 콘텐츠 추천</li>
                <li>제작자 인증(Claim) 및 권한 부여</li>
                <li>스팸·어뷰징 방지 및 법적 분쟁 대응</li>
                <li>주간 뉴스레터 발송 (구독자에 한함)</li>
                <li>서비스 개선을 위한 통계 분석 (개인 식별 정보 제외)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                3. 쿠키 사용
              </h2>
              <p className="mb-3">서비스는 다음 목적으로 쿠키를 사용합니다.</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>
                  <strong className="text-text-high">필수 쿠키:</strong> 로그인
                  세션 유지, CSRF 보호
                </li>
                <li>
                  <strong className="text-text-high">분석 쿠키:</strong> 익명화된
                  트래픽/사용 패턴 분석
                </li>
                <li>
                  <strong className="text-text-high">광고 쿠키:</strong> Google
                  AdSense 등 제3자 광고 네트워크가 광고 개인화를 위해 쿠키를
                  사용할 수 있습니다. 자세한 내용은
                  <a
                    href="https://policies.google.com/technologies/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-coral hover:text-coral-hover ml-1"
                  >
                    Google 광고 정책
                  </a>
                  을 참고하세요. 브라우저 설정에서 쿠키를 거부할 수 있습니다.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                4. 보관 기간
              </h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>회원 정보: 회원 탈퇴 시 즉시 삭제</li>
                <li>접속 로그/IP: 3개월 (통신비밀보호법 준수)</li>
                <li>뉴스레터 구독 정보: 구독 해지 시 즉시 삭제</li>
                <li>법령상 보관 의무가 있는 경우 해당 기간 동안 보관</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                5. 제3자 제공 및 위탁
              </h2>
              <p className="mb-3">
                서비스는 회원의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.
                다만 다음 업체에 일부 처리를 위탁합니다.
              </p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Supabase (인증·DB 호스팅)</li>
                <li>Vercel (웹 호스팅)</li>
                <li>Cloudflare (스팸 방지·CDN)</li>
                <li>Google AdSense (광고 게재, 쿠키 처리)</li>
                <li>Resend 또는 동급 (뉴스레터 발송 — 추후 도입 예정)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                6. 회원의 권리
              </h2>
              <p>
                회원은 언제든지 본인의 개인정보를 열람, 정정, 삭제, 처리 정지를
                요구할 수 있으며, 회원 탈퇴를 통해 모든 정보의 삭제를 요청할 수
                있습니다. 요청은 서비스 내 계정 메뉴 또는
                <a
                  href="/contact"
                  className="text-coral hover:text-coral-hover ml-1"
                >
                  Contact
                </a>
                를 통해 접수해주세요.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                7. 안전성 확보 조치
              </h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>비밀번호 단방향 암호화 (Supabase Auth)</li>
                <li>HTTPS 전 구간 암호화 통신</li>
                <li>접근 권한 최소화 및 RLS(Row Level Security) 적용</li>
                <li>정기적인 보안 점검</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                8. 개인정보 보호책임자
              </h2>
              <p>
                개인정보 관련 문의는
                <a
                  href="/contact"
                  className="text-coral hover:text-coral-hover ml-1"
                >
                  Contact
                </a>
                또는 개인정보 침해 신고/상담은
                한국인터넷진흥원(KISA, privacy.kisa.or.kr)으로 접수해주세요.
              </p>
            </section>
          </div>
        </article>
      </main>
    </AppShell>
  );
}
