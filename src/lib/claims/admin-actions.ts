'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/guards'
import { createServiceClient } from '@/lib/supabase/service'

export async function approveClaimAction(formData: FormData): Promise<void> {
  await requireAdmin()
  const claimId = String(formData.get('claimId') ?? '')
  if (!claimId) return

  const supabase = createServiceClient()
  const { data: claim } = await supabase
    .from('claims')
    .select('id, site_id, user_id, status')
    .eq('id', claimId)
    .maybeSingle()
  if (!claim || claim.status === 'verified') return

  await supabase
    .from('claims')
    .update({ status: 'verified', verified_at: new Date().toISOString() })
    .eq('id', claim.id)

  await supabase
    .from('sites')
    .update({ is_claimed: true, claimed_by_user_id: claim.user_id })
    .eq('id', claim.site_id)

  revalidatePath('/admin/claims')
  revalidatePath(`/projects/${claim.site_id}`)
  revalidatePath('/makers')
}

export async function rejectClaimAction(formData: FormData): Promise<void> {
  await requireAdmin()
  const claimId = String(formData.get('claimId') ?? '')
  const reason = String(formData.get('reason') ?? '').trim() || null
  if (!claimId) return

  const supabase = createServiceClient()
  await supabase
    .from('claims')
    .update({ status: 'rejected', rejected_reason: reason })
    .eq('id', claimId)

  revalidatePath('/admin/claims')
}
