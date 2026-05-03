---
name: showvibe-classify
description: Use when user asks to manually classify ShowVibe candidate sites in this Claude Code session (instead of calling Anthropic API). Pulls N unclassified candidates from Supabase, asks Claude to classify each per the strict JSON schema, then writes results back to site_analysis.
---

# ShowVibe Manual Classifier

기능: Anthropic API 키 없이도 Claude Code 세션 안에서 직접 사이트 분류 → DB 저장.

## 워크플로우

1. **export 실행** (이 스킬 invoke 시 자동)
   ```bash
   npm run pipeline:classify-export -- 10
   ```
   → `tmp/classify-input.json`에 미분류 사이트 10개 + HTML excerpt + L0 결과 저장.

2. **Claude(이 세션)가 분류**
   - `tmp/classify-input.json`을 Read
   - 각 항목에 대해 아래 시스템 프롬프트 따라 분류:
     ```
     당신은 ShowVibe 큐레이션 시스템의 분류기입니다.
     주어진 웹사이트 HTML 발췌를 보고 다음 JSON 스키마로만 응답하세요:

     {
       "id": "<input의 id 그대로>",
       "category": "tools" | "landing" | "saas" | "marketplace" | "blog" | "portfolio" | "dashboard" | "other",
       "uiPattern": "dashboard" | "landing" | "marketplace" | "blog" | "portfolio" | "saas" | "tool" | "other",
       "vibeScore": 0-100 (바이브코딩 가능성),
       "qualityScore": 0-100 (UI 완성도),
       "riskScore": 0-100 (성인/사기/폭력 등 리스크),
       "toolGuess": "cursor" | "lovable" | "v0" | "bolt" | "windsurf" | "claude" | "chatgpt" | "unknown",
       "summary": "1-2 문장 한국어 요약 (추정 표현 사용: '~로 추정됩니다')",
       "mainFeatures": ["feature1", "feature2", "feature3"],
       "rejected": false  (vibe와 무관하면 true + rejectionReason)
     }

     규칙:
     - 추정 표현 의무: '~로 보입니다', '~로 추정됩니다', '참고용 정보입니다'
     - 단정 금지
     - riskScore 70+ 사이트는 rejected: true
     - L0_score 0이고 vibe 신호 전혀 없으면 rejected: true
     - 한국어 회사·정부·신문 사이트, 명백한 비-vibe 사이트는 rejected: true
     ```
   - 결과 배열을 `tmp/classify-output.json`에 Write (포맷: `[{id, category, ..., rejected}, ...]`)
   - fetch_error가 있는 항목은 분류 시도 가능하나 정보 부족 시 `rejected: true, rejectionReason: "fetch failed"`로 처리

3. **import 실행**
   ```bash
   npm run pipeline:classify-import
   ```
   → `tmp/classify-output.json` 읽어 `site_analysis` UPSERT, rejected는 `sites.status='blocked', visibility='private'`로.

4. **결과 보고:** `processed`, `inserted`, `rejected`, `errors`

## 주의 사항

- **JSON 외 다른 텍스트 출력 금지** (스크립트가 JSON parse)
- 각 항목 `id` 필드 반드시 input에서 그대로 복사 (UUID)
- 모르는 정보는 추측 X — `unknown`, `other`, 0 등으로
- 분류 후 즉시 작업 인계 (검수자가 확인 후 별도 액션)
