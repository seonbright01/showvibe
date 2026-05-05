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

// 보안 (P3.1): 로그인 + ban 체크. 익명 허용이 아닌 mutation 에서 사용.
async function ensureActiveUser(
  db: SupabaseUntyped,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: profile } = (await db
    .from('users')
    .select('is_banned')
    .eq('id', userId)
    .maybeSingle()) as { data: { is_banned: boolean } | null }
  if (profile?.is_banned) {
    return { ok: false, error: '이용이 정지된 계정입니다' }
  }
  return { ok: true }
}

// 보안 (P3.4): 최근 60초 같은 user 의 comment 가 10건 초과면 reject.
const COMMENT_RATE_LIMIT_PER_MIN = 10
async function ensureCommentRateLimit(
  db: SupabaseUntyped,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const sinceIso = new Date(Date.now() - 60_000).toISOString()
  const { count } = (await db
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', sinceIso)) as { count: number | null }
  if ((count ?? 0) >= COMMENT_RATE_LIMIT_PER_MIN) {
    return {
      ok: false,
      error: '너무 빠르게 댓글을 작성하고 있습니다. 잠시 후 다시 시도해주세요.',
    }
  }
  return { ok: true }
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

  const active = await ensureActiveUser(db, user.id)
  if (!active.ok) return { error: active.error }

  const throttle = await ensureCommentRateLimit(db, user.id)
  if (!throttle.ok) return { error: throttle.error }

  const insertPayload: Record<string, string> = {
    user_id: user.id,
    body: data.body,
  }
  if (data.siteId) insertPayload.site_id = data.siteId
  if (data.postId) insertPayload.post_id = data.postId

  const { error } = await db.from('comments').insert(insertPayload)

  if (error) return { error: error.message as string }

  if (data.siteId) revalidatePath(`/projects/${data.siteId}`)
  if (data.postId) revalidatePath('/posts', 'layout')
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

  const active = await ensureActiveUser(db, user.id)
  if (!active.ok) return { error: active.error }

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

  const active = await ensureActiveUser(db, user.id)
  if (!active.ok) return { error: active.error }

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

  const active = await ensureActiveUser(db, user.id)
  if (!active.ok) return { error: active.error }

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
