import Link from 'next/link'
import { getAllPostsForAdmin } from '@/lib/posts/queries'
import { deletePostAction } from '@/lib/posts/actions'
import { DeletePostButton } from '@/components/admin/DeletePostButton'

export const dynamic = 'force-dynamic'

const KO_DT = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

function fmt(iso: string | null): string {
  if (!iso) return '—'
  try {
    return KO_DT.format(new Date(iso))
  } catch {
    return '—'
  }
}

export default async function AdminPostsPage() {
  const posts = await getAllPostsForAdmin(200)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-[var(--font-outfit)] text-xl font-bold text-text-high">
            Posts
          </h2>
          <p className="text-[12px] text-text-muted mt-1">
            매거진 포스트 작성·수정·삭제 (admin 전용)
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-coral px-4 py-2 text-[13px] font-semibold text-coral-ink hover:bg-coral-hover transition-colors"
        >
          + 새 포스트
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-stroke bg-bg-surface px-6 py-16 text-center">
          <p className="text-sm text-text-medium mb-3">아직 포스트가 없습니다.</p>
          <Link
            href="/admin/posts/new"
            className="text-[13px] text-coral hover:text-coral-hover"
          >
            첫 포스트 작성 →
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-stroke bg-bg-surface overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="border-b border-stroke bg-bg-elevated/50 text-text-muted">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">제목</th>
                <th className="text-left px-4 py-2.5 font-medium hidden md:table-cell">
                  카테고리
                </th>
                <th className="text-left px-4 py-2.5 font-medium hidden lg:table-cell">
                  업데이트
                </th>
                <th className="text-left px-4 py-2.5 font-medium">상태</th>
                <th className="text-right px-4 py-2.5 font-medium">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke">
              {posts.map((post) => {
                const published = Boolean(post.publishedAt)
                return (
                  <tr key={post.id} className="hover:bg-bg-elevated/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-text-high hover:text-coral font-medium line-clamp-1"
                      >
                        {post.title}
                      </Link>
                      <p className="text-[11px] text-text-muted font-mono line-clamp-1">
                        /{post.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-text-medium hidden md:table-cell">
                      {post.category ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-text-muted text-[12px] hidden lg:table-cell">
                      {fmt(post.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      {published ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-active/15 text-active text-[11px] font-medium">
                          공개
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-elevated border border-stroke text-text-muted text-[11px] font-medium">
                          초안
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {published && (
                          <Link
                            href={`/posts/${post.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded px-2 py-1 text-[12px] text-text-medium hover:text-text-high hover:bg-bg-elevated"
                          >
                            보기
                          </Link>
                        )}
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="rounded px-2 py-1 text-[12px] text-text-medium hover:text-text-high hover:bg-bg-elevated"
                        >
                          편집
                        </Link>
                        <form action={deletePostAction} className="inline">
                          <input type="hidden" name="id" value={post.id} />
                          <DeletePostButton title={post.title} />
                        </form>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
