'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/guards'
import { createServiceClient } from '@/lib/supabase/service'

const VALID_ROLES = new Set(['user', 'creator', 'admin'])

export async function updateMemberRoleAction(formData: FormData): Promise<void> {
  await requireAdmin()
  const userId = String(formData.get('userId') ?? '')
  const role = String(formData.get('role') ?? '')

  if (!userId || !VALID_ROLES.has(role)) return

  const supabase = createServiceClient()
  await supabase.from('users').update({ role }).eq('id', userId)
  revalidatePath('/admin/members')
}
