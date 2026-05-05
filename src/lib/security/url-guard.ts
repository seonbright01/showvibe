import { lookup } from 'node:dns/promises'

// SSRF 방어 — RFC1918 사설망, 링크로컬, 루프백, AWS/GCP 메타데이터 endpoint 차단.
// hostname 패턴 + DNS 해석 후 IP 재검증.
export const BLOCKED_HOST_PATTERNS: readonly RegExp[] = [
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
  /^metadata\.google\.internal$/i, // GCP metadata
]

export function isBlockedHost(hostname: string): boolean {
  return BLOCKED_HOST_PATTERNS.some((p) => p.test(hostname))
}

export interface UrlGuardOk {
  ok: true
}

export interface UrlGuardFail {
  ok: false
  reason: string
}

export type UrlGuardResult = UrlGuardOk | UrlGuardFail

// hostname pattern + DNS 해석 후 IP 재검증.
// scheme 화이트리스트(http/https)도 함께 검증.
export async function validateOutboundUrl(rawUrl: string): Promise<UrlGuardResult> {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    return { ok: false, reason: 'invalid_url' }
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, reason: 'unsupported_scheme' }
  }

  if (isBlockedHost(parsed.hostname)) {
    return { ok: false, reason: 'blocked_hostname_pattern' }
  }

  // DNS 해석 후 모든 결과 IP를 패턴 검증 — DNS rebinding 방어.
  try {
    const records = await lookup(parsed.hostname, { all: true, verbatim: false })
    for (const rec of records) {
      if (isBlockedHost(rec.address)) {
        return { ok: false, reason: `blocked_resolved_ip:${rec.address}` }
      }
    }
  } catch (err) {
    return {
      ok: false,
      reason: `dns_lookup_failed:${err instanceof Error ? err.message : 'unknown'}`,
    }
  }

  return { ok: true }
}
