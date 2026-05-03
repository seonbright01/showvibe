import { z } from 'zod'

export const takedownSchema = z.object({
  email: z.string().trim().email(),
  targetUrl: z.string().trim().url(),
  requestType: z.enum(['copyright', 'privacy', 'defamation', 'other']),
  reason: z.string().trim().min(10, '사유를 자세히 입력해주세요').max(2000),
  confirmIdentity: z.literal(true),
  turnstileToken: z.string().min(1).optional(),
})

export type TakedownInput = z.infer<typeof takedownSchema>
