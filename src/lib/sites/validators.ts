import { z } from 'zod'

export const submitSiteSchema = z.object({
  name: z.string().trim().min(1, '프로젝트 이름을 입력해주세요').max(100),
  url: z.string().trim().url('올바른 URL을 입력해주세요'),
  description: z.string().trim().max(200).optional(),
  category: z.string().trim().max(50).optional(),
  builtWith: z.string().trim().max(50).optional(),
  isCreator: z.boolean(),
  email: z.string().trim().email().optional().or(z.literal('')),
  turnstileToken: z.string().min(1, 'Captcha 인증을 완료해주세요').optional(),
})

export type SubmitSiteInput = z.infer<typeof submitSiteSchema>
