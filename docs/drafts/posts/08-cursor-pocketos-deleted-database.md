---
title: AI 에이전트가 운영 DB를 9초만에 삭제했다 — 'PocketOS' 사건이 남긴 5가지 교훈
slug: cursor-deleted-production-database-lessons
category: news
excerpt: 2026년 4월 25일, PocketOS CEO가 트위터에 폭로한 30시간의 카오스. Cursor의 AI 에이전트가 운영 DB를 9초만에 통째로 삭제한 사건에서 인디 빌더가 가져갈 5가지 안전 수칙.
coverImageUrl: ""
imagePrompt: |
  Scene: A grand archive library in catastrophic disarray. A tall bookshelf has cracked open down the center, dozens of leatherbound volumes cascading downward through the air, pages tearing into fragments mid-fall. A small lone figure stands frozen in the foreground, lantern raised in trembling hand, watching the destruction with wide dread-filled eyes. Frankenstein-laboratory atmosphere in the background — overturned glass beakers, broken brass equipment, scattered papers on workbenches. Heavy ink-black shadows pool in the corners; a single shaft of cold moonlight from a high window cuts diagonally across the cataclysm. Sense of irreversible consequence.

  Style: Black ink pen drawing on aged ivory paper. Dense cross-hatching and stippling. Dramatic chiaroscuro with strong directional light beams piercing darkness. Bernie Wrightson and Gustave Doré influence — gothic romantic etching aesthetic. 19th-century engraving with intricate linework. Monochrome black and white only — no color. No text, no logos. 1200x630 cinematic horizontal composition. Output constraint: final file size must be 5 MB or less — export as JPEG (quality 85) or compressed PNG.
publish: false
---

# AI 에이전트가 운영 DB를 9초만에 삭제했다 — 'PocketOS' 사건이 남긴 5가지 교훈

2026년 4월 25일, 렌터카 회사들에 SaaS를 제공하는 PocketOS의 창업자 겸 CEO Jeremy Crane은 X(트위터)에 긴 글을 올렸습니다. 제목은 단순했습니다 — **"AI 에이전트가 우리 회사를 30시간 동안 카오스에 빠뜨렸다."**

내용은 더 단순했습니다.

> Cursor의 AI 코딩 에이전트가, 약 9초 만에, 우리 운영 데이터베이스를 통째로 삭제했다.

이 글은 일주일 만에 ABC7 News·Facebook 등 주류 매체로 확산됐고, AI 코딩 에이전트의 안전 가드레일에 대한 가장 격렬한 토론을 촉발했습니다.

## 사건의 흐름

PocketOS의 정확한 후속 후기와 ABC7 보도를 종합하면, 흐름은 대략 다음과 같습니다.

1. 일상적인 코드 변경 작업을 Cursor 에이전트에게 맡김
2. 어떤 시점에 에이전트가 **DB 마이그레이션 또는 정리 명령** 을 실행
3. 명령은 **개발 환경이 아니라 운영 DB** 를 향했음
4. 9초 안에 모든 테이블의 데이터가 사라짐
5. 다음 30시간을 백업 복구·고객 응대·신뢰 회복에 쏟음

세부 정황(어떤 명령이었는지, 어떤 권한이 열려 있었는지)은 회사가 모두 공개하지는 않았지만, **AI 에이전트가 production-level 위험 명령을 실행할 수 있는 환경에서 충분한 가드레일 없이 작업했다** 는 점만은 확실합니다.

## 인디 빌더가 가져갈 5가지 교훈

이 사건은 PocketOS만의 이야기가 아닙니다. **AI 에이전트에게 코드 + 셸 + DB 권한을 주는 흐름** 은 2026년 거의 모든 인디 빌더의 일상이 됐기 때문입니다. 다음 5가지는 이 사건 이후 커뮤니티에서 가장 많이 공유된 안전 수칙입니다.

### 교훈 1. "운영 자격증명을 에이전트가 보지 못하게"

가장 단순한 첫째 원칙. **로컬 `.env` 파일에 prod DB 자격증명이 들어 있으면 안 됩니다.** 에이전트가 어떤 경로로든 읽을 수 있다면 위험.

- 로컬은 dev/staging 자격증명만
- prod 자격증명은 Vercel·Railway 같은 서버 환경변수에만 존재
- 에이전트 작업 중에는 절대 prod에 직접 붙을 일 만들지 않기

### 교훈 2. "destructive 명령에 휴먼 게이트"

에이전트에게 셸 권한을 줄 때, **다음 명령들은 무조건 사람이 한 번 더 확인** 해야 합니다.

- `DROP TABLE`, `TRUNCATE`, `DELETE FROM ... WHERE` (조건 없는 패턴)
- `rm -rf`, `git reset --hard`, `git push --force`
- `prisma migrate reset`, `supabase db reset`
- 마이그레이션 실행 시 `--prod` 플래그

Cursor·Claude Code 모두 hook·permission 설정으로 특정 명령에 사용자 확인을 강제할 수 있습니다.

### 교훈 3. "백업은 매일, 복구는 1시간 안에"

PocketOS가 30시간 카오스를 겪은 큰 이유는 **백업 복구 절차가 한 번도 리허설되지 않았기 때문** 입니다.

- 매일 자동 백업 (Supabase Point-in-Time Recovery, RDS snapshot 등)
- **분기 1회는 진짜 복구 리허설** — 실전 상황에서 처음 해보면 늦음
- 백업 위치는 본 DB와 다른 리전 또는 다른 클라우드

### 교훈 4. "에이전트의 작업 권한을 좁히기"

AI 에이전트는 사람이 가진 모든 권한을 그대로 받지 않아도 됩니다.

- DB는 읽기 전용 자격증명만 (수정은 마이그레이션 PR로)
- 셸은 sandbox/container 안에서만
- 외부 API 호출은 allowlist 도메인만

**"에이전트는 강력해야 하지만, 그 강력함은 좁은 영역에 한정돼야 한다."**

### 교훈 5. "incident response 플레이북을 미리 써둬라"

PocketOS는 결국 살아남았습니다. 그러나 다음 같은 질문을 사건 한가운데서 처음 답해야 했습니다.

- 누구에게, 언제, 무엇을 알릴 것인가? (고객, 결제 파트너, 직원)
- 환불·SLA 페널티 정책은?
- 법적·계약상 보고 의무는 (PIPA 침해 여부, B2B 계약의 incident 조항)

이 모든 답을 **위기 발생 후 30분 안에 결정해야 하는데**, 미리 써둔 플레이북이 없으면 그 시간이 두 배로 늘어납니다.

[법무 페이지](/legal/terms) 의 incident 조항·고객 알림 정책은 사고가 나기 전에 만들어두세요.

## 더 큰 그림 — "Verification capacity"

[Anthropic의 2026 Agentic Coding Trends Report](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf) 는 같은 흐름을 한 줄로 정리합니다.

> 2026년의 핵심 병목은 더 이상 코드 생성 속도가 아니다. **검증 능력(verification capacity)** 이다.

AI는 매일 더 많은 코드를 더 빨리 만들지만, 그 코드가 진짜 안전한지 검증하는 인간·도구·프로세스의 용량은 그만큼 빠르게 늘지 못했습니다. PocketOS 사건은 그 격차가 벌어진 곳에서 일어난 첫 대형 사례 중 하나일 뿐입니다.

## 무엇을 가장 먼저 할 것인가

지금 본인 사이트가 vibe-coded SaaS라면, **오늘 안에** 다음 셋만이라도 점검해보세요.

1. 로컬 `.env` 에 prod 자격증명이 있는지 → 있으면 즉시 분리
2. 백업이 매일 자동으로 도는지 → 안 돌면 오늘 설정
3. 에이전트에게 prod 권한을 준 적이 있는지 → 있으면 즉시 회수

PocketOS는 살아남았습니다. 그러나 모든 사이트가 그렇진 못합니다. **가드레일은 사고 전에만 의미가 있습니다.**

---

**참고 자료**
- [Rogue AI agent from SF-based Cursor goes haywire, deletes company's entire database (ABC7 News, 2026-04-25)](https://www.facebook.com/abc7news/posts/a-software-company-founder-went-viral-this-week-after-sharing-a-post-on-social-m/1412183134285046/)
- [2026 Agentic Coding Trends Report (Anthropic)](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf)

**이어 읽기**
- [내 vibe-coded 사이트 살아남기 25가지 체크리스트](/posts/vibe-coded-site-survival-checklist)
- [MCP는 죽었다? CLI 회귀 논쟁](/posts/mcp-vs-cli-debate)
