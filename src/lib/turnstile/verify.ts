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

  if (!secret) {
    if (process.env.NODE_ENV === 'production') return false
    return true
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
