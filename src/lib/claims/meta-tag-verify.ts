import { USER_AGENT } from '@/lib/crawler/user-agent'
import { validateOutboundUrl } from '@/lib/security/url-guard'

const FETCH_TIMEOUT_MS = 10_000

export async function verifyMetaTag(
  siteUrl: string,
  expectedToken: string,
): Promise<boolean> {
  // 통합 SSRF 가드 (scheme + hostname pattern + DNS 해석 IP 재검증)
  const guard = await validateOutboundUrl(siteUrl)
  if (!guard.ok) return false

  // 보안: redirect 따라가지 않음 — DNS rebinding + 내부망 redirect chain 방어
  const res = await fetch(siteUrl, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    redirect: 'manual',
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
