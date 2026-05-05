'use server'

import { sendEmail } from '@/lib/email/ses'
import { verifyTurnstile } from '@/lib/turnstile/verify'

export type ContactResult =
  | { ok: true; message: string }
  | { ok: false; error: string }

const NAME_MAX = 60
const SUBJECT_MAX = 200
const MESSAGE_MIN = 10
const MESSAGE_MAX = 4000

// 보안 (P3.7): Reply-To header injection 방지를 위한 strict email regex.
// RFC 단순화: local + @ + domain.tld (TLD 2자 이상). \r\n 등 헤더 분리자 차단.
const EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// 보안 (P3.7): SMTP/SES header 에 들어가는 필드의 \r\n strip — header injection 차단.
function stripCrlf(s: string): string {
  return s.replace(/[\r\n]+/g, ' ')
}

export async function sendContactMessage(
  _prev: ContactResult | null,
  formData: FormData,
): Promise<ContactResult> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const subject = String(formData.get('subject') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()
  const turnstileToken = String(formData.get('turnstileToken') ?? '').trim()

  if (!name || name.length > NAME_MAX) {
    return { ok: false, error: '이름은 1~60자 사이여야 합니다.' }
  }
  // 보안 (P3.7): strict email regex + 길이 cap (RFC 5321 local 64 + domain 255 = 320).
  if (!email || email.length > 320 || !EMAIL_RE.test(email)) {
    return { ok: false, error: '올바른 이메일을 입력해주세요.' }
  }
  if (subject.length > SUBJECT_MAX) {
    return { ok: false, error: `제목은 ${SUBJECT_MAX}자 이내여야 합니다.` }
  }
  if (message.length < MESSAGE_MIN || message.length > MESSAGE_MAX) {
    return {
      ok: false,
      error: `문의 내용은 ${MESSAGE_MIN}~${MESSAGE_MAX}자 사이여야 합니다.`,
    }
  }

  if (process.env.TURNSTILE_SECRET_KEY) {
    if (!turnstileToken) {
      return { ok: false, error: '자동 인증을 완료해주세요.' }
    }
    const ok = await verifyTurnstile(turnstileToken)
    if (!ok) return { ok: false, error: '자동 인증 실패' }
  }

  const supportEmail =
    process.env.SES_REPLY_TO_EMAIL ||
    process.env.SES_FROM_EMAIL ||
    'support@showvibe.app'

  // 보안 (P3.7): SMTP header 에 들어가는 필드 — \r\n 차단 + 길이 cap.
  const safeSubject = stripCrlf(subject).slice(0, SUBJECT_MAX)
  const finalSubject = safeSubject || '(제목 없음)'
  const text = [
    `이름: ${name}`,
    `이메일: ${email}`,
    `제목: ${safeSubject || '(없음)'}`,
    '',
    '----- 문의 내용 -----',
    message,
  ].join('\n')

  const html = `
    <div style="font-family: -apple-system, sans-serif; line-height: 1.6; color: #111;">
      <h2 style="margin:0 0 8px;">새 문의가 도착했습니다</h2>
      <table style="font-size:13px;border-collapse:collapse;">
        <tr><td style="padding:4px 12px 4px 0;color:#666;">이름</td><td>${escapeHtml(name)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">이메일</td><td>${escapeHtml(email)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">제목</td><td>${escapeHtml(safeSubject || '(없음)')}</td></tr>
      </table>
      <hr style="border:none;border-top:1px solid #ddd;margin:16px 0;" />
      <pre style="white-space:pre-wrap;font-family:inherit;font-size:13px;">${escapeHtml(message)}</pre>
    </div>
  `

  const result = await sendEmail({
    to: supportEmail,
    subject: `[ShowVibe Contact] ${finalSubject}`,
    text,
    html,
    replyTo: email,
  })

  if (!result.ok) {
    if (result.reason === 'missing_config') {
      return { ok: false, error: '메일 서비스가 설정되어 있지 않습니다. 잠시 후 다시 시도해주세요.' }
    }
    return { ok: false, error: '메일 발송 실패. 잠시 후 다시 시도해주세요.' }
  }

  return { ok: true, message: '문의가 접수되었습니다. 빠른 시일 내 답변드리겠습니다.' }
}
