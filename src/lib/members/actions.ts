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

export async function toggleMemberBanAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin()
  const userId = String(formData.get('userId') ?? '')
  const action = String(formData.get('action') ?? '') // 'ban' | 'unban'
  const reason = String(formData.get('reason') ?? '').trim() || null

  if (!userId || (action !== 'ban' && action !== 'unban')) return
  // 본인 ban 금지
  if (userId === admin.id) return

  // 마이그레이션 20260505000001_user_ban 적용 후 사용 가능. 타입 동기화 전이라 캐스팅으로 우회.
  type UntypedDb = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from: (table: string) => any
  }
  const db = createServiceClient() as unknown as UntypedDb
  if (action === 'ban') {
    await db
      .from('users')
      .update({
        is_banned: true,
        banned_at: new Date().toISOString(),
        banned_reason: reason,
      })
      .eq('id', userId)
  } else {
    await db
      .from('users')
      .update({
        is_banned: false,
        banned_at: null,
        banned_reason: null,
      })
      .eq('id', userId)
  }
  revalidatePath('/admin/members')
}
