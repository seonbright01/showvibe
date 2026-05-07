---
title: MCP가 9,700만 설치를 돌파했다 — 에이전트 시대의 새로운 npm
slug: mcp-97m-installs-infrastructure
category: news
excerpt: 2026년 3월 MCP가 9,700만 설치를 넘었습니다. Cursor·Claude Code·OpenAI Codex가 v2.1을 채택하며, "한 번 만든 도구가 모든 AI 에이전트에서 동작"하는 시대가 열렸습니다.
coverImageUrl: ""
imagePrompt: |
  Scene: A vast cathedral dome viewed from below, depicting an immense ceiling fresco of an interconnected celestial network — dozens of small luminous orbs strung together by delicate filigree lines forming a dense mesh that extends beyond the frame on every side. Bernini-influenced architectural framing with cross-hatched rib-vaults curving outward. A single dramatic shaft of light pours through the central oculus, illuminating the heart of the network. Tiny human figures stand on the floor far below, dwarfed by the scale. Sense of enormous, almost overwhelming infrastructure.

  Style: Black ink pen drawing on aged ivory paper. Dense cross-hatching and stippling. Dramatic chiaroscuro with strong directional light beams piercing darkness. Bernie Wrightson and Gustave Doré influence — gothic romantic etching aesthetic. 19th-century engraving with intricate linework. Monochrome black and white only — no color. No text, no logos. 1200x630 cinematic horizontal composition. Output constraint: final file size must be 5 MB or less — export as JPEG (quality 85) or compressed PNG.
publish: false
---

# MCP가 9,700만 설치를 돌파했다 — 에이전트 시대의 새로운 npm

지난 두 달 동안 AI 개발자 커뮤니티에서 가장 자주 언급된 약자는 단연 **MCP** 입니다. 2026년 3월 기준 누적 9,700만 설치를 넘었고, 4월에는 Cursor·Claude Code·OpenAI Codex가 모두 MCP v2.1을 정식 채택했습니다. **"실험은 끝났다 — MCP는 이제 인프라"** 라는 표현이 [DEV Community 글](https://dev.to/whoffagents/mcp-hit-97-million-installs-heres-what-that-means-for-your-agent-stack-578l)에서 등장한 게 이즈음입니다.

## MCP가 뭔가요?

**Model Context Protocol(MCP)** 는 Anthropic이 2024년 말 공개한 오픈 표준입니다. AI 에이전트(Claude, Cursor, Codex 등)와 외부 시스템(파일, DB, API, 브라우저) 사이를 표준 프로토콜로 연결합니다.

비유하자면 npm·PyPI 같은 **패키지 생태계** 입니다. 누군가 만든 MCP 서버를 설치하면, 어떤 AI 에이전트에서든 그 도구를 쓸 수 있습니다.

## v2.1에서 바뀐 4가지

2026년 4월 출시된 MCP v2.1의 핵심 변경점은 다음과 같습니다.

### 1. 구조화된 도구 검색

이전엔 시스템 프롬프트에 도구 목록을 하드코딩해야 했습니다. v2.1부터는 에이전트가 **런타임에 MCP 서버에게 "어떤 도구가 있어?"** 라고 직접 물어볼 수 있습니다. 도구 설명·입력 스키마·기능 태그까지 모두 포함됩니다.

### 2. 스트리밍 도구 결과

장시간 실행되는 도구(검색, 코드 실행, DB 쿼리)가 결과를 **부분적으로 스트리밍** 할 수 있습니다. 사용자는 결과 전체를 기다리지 않고 진행 상황을 실시간으로 볼 수 있습니다.

### 3. 전송 방식 표준화

HTTP, stdio, WebSocket 셋 다 표준 스펙에 들어왔습니다. **"내 MCP 서버가 어떤 클라이언트에서 어떻게 동작할지"** 가 명확해졌습니다.

### 4. 인증 위임 (OAuth 2.0)

MCP 서버가 사용자에게 직접 OAuth 인증을 요청할 수 있습니다. 호출하는 에이전트는 OAuth 공급자가 누구인지 알 필요가 없습니다.

## "한 번 만들어 어디서나" — 실제 의미

2026년 4월 이전, 세 개 메이저 AI 코딩 환경은 도구 통합 방식이 모두 달랐습니다.

- Claude Code: skills + hooks
- Cursor: extensions
- OpenAI Codex: custom functions

각자 다른 코드를 짜야 했죠. 지금은 다릅니다.

```
Your MCP Server
    ├── Claude Code (full MCP v2.1)
    ├── Cursor (full MCP v2.1)
    ├── Codex (full MCP v2.1)
    └── Your own agents (via SDK)
```

**한 번 만들면, 모든 클라이언트에서 동작합니다.** npm 패키지를 한 번 publish하면 모든 Node 프로젝트에서 쓸 수 있는 것과 같은 구조입니다.

## 인디 빌더에게 의미하는 것

vibe-coded 사이트를 만드는 사람에게 MCP 9,700만 설치 돌파는 두 가지를 의미합니다.

### 1. "내 SaaS의 API"가 곧 "AI 에이전트가 쓸 수 있는 도구"

사용자가 ChatGPT나 Claude에게 "내 [당신 SaaS]에서 어제 데이터 가져와줘"라고 말했을 때, 그게 바로 동작하려면 **MCP 서버를 1개 만들어두면 됩니다.** 추가로 GPT 플러그인, Claude 통합, Cursor 확장 따로 만들 필요가 없습니다.

### 2. "에이전트가 사용 가능한가"가 새로운 distribution 채널

2025년의 distribution이 SEO·소셜이었다면, 2026년의 새 채널은 **AI 에이전트의 도구 마켓** 입니다. 사용자가 자기 에이전트에 "이거 추가해줘"라고 말하는 순간 당신 SaaS가 일상에 끼워집니다.

## 약점과 논쟁: "토큰을 너무 많이 먹는다"

MCP가 인프라가 됐다고 모든 게 장밋빛은 아닙니다. **실무자들 사이에선 "MCP를 쓸수록 컨텍스트 윈도우가 빨리 차서 성능이 떨어진다"는 비판이 큽니다.**

이 토론은 별도 글에서 자세히 다뤘습니다 → [MCP는 죽었다? CLI 회귀 논쟁](/posts/mcp-vs-cli-debate)

## 시작하는 법

MCP 서버를 처음 만든다면 다음 순서를 추천합니다.

1. **공식 문서 + SDK**: TypeScript 또는 Python SDK
2. **하나의 도메인에 집중**: "내 도메인에서 가장 자주 하는 작업 5가지"를 노출
3. **MCP 서버 디렉토리 등록**: 다른 사람이 발견할 수 있게
4. **빨리 v2.1 마이그레이션**: 구조화된 도구 검색 + 스트리밍은 사용자 경험 차이가 큼

## 정리

MCP는 "재미있는 실험"에서 "기본 인프라"로 넘어왔습니다. **2026년 후반에 SaaS를 만든다면, MCP 서버 1개를 함께 출시하는 것이 사실상 표준** 이 되었습니다.

ShowVibe도 곧 메이커들이 자기 사이트의 MCP 서버를 등록할 수 있는 기능을 검토하고 있습니다. 그 전에 [Submit](/submit) 에 본인 사이트를 먼저 등록해보세요.

---

**참고 자료**
- [MCP Hit 97 Million Installs (DEV Community, 2026-04-16)](https://dev.to/whoffagents/mcp-hit-97-million-installs-heres-what-that-means-for-your-agent-stack-578l)
- [The Great Agent Tooling Debate (Pere Villega, 2026-04-18)](https://perevillega.com/posts/2026-04-18-the-great-agent-tooling-debate/)

**이어 읽기**
- [MCP는 죽었다? CLI 회귀 논쟁](/posts/mcp-vs-cli-debate)
- [Apple Xcode 26.3 + MCP 네이티브](/posts/xcode-mcp-native-2026)
