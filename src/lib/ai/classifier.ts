import {
  CACHE_CONTROL_EPHEMERAL,
  CLASSIFIER_SYSTEM_PROMPT,
} from './prompts'
import { MODEL_HAIKU, getAnthropicClient } from './anthropic-client'
import { runLevel0Filter } from './level0-filter'

export type ClassifierMode = 'live' | 'stub'

export interface ClassifierInput {
  url: string
  html: string
  description?: string | null
  l0Score?: number
  l0Signals?: string[]
}

export interface ClassifierOutput {
  mode: ClassifierMode
  category: string
  uiPattern: string
  vibeScore: number
  qualityScore: number
  riskScore: number
  toolGuess: string
  summary: string
  mainFeatures: string[]
  rawResponse?: string
  errorMessage?: string
}

export async function classifySite(input: ClassifierInput): Promise<ClassifierOutput> {
  const client = getAnthropicClient()

  if (!client) {
    return stubClassifier(input)
  }

  const trimmedHtml = input.html.slice(0, 12000)
  const userPrompt = buildUserPrompt(input.url, trimmedHtml, input.description, input.l0Score, input.l0Signals)

  try {
    const response = await client.messages.create({
      model: MODEL_HAIKU,
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: CLASSIFIER_SYSTEM_PROMPT,
          cache_control: CACHE_CONTROL_EPHEMERAL,
        },
      ],
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = extractText(response.content)
    const parsed = parseJsonStrict(text)

    return {
      mode: 'live',
      category: typeof parsed.category === 'string' ? parsed.category : 'other',
      uiPattern: typeof parsed.uiPattern === 'string' ? parsed.uiPattern : 'other',
      vibeScore: clampScore(parsed.vibeScore),
      qualityScore: clampScore(parsed.qualityScore),
      riskScore: clampScore(parsed.riskScore),
      toolGuess: typeof parsed.toolGuess === 'string' ? parsed.toolGuess : 'unknown',
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
      mainFeatures: Array.isArray(parsed.mainFeatures)
        ? parsed.mainFeatures.filter((f: unknown): f is string => typeof f === 'string').slice(0, 5)
        : [],
      rawResponse: text,
    }
  } catch (error) {
    return {
      ...stubClassifier(input),
      errorMessage: error instanceof Error ? error.message : 'classifier_failed',
    }
  }
}

function buildUserPrompt(
  url: string,
  html: string,
  description: string | null | undefined,
  l0Score: number | undefined,
  l0Signals: string[] | undefined,
): string {
  const parts = [
    `URL: ${url}`,
    description ? `Description: ${description}` : null,
    typeof l0Score === 'number' ? `L0 Score: ${l0Score}` : null,
    l0Signals && l0Signals.length > 0 ? `L0 Signals: ${l0Signals.join(', ')}` : null,
    '',
    'HTML 발췌:',
    html,
  ].filter(Boolean)
  return parts.join('\n')
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
  if (!match) {
    throw new Error('No JSON object in response')
  }
  return JSON.parse(match[0]) as Record<string, unknown>
}

function clampScore(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

function stubClassifier(input: ClassifierInput): ClassifierOutput {
  const l0 = runLevel0Filter({ url: input.url, html: input.html, description: input.description })
  return {
    mode: 'stub',
    category: 'other',
    uiPattern: 'other',
    vibeScore: l0.score,
    qualityScore: 0,
    riskScore: 0,
    toolGuess: l0.toolGuess ?? 'unknown',
    summary: 'Anthropic API 키 미설정 — stub 응답입니다 (L0 점수만 반영).',
    mainFeatures: l0.signals.slice(0, 3),
  }
}
