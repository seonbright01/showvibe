'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const siteIdSchema = z.string().uuid()

export interface ToggleResult {
  ok: boolean
  isOn: boolean
  count?: number
  error?: string
}

export async function toggleLike(siteIdInput: unknown): Promise<ToggleResult> {
  const parsed = siteIdSchema.safeParse(siteIdInput)
  if (!parsed.success) return { ok: false, isOn: false, error: 'invalid site id' }
  const siteId = parsed.data

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return { ok: false, isOn: false, error: '로그인이 필요합니다' }
  const userId = auth.user.id

  const { data: existing } = await supabase
    .from('site_likes')
    .select('user_id')
    .eq('site_id', siteId)
    .eq('user_id', userId)
    .maybeSingle()

  let isOn: boolean
  if (existing) {
    const { error } = await supabase
      .from('site_likes')
      .delete()
      .eq('site_id', siteId)
      .eq('user_id', userId)
    if (error) return { ok: false, isOn: true, error: error.message }
    isOn = false
  } else {
    const { error } = await supabase
      .from('site_likes')
      .insert({ site_id: siteId, user_id: userId })
    if (error) return { ok: false, isOn: false, error: error.message }
    isOn = true
  }

  const { count } = await supabase
    .from('site_likes')
    .select('*', { count: 'exact', head: true })
    .eq('site_id', siteId)

  revalidatePath(`/projects/${siteId}`)
  return { ok: true, isOn, count: count ?? 0 }
}

export async function toggleSave(siteIdInput: unknown): Promise<ToggleResult> {
  const parsed = siteIdSchema.safeParse(siteIdInput)
  if (!parsed.success) return { ok: false, isOn: false, error: 'invalid site id' }
  const siteId = parsed.data

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return { ok: false, isOn: false, error: '로그인이 필요합니다' }
  const userId = auth.user.id

  const { data: existing } = await supabase
    .from('site_saves')
    .select('user_id')
    .eq('site_id', siteId)
    .eq('user_id', userId)
    .maybeSingle()

  let isOn: boolean
  if (existing) {
    const { error } = await supabase
      .from('site_saves')
      .delete()
      .eq('site_id', siteId)
      .eq('user_id', userId)
    if (error) return { ok: false, isOn: true, error: error.message }
    isOn = false
  } else {
    const { error } = await supabase
      .from('site_saves')
      .insert({ site_id: siteId, user_id: userId })
    if (error) return { ok: false, isOn: false, error: error.message }
    isOn = true
  }

  revalidatePath(`/projects/${siteId}`)
  revalidatePath('/library')
  return { ok: true, isOn }
}
