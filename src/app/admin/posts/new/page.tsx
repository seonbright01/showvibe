import Link from 'next/link'
import { PostForm } from '@/components/admin/PostForm'

export default function AdminNewPostPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/posts"
          className="text-[12px] text-text-muted hover:text-text-high"
        >
          ← Posts
        </Link>
        <span className="text-text-muted">/</span>
        <h2 className="font-[var(--font-outfit)] text-xl font-bold text-text-high">
          새 포스트
        </h2>
      </div>
      <PostForm mode="create" />
    </div>
  )
}
