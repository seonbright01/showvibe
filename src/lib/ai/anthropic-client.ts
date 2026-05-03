import Anthropic from '@anthropic-ai/sdk'

let cached: Anthropic | null = null

export function getAnthropicClient(): Anthropic | null {
  if (cached) return cached
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null
  cached = new Anthropic({ apiKey })
  return cached
}

export function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

export const MODEL_HAIKU = 'claude-haiku-4-5-20251001'
export const MODEL_SONNET = 'claude-sonnet-4-6'
