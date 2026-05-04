const USER_AGENT = 'ShowVibeBot/1.0 (+https://showvibe.app/bot)'
const FETCH_TIMEOUT_MS = 10_000

// 보안: SSRF 방어 — RFC1918 사설망, 링크로컬, 루프백, AWS 메타데이터 endpoint 차단.
const BLOCKED_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./, // 127.0.0.0/8 loopback
  /^10\./, // 10.0.0.0/8 RFC1918
  /^192\.168\./, // 192.168.0.0/16 RFC1918
  /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12 RFC1918
  /^169\.254\./, // 169.254.0.0/16 link-local + AWS metadata
  /^0\./, // 0.0.0.0/8
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // CGNAT 100.64.0.0/10
  /^::1$/, // IPv6 loopback
  /^f[cd][0-9a-f]{2}:/i, // IPv6 ULA fc00::/7
  /^fe80:/i, // IPv6 link-local
]

function isBlockedHost(hostname: string): boolean {
  return BLOCKED_HOST_PATTERNS.some((p) => p.test(hostname))
}

export async function verifyMetaTag(
  siteUrl: string,
  expectedToken: string,
): Promise<boolean> {
  let parsed: URL
  try {
    parsed = new URL(siteUrl)
  } catch {
    return false
  }

  // 보안: scheme 화이트리스트 (file://, ftp:// 등 차단)
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return false
  }

  // 보안: 내부망 IP 차단
  if (isBlockedHost(parsed.hostname)) {
    return false
  }

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
