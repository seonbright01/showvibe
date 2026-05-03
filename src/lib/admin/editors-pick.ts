'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const togglePickSchema = z.object({
  siteId: z.string().uuid(),
  isPick: z.boolean(),
})

const updateNoteSchema = z.object({
  siteId: z.string().uuid(),
  note: z.string().max(500),
})

interface ActionResult {
  ok: boolean
  error?: string
}

async function requireAdmin(): Promise<{ ok: false; error: string } | { ok: true; userId: string }> {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return { ok: false, error: '로그인이 필요합니다' }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', auth.user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') {
    return { ok: false, error: 'admin 권한이 필요합니다' }
  }
  return { ok: true, userId: auth.user.id }
}

export async function toggleEditorsPick(input: unknown): Promise<ActionResult> {
  const parsed = togglePickSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid input' }

  const guard = await requireAdmin()
  if (!guard.ok) return { ok: false, error: guard.error }

  const supabase = await createClient()
  const { error } = await supabase
    .from('sites')
    .update({
      is_editors_pick: parsed.data.isPick,
      editors_pick_updated_at: new Date().toISOString(),
      editors_pick_updated_by: guard.userId,
    })
    .eq('id', parsed.data.siteId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/')
  revalidatePath('/admin/editors-pick')
  return { ok: true }
}

export async function updateEditorsNote(input: unknown): Promise<ActionResult> {
  const parsed = updateNoteSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid input' }

  const guard = await requireAdmin()
  if (!guard.ok) return { ok: false, error: guard.error }

  const supabase = await createClient()
  const { error } = await supabase
    .from('sites')
    .update({
      editors_note: parsed.data.note || null,
      editors_pick_updated_at: new Date().toISOString(),
      editors_pick_updated_by: guard.userId,
    })
    .eq('id', parsed.data.siteId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/')
  revalidatePath('/admin/editors-pick')
  return { ok: true }
}
