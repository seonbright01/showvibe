import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "개인정보처리방침 — ShowVibe",
  description: "ShowVibe가 수집·처리하는 개인정보의 항목, 목적, 보관 기간",
};

const LAST_UPDATED = "2026.05.07";
const EFFECTIVE_DATE = "2026.05.07";

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
              시행일: {EFFECTIVE_DATE} · 최종 수정일: {LAST_UPDATED}
            </p>
          </header>

          <div className="space-y-8 text-[15px] leading-[1.75] text-text-medium">
            <section>
              <p>
                ShowVibe(이하 &quot;서비스&quot;)는 개인정보 보호법, 정보통신망법
                등 관련 법령을 준수하며, 회원·비회원 이용자의 개인정보를 안전
                하게 보호하기 위해 다음과 같은 방침을 운영합니다. 본 방침은
                ShowVibe 웹사이트 및 관련 서비스 전반에 적용됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                1. 수집하는 개인정보 항목
              </h2>
              <p className="mb-3">
                서비스는 다음의 최소한의 정보만 수집·처리합니다.
              </p>
              <p className="mb-2">
                <strong className="text-text-high">
                  가. 회원이 직접 제공하는 정보
                </strong>
              </p>
              <ul className="list-disc pl-6 space-y-1.5 mb-4">
                <li>
                  필수(이메일 가입): 이메일 주소, 비밀번호(단방향 암호화 저장)
                </li>
                <li>
                  필수(소셜 로그인): OAuth 제공자(GitHub, Google)가 전달하는
                  이메일, 이름, 프로필 이미지 URL, 제공자 고유 ID
                </li>
                <li>
                  선택: 닉네임, 자기소개, 프로필 이미지(회원이 직접 입력)
                </li>
                <li>
                  선택(Claim 시): 도메인 소유 인증을 위한 메타태그·DNS·GitHub
                  계정 정보
                </li>
              </ul>
              <p className="mb-2">
                <strong className="text-text-high">
                  나. 서비스 이용 과정에서 자동 생성되는 정보
                </strong>
              </p>
              <ul className="list-disc pl-6 space-y-1.5 mb-4">
                <li>
                  IP 주소, User-Agent, 접속 시간, 방문 페이지, 쿠키 식별자,
                  디바이스 정보
                </li>
                <li>댓글·좋아요·저장·신고 등 활동 로그</li>
              </ul>
              <p className="mb-2">
                <strong className="text-text-high">
                  다. 처리하지 않는 정보
                </strong>
              </p>
              <p>
                주민등록번호, 휴대전화번호, 결제정보 등 민감정보·고유식별정보는
                일체 수집하지 않습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                2. 개인정보 수집·이용 목적
              </h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>회원 식별 및 본인 인증(계약 이행)</li>
                <li>서비스 제공 및 콘텐츠 추천(계약 이행)</li>
                <li>제작자 인증(Claim) 및 권한 부여</li>
                <li>스팸·어뷰징 방지, 분쟁 대응(정당한 이익)</li>
                <li>서비스 개선을 위한 통계 분석(개인 식별 정보 제외)</li>
                <li>법령에 따른 의무 이행</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                3. 만 14세 미만 아동의 개인정보
              </h2>
              <p>
                본 서비스는 만 14세 이상을 대상으로 하며, 만 14세 미만 아동의
                회원가입을 허용하지 않습니다. 회사가 만 14세 미만임을 인지한
                경우 즉시 해당 계정과 관련 개인정보를 삭제합니다. 만 14세 미만
                자녀의 정보가 등록되었음을 인지하신 보호자께서는
                <a
                  href="/contact"
                  className="text-coral hover:text-coral-hover ml-1"
                >
                  Contact
                </a>
                를 통해 신고해주시기 바랍니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                4. 쿠키 및 광고 개인화
              </h2>
              <p className="mb-3">서비스는 다음 목적으로 쿠키를 사용합니다.</p>
              <ul className="list-disc pl-6 space-y-1.5 mb-3">
                <li>
                  <strong className="text-text-high">필수 쿠키:</strong> 로그인
                  세션 유지, CSRF 보호
                </li>
                <li>
                  <strong className="text-text-high">분석 쿠키:</strong>{" "}
                  익명화된 트래픽·사용 패턴 분석
                </li>
                <li>
                  <strong className="text-text-high">광고 쿠키:</strong> Google
                  AdSense 등 제3자 광고 네트워크가 광고 게재·개인화를 위해 사용
                </li>
              </ul>
              <p className="mb-2">
                <strong className="text-text-high">광고 개인화 거부</strong> —
                회원은 다음 방법으로 개인화 광고를 거부할 수 있으며, 거부 시에도
                비개인화 일반 광고는 계속 표시됩니다.
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <a
                    href="https://adssettings.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-coral hover:text-coral-hover"
                  >
                    Google 광고 설정
                  </a>
                  에서 거부
                </li>
                <li>브라우저 쿠키 차단 설정</li>
                <li>
                  자세한 내용은
                  <a
                    href="https://policies.google.com/technologies/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-coral hover:text-coral-hover ml-1"
                  >
                    Google 광고 정책
                  </a>
                  참조
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                5. 개인정보의 보유 및 파기
              </h2>
              <p className="mb-3">
                회사는 처리 목적이 달성되거나 보유 기간이 경과한 즉시
                개인정보를 파기합니다(전자적 파일은 복구 불가능한 방식으로,
                출력물은 분쇄 또는 소각).
              </p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>
                  계정 정보(이메일·닉네임·프로필): 회원 탈퇴 시 즉시 파기
                </li>
                <li>
                  회원이 작성한 댓글·Submit 콘텐츠: 탈퇴 시 작성자 표시는 익명
                  처리되며, 게시 맥락 보존을 위해 본문은 유지(회원이 일괄 삭제
                  요청 시 즉시 삭제)
                </li>
                <li>좋아요·저장 기록: 탈퇴 시 즉시 파기</li>
                <li>접속 로그·IP·쿠키 식별자: 3개월(통신비밀보호법)</li>
                <li>부정 이용·악성 행위 기록: 1년(분쟁 대응·재가입 차단 목적)</li>
                <li>법령상 보관 의무가 있는 경우 해당 법령에서 정한 기간</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                6. 개인정보 처리 위탁 및 국외 이전
              </h2>
              <p className="mb-3">
                회사는 다음 업체에 일부 처리를 위탁합니다. 위탁 업무·이전
                항목·이전 국가는 다음과 같으며(개인정보 보호법 제28조의8 국외
                이전 고지), 회원은 국외 이전을 거부할 수 있으나 거부 시 서비스
                이용이 제한될 수 있습니다.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-[14px] border border-stroke rounded">
                  <thead className="bg-bg-elevated">
                    <tr>
                      <th className="px-3 py-2 text-left text-text-high font-semibold border-b border-stroke">
                        수탁자
                      </th>
                      <th className="px-3 py-2 text-left text-text-high font-semibold border-b border-stroke">
                        위탁 업무
                      </th>
                      <th className="px-3 py-2 text-left text-text-high font-semibold border-b border-stroke">
                        이전 항목
                      </th>
                      <th className="px-3 py-2 text-left text-text-high font-semibold border-b border-stroke">
                        이전 국가
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 border-b border-stroke">
                        Supabase Inc.
                      </td>
                      <td className="px-3 py-2 border-b border-stroke">
                        인증·DB 호스팅·파일 스토리지
                      </td>
                      <td className="px-3 py-2 border-b border-stroke">
                        회원 정보 전체, 콘텐츠
                      </td>
                      <td className="px-3 py-2 border-b border-stroke">미국</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-b border-stroke">
                        Vercel Inc.
                      </td>
                      <td className="px-3 py-2 border-b border-stroke">
                        웹 호스팅·로그
                      </td>
                      <td className="px-3 py-2 border-b border-stroke">
                        접속 로그, IP
                      </td>
                      <td className="px-3 py-2 border-b border-stroke">
                        미국·글로벌 엣지
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-b border-stroke">
                        Cloudflare Inc.
                      </td>
                      <td className="px-3 py-2 border-b border-stroke">
                        CDN·DDoS·봇 차단(Turnstile)
                      </td>
                      <td className="px-3 py-2 border-b border-stroke">
                        IP, User-Agent
                      </td>
                      <td className="px-3 py-2 border-b border-stroke">
                        미국·글로벌 엣지
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border-b border-stroke">
                        Google LLC
                      </td>
                      <td className="px-3 py-2 border-b border-stroke">
                        AdSense 광고 게재
                      </td>
                      <td className="px-3 py-2 border-b border-stroke">
                        쿠키 식별자, IP, User-Agent
                      </td>
                      <td className="px-3 py-2 border-b border-stroke">
                        미국·글로벌
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">Amazon Web Services</td>
                      <td className="px-3 py-2">이메일 발송(SES)</td>
                      <td className="px-3 py-2">수신 이메일 주소</td>
                      <td className="px-3 py-2">미국</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ul className="list-disc pl-6 space-y-1 mt-3">
                <li>이전 일시: 서비스 이용 과정에서 실시간 이전</li>
                <li>이전 방법: HTTPS 암호화 통신</li>
                <li>
                  보관 기간: 위탁 계약 종료 또는 법령상 보관 기간까지
                </li>
              </ul>
              <p className="mt-3">
                회사는 회원의 별도 동의 없이 위 수탁자 외 제3자에게 개인정보를
                제공하지 않습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                7. 정보주체의 권리와 행사 방법
              </h2>
              <p className="mb-3">
                회원은 언제든지 다음 권리를 행사할 수 있습니다.
              </p>
              <ul className="list-disc pl-6 space-y-1.5 mb-3">
                <li>개인정보 열람 청구</li>
                <li>오류·정정 청구</li>
                <li>삭제 청구(회원 탈퇴 포함)</li>
                <li>처리정지 청구</li>
                <li>동의 철회</li>
                <li>
                  자동화된 결정에 대한 거부·설명 요구(개인정보 보호법
                  제35조의2)
                </li>
              </ul>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>
                  요청 방법: 서비스 내 [계정] 메뉴 또는
                  <a
                    href="/contact"
                    className="text-coral hover:text-coral-hover ml-1"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  처리 기한: 요청 접수일로부터 10일 이내 회신(부득이한 사유로
                  지연 시 사유와 처리 예정일 통지)
                </li>
                <li>
                  거부에 이의가 있는 경우: 한국인터넷진흥원 개인정보침해신고
                  센터(국번없이 ☎ 118, privacy.kisa.or.kr) 또는 개인정보분쟁
                  조정위원회(www.kopico.go.kr / ☎ 1833-6972)에 분쟁조정·신고
                  접수
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                8. AI·자동화된 결정 안내
              </h2>
              <p className="mb-3">
                서비스는 외부 LLM API(OpenAI, Anthropic 등)를 통해 자동 분류·
                요약·품질 점수를 생성합니다.
              </p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>
                  분석 대상: 자동 수집된 공개 콘텐츠(웹페이지 메타, GitHub
                  공개 데이터 등)와 회원이 Submit한 사이트의 URL·메타데이터
                </li>
                <li>
                  분석 비대상: 회원이 직접 입력한 이메일·닉네임·자기소개·댓글은
                  외부 LLM API에 전송되지 않으며, LLM 학습 데이터로 사용되지
                  않습니다.
                </li>
                <li>
                  영향: 콘텐츠 정렬·추천 노출에만 사용되며, 회원 개인의 권리·
                  의무에 직접적 법적 효력을 가하는 결정은 포함하지 않습니다.
                </li>
                <li>
                  회원의 권리: 자동화된 결정의 결과(예: 분류·점수·노출도)에
                  대해 설명 요구·정정·노출 거부·수동 재검토를 요청할 수 있으며,
                  제7조 절차에 따라 행사할 수 있습니다.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                9. 안전성 확보 조치
              </h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>비밀번호 단방향 암호화(Supabase Auth)</li>
                <li>HTTPS 전 구간 암호화 통신</li>
                <li>접근 권한 최소화 및 RLS(Row Level Security) 적용</li>
                <li>정기적인 보안 점검 및 취약점 대응</li>
                <li>개인정보 접근 기록 보관·관리</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                10. 개인정보 보호책임자
              </h2>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>
                  성명·직책: ShowVibe 운영팀 (사업자 등록 후 책임자 성명·직책
                  갱신)
                </li>
                <li>
                  연락처:
                  <a
                    href="/contact"
                    className="text-coral hover:text-coral-hover ml-1"
                  >
                    Contact
                  </a>
                </li>
              </ul>
              <p className="mt-3 mb-2">
                개인정보 침해 신고·상담 또는 분쟁조정은 다음 기관에서 도움
                받으실 수 있습니다.
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  개인정보침해신고센터(privacy.kisa.or.kr / ☎ 118)
                </li>
                <li>
                  개인정보분쟁조정위원회(www.kopico.go.kr / ☎ 1833-6972)
                </li>
                <li>대검찰청 사이버수사과(www.spo.go.kr / ☎ 1301)</li>
                <li>경찰청 사이버수사국(ecrm.cyber.go.kr / ☎ 182)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-text-high mb-3 font-[var(--font-outfit)]">
                11. 처리방침의 변경
              </h2>
              <p>
                회사는 법령·서비스 변경에 따라 본 처리방침을 개정할 수
                있습니다. 변경 시 시행일 7일 전 서비스 내 공지를 통해 통지하며,
                회원에게 불리한 중대한 변경의 경우 시행일 30일 전 별도 통지
                합니다. 본 페이지 상단에 시행일·최종 수정일을 함께 표기합니다.
              </p>
            </section>
          </div>
        </article>
      </main>
    </AppShell>
  );
}
