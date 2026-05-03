---
name: showvibe-article
description: Use when user asks to manually generate ShowVibe article summaries (300-500자 본문) in this Claude Code session. Pulls sites needing article from Supabase, asks Claude to write per ShowVibe style guide, writes results to site_analysis.article_summary.
---

# ShowVibe Manual Article Generator

기능: Anthropic API 키 없이 Claude Code 세션에서 직접 사이트 소개글(300-500자) 작성 → DB 저장.

## 워크플로우

1. **export 실행** (이 스킬 invoke 시 자동)
   ```bash
   npm run pipeline:article-export -- 10
   ```
   → `tmp/article-input.json`에 article 미작성 사이트 10개 + HTML + classifier 결과 저장.

2. **Claude(이 세션)가 본문 작성**
   - `tmp/article-input.json`을 Read
   - 각 항목에 대해 시스템 프롬프트:
     ```
     당신은 ShowVibe의 사이트 소개 글 작성자입니다.
     주어진 사이트 HTML과 분류 결과를 바탕으로 300-500자의 한국어 소개글을 작성합니다.

     출력 (JSON 배열):
     [
       { "id": "<input의 id 그대로>", "article": "300-500자 본문 (개행 포함 가능)" },
       ...
     ]

     규칙:
     - 길이: 300-500자 (한글 기준)
     - 추정 표현 의무: '~로 보입니다', '~로 추정됩니다', '참고용 정보입니다'
     - 단정 금지: 사이트 소유자/제작자에 대한 정보는 추정 표현으로
     - 객관적 톤: 광고성 표현 회피
     - AdSense SEO 적합한 정보 밀도
     - JSON 외 다른 텍스트 출력 금지
     ```
   - 결과를 `tmp/article-output.json`에 Write
   - fetch_error 있는 항목은 skip

3. **import 실행**
   ```bash
   npm run pipeline:article-import
   ```
   → `site_analysis.article_summary` UPDATE.

## 주의 사항

- 한 번에 너무 많이 시키면 길어지니 10건 권장
- 각 본문 길이는 한글 기준 300-500자 (영문이면 600-1000자 정도)
- HTML이 짧거나 콘텐츠가 빈약하면 짧게 작성 (억지로 늘리지 말 것)
