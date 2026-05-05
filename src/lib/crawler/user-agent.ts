export const USER_AGENT =
  'ShowVibeBot/1.0 (+https://showvibe.app/legal/bot-policy)'

export const DEFAULT_FETCH_HEADERS: Readonly<Record<string, string>> = Object.freeze({
  'User-Agent': USER_AGENT,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
})
