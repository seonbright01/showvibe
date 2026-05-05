<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:showvibe-workflow -->
# ShowVibe — 개발 작업 진행 규칙

## 자율 병렬 개발 (default ON)
사용자가 별도 지시하지 않아도, 작업이 다음 조건을 만족하면 **병렬로 진행**한다:

1. **독립 작업 다발**일 때 — 한 메시지 안에 여러 요청(예: 3가지 기능 추가)이 있고 서로 코드 의존이 없으면, **읽기 단계는 한 번에 여러 Read/Bash/Grep**을, **쓰기 단계는 작업별로 나눠서** 처리한다.
2. **탐색 + 구현이 분리**될 때 — 코드베이스 탐색은 Agent (Explore/general-purpose) 1개 이상에게 맡기고, 메인 컨텍스트는 구현에 집중한다.
3. **검증이 길게 걸릴 때** — typecheck/build/test는 백그라운드(`run_in_background: true`)로 띄우고 다른 작업을 계속한다.

병렬 금지: ① 같은 파일을 동시에 편집, ② 한 작업의 결과가 다른 작업의 입력으로 필요할 때, ③ destructive 명령(rm, drop, force-push). 이 경우는 순차 처리.

## 데이터 정합성 우선
사용자가 직접 입력/업로드한 데이터(스크린샷, 메타, claim 정보 등)는 **자동 수집·갱신 파이프라인이 덮어쓰지 않는다**. 자동 수집은 항상 "비어있을 때만 채운다(fill-if-empty)" 정책을 따른다.

## 검수 가능성
새 기능을 추가할 때 admin이 검수·관리할 수 있어야 한다. /admin/* 라우트에 대응 페이지가 없으면 함께 만든다.
<!-- END:showvibe-workflow -->
