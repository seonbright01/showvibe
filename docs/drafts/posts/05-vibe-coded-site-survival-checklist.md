---
title: 내 vibe-coded 사이트 살아남기 — SEO·도메인·운영 25가지 체크리스트
slug: vibe-coded-site-survival-checklist
category: tutorial
excerpt: AI로 만든 사이트가 출시 후에도 살아남으려면? 도메인·SEO·운영·콘텐츠·법무까지 25가지 체크리스트로 정리한 인디 빌더 실전 가이드.
coverImageUrl: ""
imagePrompt: |
  Scene: A tall standing parchment scroll on a wooden lectern in a vaulted gothic library, half-unrolled, with handwritten check-mark glyphs cascading down its length (illegible script, just the rhythm of marks). Beside the scroll, a young sapling with delicately detailed leaves grows defiantly from cracked stone flooring, reaching upward toward a strong shaft of light pouring through a high arched stained-glass window. Botanical illustration sensibility for the sapling. Background: rows of bookshelves recede into deep ink-black shadow.

  Style: Black ink pen drawing on aged ivory paper. Dense cross-hatching and stippling. Dramatic chiaroscuro with strong directional light beams piercing darkness. Bernie Wrightson and Gustave Doré influence — gothic romantic etching aesthetic. 19th-century engraving with intricate linework. Monochrome black and white only — no color. No text, no logos. 1200x630 cinematic horizontal composition. Output constraint: final file size must be 5 MB or less — export as JPEG (quality 85) or compressed PNG.
publish: false
---

# 내 vibe-coded 사이트 살아남기 — SEO·도메인·운영 25가지 체크리스트

AI 코딩 도구로 사이트를 만드는 데 1주일이면 충분합니다. 그러나 **출시 후 1개월 안에 80%는 방문자 0인 채로 사라집니다.** 이유는 단순합니다 — 만드는 데 모든 에너지를 쓰고, 운영·발견·SEO를 안 하니까요.

이 체크리스트는 인디 빌더가 vibe-coded 사이트를 출시하고 살려두는 데 필요한 25가지 항목입니다. 출시 전·직후·1주차·1개월차로 나눠 정리했습니다.

## A. 출시 전 (5가지) — "런칭 버튼 누르기 전"

### 1. 도메인은 짧고 의미 있게

- 5~12자 권장
- 영어 단어 또는 합성어 (예: showvibe, lovable, vercel)
- `.com` 우선, 안 되면 `.app` `.io` `.ai` 차선
- 한국 시장 우선이면 `.kr`도 OK이지만 글로벌 확장은 어려움

### 2. SSL (HTTPS) 자동 적용 확인

- Vercel·Netlify·Cloudflare는 자동 처리
- 자체 서버라면 Let's Encrypt 적용 필수
- HTTP로 노출되면 Google이 색인 거부

### 3. 메타 태그 기본 세팅

- `<title>` — 60자 이내, 키워드 포함
- `<meta name="description">` — 150자 이내, 페이지 요약
- 페이지마다 다르게 — 동일 메타는 SEO 감점

### 4. Open Graph (OG) 이미지

- 1200x630px 권장
- 도메인·로고·핵심 가치 한 줄 포함
- 트위터·카카오톡·슬랙 공유 시 미리보기에 노출
- 없으면 빈 칸·깨진 이미지로 보여서 클릭률 ↓

### 5. 모바일 대응 확인

- 작은 화면(360px)에서 가로 스크롤 안 생기는지
- 버튼·폰트가 너무 작지 않은지
- 한국 트래픽의 70% 이상이 모바일

## B. 출시 직후 (8가지) — "런칭 첫날"

### 6. Google Search Console 등록

- search.google.com/search-console
- 도메인 또는 URL 접두어로 속성 추가
- HTML 파일 또는 메타 태그로 소유권 확인

### 7. 네이버 웹마스터도구 등록

- searchadvisor.naver.com
- 한국 트래픽의 25%는 네이버 — 무시할 수 없음
- 등록 방식은 GSC와 거의 동일

### 8. sitemap.xml 생성·제출

- Next.js라면 `app/sitemap.ts` 로 자동 생성
- GSC와 네이버 양쪽에 제출
- 동적 페이지(상세 페이지)도 포함되는지 확인

### 9. robots.txt 작성

- 검색봇 허용 영역 명시
- `/admin` `/api` `/account` 같은 비공개 영역은 Disallow
- AI 학습 봇(GPTBot 등) 차단 여부도 결정

### 10. analytics 설치

- Google Analytics 4 (무료, 한국 시장도 OK)
- 또는 Plausible·Umami (개인정보 친화적, 유료)
- 첫 방문자가 어느 채널에서 오는지 보는 게 핵심

### 11. 첫 트위터·X 공유

- 스크린샷 + 30초 데모 영상
- "어떤 문제를 해결하는지" 한 줄 요약
- 인디 빌더 해시태그 활용 (#buildinpublic 등)

### 12. 인디 빌더 디렉토리 등록

- Product Hunt (출시 24시간 노출)
- ShowVibe (한국 vibe-coded 사이트 큐레이션)
- Indie Hackers, BetaList 등 영어권

### 13. 커뮤니티 게시 (1곳만)

- Reddit `r/SideProject`, `r/SaaS`
- 한국이면 디스콰이엇·인디핵커즈 한국 채널
- **여러 곳에 동시 도배는 역효과**, 1곳에 정성껏

## C. 1주차 (6가지) — "트래픽 들어오기 시작"

### 14. GSC 색인 요청

- 주요 페이지 5–10개 수동 색인 요청
- 색인 안 되면 SEO 시작 자체가 안 됨

### 15. Core Web Vitals 점검

- PageSpeed Insights에서 점수 확인
- LCP < 2.5s, FID < 100ms, CLS < 0.1 목표
- 이미지 최적화 (`next/image` 또는 webp 변환)

### 16. 이메일 수집 시작

- 랜딩에 단일 input "이메일로 업데이트 받기"
- 트래픽 → 이메일 변환이 SaaS의 진짜 가치
- ConvertKit·Resend·Loops 같은 도구

### 17. 첫 5명에게 1:1 메시지

- 친구·동료에게 직접 보내고 솔직한 피드백 요청
- 실제 사용 모습을 영상으로 받으면 최고 (5명만 해도 패턴 보임)

### 18. 분석 — 이탈 지점 파악

- GA4의 "페이지 평균 체류 시간"
- Hotjar·Microsoft Clarity로 히트맵 (무료)
- 어디서 사람들이 떠나는지 = 다음에 고칠 것

### 19. 첫 버그·UX 수정 사이클

- 출시 후 보고된 버그·UX 이슈를 1주 안에 처리
- 빠른 수정 = 사용자 신뢰

## D. 1개월차 (6가지) — "콘텐츠로 트래픽 키우기"

### 20. 매거진/블로그 시작

- 주제와 관련된 글 5~10개 발행 (각 1500자 이상)
- AdSense 심사 통과 핵심
- 키워드는 검색량보다 **검색 의도** 명확한 것 우선

### 21. internal link 구조

- 모든 글에서 다른 글로 1~2개 링크
- 메인 페이지 → 상세 페이지 → 카테고리 페이지의 3층 구조
- 검색엔진 크롤러에 사이트 구조 전달

### 22. 백링크 1–3개

- 자연스러운 링크가 검색 순위에 큰 영향
- ShowVibe·Product Hunt 같은 디렉토리 링크는 dofollow 여부 확인
- 게스트 포스트·인터뷰 1건씩이라도 시도

### 23. 법무 페이지 구비

- 이용약관 (terms)
- 개인정보처리방침 (privacy)
- 면책조항 (disclaimer)
- 한국 사용자 대상이면 PIPA·KISA 준수
- AdSense 심사 시 필수 점검 항목

### 24. 결제·구독 도입 (해당 시)

- Stripe 또는 Toss Payments
- 한국이면 Toss·Kakao Pay 강력 권장
- 무료 → 유료 전환 흐름을 첫날부터 설계

### 25. 폐기 시점 판단 기준 정하기

- 4주 차에 방문자가 매주 늘고 있나?
- 이메일·결제 한 건이라도 있나?
- **둘 다 No면 폐기·전환 결정** — 미련은 시간 낭비

## 출시 후 통계로 본 "진짜 살아남는 사이트"의 공통점

ShowVibe가 매일 모니터링하는 vibe-coded 사이트들 중, 출시 후 3개월 이상 살아남는 사이트의 공통점은 다음 셋입니다.

1. **출시 첫 주에 사용자 5명 이상의 직접 피드백**을 받음
2. **2주차 안에 첫 결제 또는 첫 100 이메일 수집**
3. **1개월 안에 매거진/블로그 글 3편 이상**

기술 스택보다, 마케팅 예산보다, **이 세 가지가 가장 강한 생존 신호**입니다.

## ShowVibe에 등록하면

ShowVibe는 한국 시장에서 vibe-coded 사이트의 첫 노출 경로 중 하나입니다. [Submit](/submit) 에서 본인 사이트를 등록하면 자동 분류 후 [Explore](/explore) 와 [Chart](/chart) 에 노출됩니다. 등록은 무료고, 도메인 인증을 통해 본인 사이트의 분석 텍스트를 직접 편집할 수 있습니다.

---

**이어 읽기**
- [바이브코딩이란 무엇인가?](/posts/what-is-vibe-coding-2026)
- [AI 코딩 도구 7종 완벽 비교](/posts/ai-coding-tools-comparison-2026)
- [AI로 SaaS 만들기 1주일 7가지 패턴](/posts/ai-saas-7-day-case-studies)
