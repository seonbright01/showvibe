import { z } from 'zod'

export const subscribeNewsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('올바른 이메일 주소를 입력해주세요')
    .max(254, '이메일이 너무 깁니다'),
  turnstileToken: z.string().optional(),
  source: z.string().max(50).optional(),
})

export type SubscribeNewsletterInput = z.infer<typeof subscribeNewsletterSchema>
