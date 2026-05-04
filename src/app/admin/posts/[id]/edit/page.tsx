import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PostForm } from '@/components/admin/PostForm'
import { getPostByIdForAdmin } from '@/lib/posts/queries'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminEditPostPage({ params }: PageProps) {
  const { id } = await params
  const post = await getPostByIdForAdmin(id)

  if (!post) {
    notFound()
  }

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
        <h2 className="font-[var(--font-outfit)] text-xl font-bold text-text-high line-clamp-1">
          {post.title}
        </h2>
      </div>

      <PostForm
        mode="edit"
        postId={post.id}
        defaults={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          bodyMd: post.bodyMd,
          excerpt: post.excerpt ?? '',
          category: post.category ?? '',
          coverImageUrl: post.coverImageUrl ?? '',
          isPublished: Boolean(post.publishedAt),
        }}
      />
    </div>
  )
}
