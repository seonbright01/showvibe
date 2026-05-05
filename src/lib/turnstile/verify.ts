const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify'

interface TurnstileSiteVerifyResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
  action?: string
  cdata?: string
}

export async function verifyTurnstile(
  token: string,
  ip?: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY

  // 보안 (P3.4): fail-closed — secret 미설정 시 항상 reject.
  // 이전엔 dev 모드에서 fail-open 이었지만, 그 분기가 prod 빌드에 실수로
  // 들어가면 모든 captcha 통과권 부여. 명시적 dev 우회는
  // ALLOW_TURNSTILE_INSECURE=1 환경변수 필요 (CI/local 전용).
  if (!secret) {
    if (process.env.ALLOW_TURNSTILE_INSECURE === '1') return true
    return false
  }

  const formData = new URLSearchParams()
  formData.append('secret', secret)
  formData.append('response', token)
  if (ip) formData.append('remoteip', ip)

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    })
    if (!res.ok) return false
    const data = (await res.json()) as TurnstileSiteVerifyResponse
    return data.success === true
  } catch {
    return false
  }
}
