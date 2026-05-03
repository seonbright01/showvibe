import { z } from 'zod'

export const initClaimSchema = z.object({
  siteUrl: z.string().trim().url(),
  method: z.enum(['github', 'meta_tag', 'dns', 'manual']),
})

export const verifyClaimSchema = z.object({
  claimId: z.string().uuid(),
})

export type InitClaimInput = z.infer<typeof initClaimSchema>
export type VerifyClaimInput = z.infer<typeof verifyClaimSchema>
