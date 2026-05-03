const USER_AGENT = 'ShowVibeBot/1.0 (+https://showvibe.app/bot)'
const FETCH_TIMEOUT_MS = 10_000

export async function verifyMetaTag(
  siteUrl: string,
  expectedToken: string,
): Promise<boolean> {
  const res = await fetch(siteUrl, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!res.ok) return false
  const html = await res.text()
  const escaped = expectedToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(
    `<meta\\s+name=["']showvibe-verify["']\\s+content=["']${escaped}["']`,
    'i',
  )
  return re.test(html)
}
