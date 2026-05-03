import { z } from 'zod'

export const createCommentSchema = z.object({
  siteId: z.string().uuid(),
  body: z
    .string()
    .trim()
    .min(2, '댓글은 최소 2자 이상이어야 합니다')
    .max(2000, '댓글은 최대 2000자까지 작성 가능합니다'),
  turnstileToken: z.string().min(1, 'Captcha 인증을 완료해주세요'),
})

export const reportCommentSchema = z.object({
  commentId: z.string().uuid(),
  reason: z.enum(['spam', 'abuse', 'ad', 'privacy', 'other']),
  detail: z.string().max(500).optional(),
})

export const updateCommentSchema = z.object({
  commentId: z.string().uuid(),
  body: z
    .string()
    .trim()
    .min(2, '댓글은 최소 2자 이상이어야 합니다')
    .max(2000, '댓글은 최대 2000자까지 작성 가능합니다'),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type ReportCommentInput = z.infer<typeof reportCommentSchema>
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>
