'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ActionResult = { ok: true } | { ok: false; error: string }

async function ensureAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') throw new Error('Forbidden')
  return { supabase, user }
}

export async function approveSite(siteId: string): Promise<ActionResult> {
  const { supabase } = await ensureAdmin()
  const { error } = await supabase
    .from('sites')
    .update({
      visibility: 'public',
      status: 'active',
      last_active_at: new Date().toISOString(),
    })
    .eq('id', siteId)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/review')
  revalidatePath('/')
  return { ok: true }
}

export async function rejectSite(siteId: string): Promise<ActionResult> {
  const { supabase } = await ensureAdmin()
  const { error } = await supabase
    .from('sites')
    .update({ status: 'blocked' })
    .eq('id', siteId)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/review')
  return { ok: true }
}

export async function holdSite(siteId: string): Promise<ActionResult> {
  const { supabase } = await ensureAdmin()
  // hold = unlisted 유지, 큐에서 잠시 뒤로 보냄 (last_checked_at 갱신)
  const { error } = await supabase
    .from('sites')
    .update({ last_checked_at: new Date().toISOString() })
    .eq('id', siteId)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/review')
  return { ok: true }
}

export async function archiveSite(siteId: string): Promise<ActionResult> {
  const { supabase } = await ensureAdmin()
  const { error } = await supabase
    .from('sites')
    .update({
      visibility: 'public',
      status: 'archived',
      recheck_eligible_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      block_reason: 'archived: manual by admin',
    })
    .eq('id', siteId)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/review')
  revalidatePath('/admin/health')
  revalidatePath('/archive')
  revalidatePath(`/projects/${siteId}`)
  return { ok: true }
}

/** archived 사이트를 active로 되돌림 (수동 복구). monitor가 다시 health-check에 포함시킴. */
export async function unarchiveSite(siteId: string): Promise<ActionResult> {
  const { supabase } = await ensureAdmin()
  const { error } = await supabase
    .from('sites')
    .update({
      visibility: 'public',
      status: 'active',
      last_active_at: new Date().toISOString(),
      recheck_eligible_at: null,
      block_reason: null,
    })
    .eq('id', siteId)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/review')
  revalidatePath('/admin/health')
  revalidatePath('/archive')
  revalidatePath(`/projects/${siteId}`)
  return { ok: true }
}

/** form action 래퍼 (admin/health 등에서 form action으로 호출) */
export async function archiveSiteFormAction(formData: FormData): Promise<void> {
  const siteId = String(formData.get('siteId') ?? '')
  if (!siteId) return
  await archiveSite(siteId)
}

export async function unarchiveSiteFormAction(formData: FormData): Promise<void> {
  const siteId = String(formData.get('siteId') ?? '')
  if (!siteId) return
  await unarchiveSite(siteId)
}

export async function resolveTakedown(
  id: string,
  decision: 'approved' | 'rejected' | 'info_required',
  adminNote?: string,
): Promise<ActionResult> {
  const { supabase } = await ensureAdmin()

  const { data: req } = await supabase
    .from('takedown_requests')
    .select('site_id')
    .eq('id', id)
    .single()

  if (decision === 'approved' && req?.site_id) {
    const { error: siteErr } = await supabase
      .from('sites')
      .update({ visibility: 'unlisted' })
      .eq('id', req.site_id)
    if (siteErr) return { ok: false, error: siteErr.message }
  }

  const { error } = await supabase
    .from('takedown_requests')
    .update({
      status: decision,
      admin_note: adminNote ?? null,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/takedowns')
  return { ok: true }
}

export async function moderateComment(
  commentId: string,
  action: 'hide' | 'show' | 'delete',
): Promise<ActionResult> {
  const { supabase } = await ensureAdmin()
  const status =
    action === 'hide' ? 'hidden' : action === 'delete' ? 'deleted' : 'visible'
  const { error } = await supabase
    .from('comments')
    .update({ status })
    .eq('id', commentId)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/comments')
  return { ok: true }
}
