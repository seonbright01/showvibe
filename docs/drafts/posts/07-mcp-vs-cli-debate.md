---
title: 「MCP는 죽었다, CLI 만세」 — 2026년 봄을 뜨겁게 만든 에이전트 도구 논쟁
slug: mcp-vs-cli-debate
category: trends
excerpt: "MCP는 죽었다. CLI를 다시 쓰자." 2026년 2~4월 AI 개발자 트위터·블로그를 뜨겁게 달군 토큰 효율 논쟁의 양쪽 입장과, 실무자들이 실제로 채택한 방법.
coverImageUrl: ""
imagePrompt: |
  Scene: Two opposing duelist figures facing each other across a stone floor in a grand vaulted hall. The left figure holds a slim angular terminal-like instrument that emits a faint glow from its screen. The right figure clutches a thick leatherbound tome with pages fluttering open mid-air, structured diagrams and schemas visible on the unfurled pages. A strong shaft of window-light falls between them, casting long opposing shadows that nearly touch. High vaulted ceiling and stone columns recede into deep ink-black shadow. Tension and stalemate atmosphere — neither figure has yet drawn closer.

  Style: Black ink pen drawing on aged ivory paper. Dense cross-hatching and stippling. Dramatic chiaroscuro with strong directional light beams piercing darkness. Bernie Wrightson and Gustave Doré influence — gothic romantic etching aesthetic. 19th-century engraving with intricate linework. Monochrome black and white only — no color. No text, no logos. 1200x630 cinematic horizontal composition. Output constraint: final file size must be 5 MB or less — export as JPEG (quality 85) or compressed PNG.
publish: false
---

# 「MCP는 죽었다, CLI 만세」 — 2026년 봄을 뜨겁게 만든 에이전트 도구 논쟁

[MCP가 9,700만 설치를 돌파한 같은 시기](/posts/mcp-97m-installs-infrastructure), 정반대 쪽에서 또 다른 흐름이 빠르게 번졌습니다. **"MCP는 죽었다. 우리는 CLI로 돌아가야 한다."**

2026년 2월 Eric Holmes가 쓴 「MCP is Dead. Long Live the CLI.」, 4월 18일 Pere Villega의 「The Great Agent Tooling Debate」, 그리고 Anthropic 본인들이 4월 발표한 Tool Search 기능 — 이 셋이 만나면서 **에이전트가 도구를 쓰는 방식 자체** 에 대한 본격 토론이 시작됐습니다.

## 발단 — 한 개발자의 토큰 계산

Pere Villega는 자신의 4월 18일 글에서 이렇게 썼습니다.

> 몇 주 전 새 Claude Code 세션을 열고, 그동안 모아둔 MCP 서버들을 로드하고, 습관처럼 `/context`를 쳤다. 답은 충격적이었다 — 200k 컨텍스트 윈도우의 40%가 이미 차 있었다. 질문 한 개 안 했는데. 6개 서버, 84개 도구. 약 15,540 토큰의 JSON Schema가 윈도우에 자리잡고 있었다. **대부분은 끝까지 안 쓰일 것이다.**

이게 한 사람만의 경험이 아니었습니다. Anthropic이 같은 시기 발표한 Tool Search 글에서 분석한 한 고객의 설정은 **GitHub MCP(35 도구, ~26K 토큰), Slack MCP(11 도구, ~21K 토큰), Sentry·Grafana·Splunk 합쳐 58 도구, ~55K 토큰** 이 대화 시작 전 이미 윈도우에 들어가 있었습니다.

## 비판자들의 논점 3가지

### 1. "CLI는 이미 모델 훈련 데이터에 들어있다"

`gh pr view 123` 같은 명령은 LLM이 이미 학습 데이터로 본 적이 있습니다. **"gh를 가르칠 필요가 없다 — Claude는 이미 안다."** 반면 MCP는 매번 JSON Schema를 토큰 비용을 들여 윈도우에 넣어야 합니다.

### 2. "MCP의 깨끗한 인터페이스는 환상이다"

MCP 옹호자들은 "구조화된 인터페이스가 더 안정적"이라고 말합니다. 하지만 비판자들의 반박:

> 결국 같은 README 스타일 가이드를 쓰게 된다 — `--help` string 대신 JSON Schema에 쓸 뿐.

코드 양은 거의 그대로인데 토큰만 더 든다는 주장입니다.

### 3. "Anthropic 본인들도 줄이고 있다"

가장 강한 증거는 Anthropic 자체의 Tool Search 글이었습니다. 이 기능은 **모든 도구 스키마를 미리 로드하지 않고**, 검색 인덱스만 로드하고 필요한 도구만 런타임에 가져옵니다. 시작 비용을 77K → 8.7K 토큰으로 **85% 줄였다고 발표** 했습니다.

비판자들의 해석: "MCP의 기본 패턴이 비효율적이라는 걸 만든 회사가 인정한 셈."

## 옹호자들의 반박 3가지

### 1. "CLI가 못 하는 게 있다"

브라우저 자동화(Playwright), 실시간 시뮬레이터 제어, 스코프된 데이터 조회 같은 작업은 CLI로 표현하기 어렵습니다. **"Playwright MCP는 살아남을 것이다 — 브라우저는 원래 이상하니까."**

### 2. "한 번 만들면 어디서나"

Claude Code에서 만든 도구를 Cursor·Codex·자체 에이전트에서 동시에 쓸 수 있는 건 MCP만의 강점입니다. CLI는 클라이언트마다 별도 통합이 필요할 수 있습니다.

### 3. "v2.1의 동적 도구 검색이 답이다"

[MCP v2.1](/posts/mcp-97m-installs-infrastructure) 의 구조화된 도구 검색은 **에이전트가 필요한 도구만 런타임에 가져오는 패턴** 을 표준화했습니다. 토큰 문제는 점점 해결되고 있다는 입장입니다.

## 실무자들의 실제 행동

토론보다 더 흥미로운 건 **실무자들이 실제로 어떻게 쓰고 있는가** 입니다.

Claude Code 핵심 엔지니어 Boris Cherny는 같은 시기 글 「MCP, Skills, Sub-agents and Commands」에서 자기 설정을 공개했습니다.

> 나는 정확히 2개의 MCP 서버(Sentry, XCodeBuildMCP)와 약 12개의 skill로 작업한다. **"Skills는 요리하는 법을 가르치고, MCP는 요리 도구를 제공한다."**

**Anthropic 핵심 엔지니어가 일상 작업에 MCP를 2개만 쓴다** — 이게 이번 토론의 가장 강한 신호입니다.

Pere Villega의 결론도 비슷합니다.

> 내 입장은 CLI-first다. CLI 대안이 없거나 MCP가 진짜 더 잘하는 능력(Playwright·Context7·Sentry 같은 구체적 케이스)일 때만 MCP를 쓴다. **나머지는 자기 API에 MCP 붙이는 게 자랑이라 만들어진 서버들이다.**

## 12개월 후의 풍경 — 한 가지 예측

같은 글에서 Pere Villega는 다음과 같이 예측합니다.

- **재미있는 도구들은 조용히 `--json` 출력 플래그, 구조화된 `--help` 페이지, 안전한 read 동사 allowlist를 추가할 것이다**
- **MCP 하이프 사이클은 식고, 진짜 가치 있는 좁은 카테고리만 살아남을 것이다**
- Playwright는 MCP로 살아남는다 (브라우저는 이상함)
- GitHub은 아마 MCP가 아닐 것이다 — `gh`가 이미 더 좋다
- 살아남는 MCP들은 "AI 친화적 출력 모드를 추가한 좋은 옛 Unix 도구들" 처럼 보일 것이다

## 인디 빌더에게 시사점

당신이 SaaS를 만들고 있다면, 이 토론에서 가져갈 실용 포인트:

### 1. "MCP를 만들지, CLI를 만들지" 결정 기준

- **단순 CRUD/조회**: CLI가 더 저렴 — `--json` 출력만 잘 만들면 됨
- **상태 보존이 필요한 복잡한 작업** (브라우저, 실시간 데이터): MCP

### 2. JSON 출력 모드를 무조건 추가하라

CLI 도구라면 `--json` 플래그를 처음부터 넣어두세요. AI 에이전트가 결과를 파싱하기 훨씬 쉬워집니다. **이 한 가지 변경이 도구의 AI 친화도를 가장 크게 바꿉니다.**

### 3. README가 곧 도구의 인터페이스

LLM은 README를 읽습니다. **명확한 사용 예시, 명확한 옵션 설명, 명확한 출력 포맷 명시** — 이 셋이 곧 AI 시대의 좋은 인터페이스입니다.

## 정리

이 토론에 정답은 아직 없습니다. 그러나 트렌드는 명확합니다.

- **CLI-first** + 필요할 때만 MCP
- 도구는 **AI가 읽기 좋은 출력 포맷** 을 갖추는 게 핵심
- MCP는 **좁은 고가치 영역** 에서 살아남는다

당신이 만들 다음 도구는 둘 다 지원할 가능성이 높습니다 — 그리고 그게 가장 안전한 베팅입니다.

---

**참고 자료**
- [The Great Agent Tooling Debate (Pere Villega, 2026-04-18)](https://perevillega.com/posts/2026-04-18-the-great-agent-tooling-debate/)
- [MCP Hit 97 Million Installs (DEV Community, 2026-04-16)](https://dev.to/whoffagents/mcp-hit-97-million-installs-heres-what-that-means-for-your-agent-stack-578l)

**이어 읽기**
- [MCP가 9,700만 설치를 돌파했다](/posts/mcp-97m-installs-infrastructure)
- [Apple Xcode 26.3 + MCP 네이티브](/posts/xcode-mcp-native-2026)
