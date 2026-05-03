import { createClient } from '@/lib/supabase/server'
import { CommentForm } from './CommentForm'
import { CommentItem } from './CommentItem'
import type { CommentWithAuthor } from './types'

interface Props {
  siteId: string
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function CommentList({ siteId }: Props) {
  // siteId가 uuid 형식이 아니면 (mock id) 빈 상태로 노출
  const isValidUuid = UUID_REGEX.test(siteId)

  let comments: CommentWithAuthor[] = []
  let dbReady = isValidUuid
  let user: { id: string } | null = null

  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser

    if (isValidUuid) {
      const { data: rows, error } = await supabase
        .from('comments')
        .select(
          'id, body, like_count, report_count, created_at, updated_at, status, user_id, users:users(id, name, avatar_url, role)',
        )
        .eq('site_id', siteId)
        .eq('status', 'visible')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        dbReady = false
      } else {
        comments = (rows ?? []) as unknown as CommentWithAuthor[]
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[comments] CommentList failed:', (err as Error).message)
    }
    dbReady = false
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)]">
          Comments{' '}
          <span className="text-text-muted text-sm font-normal">
            ({comments.length})
          </span>
        </h2>
      </header>

      {dbReady ? (
        <CommentForm siteId={siteId} isAuthenticated={Boolean(user)} />
      ) : (
        <div className="rounded-xl border border-stroke bg-bg-elevated p-5 text-sm text-text-medium leading-relaxed">
          <p className="text-text-high font-medium mb-1">
            DB 시드 후 댓글 기능이 활성화됩니다.
          </p>
          <p>
            현재 표시된 프로젝트는 mock 데이터이며, 댓글 시스템은 실제 사이트가
            DB에 등록된 후 사용 가능합니다.
          </p>
        </div>
      )}

      {dbReady && comments.length === 0 ? (
        <p className="text-text-muted text-sm py-8 text-center">
          아직 댓글이 없습니다. 첫 댓글을 남겨보세요.
        </p>
      ) : null}

      {comments.length > 0 && (
        <ul className="divide-y divide-stroke">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              currentUserId={user?.id ?? null}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
