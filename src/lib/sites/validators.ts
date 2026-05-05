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
  /** 사용자가 사전 업로드한 스크린샷 public URL. 없으면 자동 수집 워커가 처리. */
  screenshotUrl: z.string().url().optional(),
})

export type SubmitSiteInput = z.infer<typeof submitSiteSchema>
