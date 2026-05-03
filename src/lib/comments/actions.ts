'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { verifyTurnstile } from '@/lib/turnstile/verify'
import {
  createCommentSchema,
  reportCommentSchema,
  updateCommentSchema,
} from './validators'

interface ActionResult {
  success?: true
  error?: string
}

// Supabase의 placeholder Database 타입이 모든 Tables를 never로 좁히기 때문에
// 실제 generated types가 들어오기 전까지 from()을 untyped builder로 사용한다.
type SupabaseUntyped = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (table: string) => any
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return '알 수 없는 오류가 발생했습니다'
}

export async function createComment(input: unknown): Promise<ActionResult> {
  let data
  try {
    data = createCommentSchema.parse(input)
  } catch (error: unknown) {
    return { error: getErrorMessage(error) }
  }

  const ok = await verifyTurnstile(data.turnstileToken)
  if (!ok) return { error: 'Captcha 인증에 실패했습니다' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다' }

  const db = supabase as unknown as SupabaseUntyped
  const { error } = await db.from('comments').insert({
    site_id: data.siteId,
    user_id: user.id,
    body: data.body,
  })

  if (error) return { error: error.message as string }

  revalidatePath(`/projects/${data.siteId}`)
  return { success: true }
}

export async function reportComment(input: unknown): Promise<ActionResult> {
  let data
  try {
    data = reportCommentSchema.parse(input)
  } catch (error: unknown) {
    return { error: getErrorMessage(error) }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다' }

  const db = supabase as unknown as SupabaseUntyped
  const { error } = await db.from('comment_reports').insert({
    comment_id: data.commentId,
    reporter_user_id: user.id,
    reason: data.reason,
    detail: data.detail ?? null,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: '이미 신고하신 댓글입니다' }
    }
    return { error: error.message as string }
  }

  return { success: true }
}

export async function updateComment(input: unknown): Promise<ActionResult> {
  let data
  try {
    data = updateCommentSchema.parse(input)
  } catch (error: unknown) {
    return { error: getErrorMessage(error) }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다' }

  const db = supabase as unknown as SupabaseUntyped
  const { data: row, error } = (await db
    .from('comments')
    .update({ body: data.body })
    .eq('id', data.commentId)
    .eq('user_id', user.id)
    .select('site_id')
    .maybeSingle()) as { data: { site_id: string } | null; error: { message: string } | null }

  if (error || !row) {
    return { error: error?.message ?? '권한이 없거나 댓글을 찾을 수 없습니다' }
  }

  revalidatePath(`/projects/${row.site_id}`)
  return { success: true }
}

export async function deleteComment(commentId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다' }

  const db = supabase as unknown as SupabaseUntyped
  const { data: row, error } = (await db
    .from('comments')
    .update({ status: 'deleted' })
    .eq('id', commentId)
    .eq('user_id', user.id)
    .select('site_id')
    .maybeSingle()) as { data: { site_id: string } | null; error: { message: string } | null }

  if (error || !row) {
    return { error: error?.message ?? '권한이 없거나 댓글을 찾을 수 없습니다' }
  }

  revalidatePath(`/projects/${row.site_id}`)
  return { success: true }
}
