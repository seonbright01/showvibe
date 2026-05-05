import { z } from 'zod'

// site 또는 post 둘 중 하나의 id 필수 (polymorphic)
export const createCommentSchema = z
  .object({
    siteId: z.string().uuid().optional(),
    postId: z.string().uuid().optional(),
    body: z
      .string()
      .trim()
      .min(2, '댓글은 최소 2자 이상이어야 합니다')
      .max(2000, '댓글은 최대 2000자까지 작성 가능합니다'),
    turnstileToken: z.string().min(1, 'Captcha 인증을 완료해주세요'),
  })
  .refine(
    (d) => (d.siteId && !d.postId) || (!d.siteId && d.postId),
    '댓글은 사이트(siteId) 또는 포스트(postId) 중 하나의 대상이 있어야 합니다',
  )

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
