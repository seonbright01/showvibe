import {
  ARTICLE_SYSTEM_PROMPT,
  CACHE_CONTROL_EPHEMERAL,
} from './prompts'
import { MODEL_SONNET, getAnthropicClient } from './anthropic-client'

export type ArticleMode = 'live' | 'stub'

export interface ArticleInput {
  url: string
  html: string
  classifierSummary: string
  category: string
  toolGuess: string
}

export interface ArticleOutput {
  mode: ArticleMode
  article: string
  errorMessage?: string
}

export async function generateArticle(input: ArticleInput): Promise<ArticleOutput> {
  const client = getAnthropicClient()
  if (!client) {
    return {
      mode: 'stub',
      article: stubArticle(input),
    }
  }

  try {
    const userPrompt = [
      `URL: ${input.url}`,
      `카테고리: ${input.category}`,
      `추정 도구: ${input.toolGuess}`,
      `분류 요약: ${input.classifierSummary}`,
      '',
      'HTML 발췌:',
      input.html.slice(0, 12000),
    ].join('\n')

    const response = await client.messages.create({
      model: MODEL_SONNET,
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: ARTICLE_SYSTEM_PROMPT,
          cache_control: CACHE_CONTROL_EPHEMERAL,
        },
      ],
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = extractText(response.content)
    const parsed = parseJsonStrict(text)
    const article = typeof parsed.article === 'string' ? parsed.article : ''

    if (!article) {
      return {
        mode: 'live',
        article: stubArticle(input),
        errorMessage: 'article_field_missing',
      }
    }
    return { mode: 'live', article }
  } catch (error) {
    return {
      mode: 'stub',
      article: stubArticle(input),
      errorMessage: error instanceof Error ? error.message : 'article_generator_failed',
    }
  }
}

function extractText(content: ReadonlyArray<{ type: string }>): string {
  for (const block of content) {
    if (block.type === 'text' && 'text' in block && typeof block.text === 'string') {
      return block.text
    }
  }
  return ''
}

function parseJsonStrict(text: string): Record<string, unknown> {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON in response')
  return JSON.parse(match[0]) as Record<string, unknown>
}

function stubArticle(input: ArticleInput): string {
  let host: string
  try {
    host = new URL(input.url).host
  } catch {
    host = input.url
  }
  return [
    `${host}는 ${input.category} 카테고리의 사이트로 보입니다.`,
    `자동 분석 단계에서는 도구를 ${input.toolGuess}로 추정했으나 정확한 정보는 제작자 확인이 필요합니다.`,
    '',
    '※ 본 소개글은 Anthropic API 키 미설정으로 인해 임시 생성된 stub 텍스트이며, 운영 시점에 실제 AI 본문으로 자동 교체됩니다. 참고용 정보입니다.',
  ].join('\n')
}
