'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/guards'

export type PostActionResult =
  | { error: string }
  | { success: true; id: string; slug: string }

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

function calcReadTime(bodyMd: string): number {
  const words = bodyMd.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

interface PostInput {
  title: string
  slug: string
  bodyMd: string
  excerpt: string | null
  category: string | null
  coverImageUrl: string | null
  publish: boolean
}

function readPostInput(formData: FormData): PostInput | { error: string } {
  const title = String(formData.get('title') ?? '').trim()
  const slugRaw = String(formData.get('slug') ?? '').trim()
  const bodyMd = String(formData.get('bodyMd') ?? '').trim()
  const excerpt = String(formData.get('excerpt') ?? '').trim()
  const category = String(formData.get('category') ?? '').trim()
  const coverImageUrl = String(formData.get('coverImageUrl') ?? '').trim()
  const publish = formData.get('publish') === 'on' || formData.get('publish') === 'true'

  if (title.length < 2 || title.length > 200) {
    return { error: '제목은 2~200자여야 합니다.' }
  }
  if (!bodyMd) {
    return { error: '본문을 입력하세요.' }
  }
  const slug = slugRaw ? slugify(slugRaw) : slugify(title)
  if (!slug || !SLUG_REGEX.test(slug)) {
    return { error: '유효한 slug를 입력하세요 (영문 소문자/숫자/하이픈).' }
  }

  return {
    title,
    slug,
    bodyMd,
    excerpt: excerpt || null,
    category: category || null,
    coverImageUrl: coverImageUrl || null,
    publish,
  }
}

export async function createPostAction(
  _prevState: PostActionResult | null,
  formData: FormData,
): Promise<PostActionResult> {
  const admin = await requireAdmin()
  const parsed = readPostInput(formData)
  if ('error' in parsed) return parsed

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_user_id: admin.id,
      title: parsed.title,
      slug: parsed.slug,
      body_md: parsed.bodyMd,
      excerpt: parsed.excerpt,
      category: parsed.category,
      cover_image_url: parsed.coverImageUrl,
      read_time_minutes: calcReadTime(parsed.bodyMd),
      published_at: parsed.publish ? new Date().toISOString() : null,
    })
    .select('id, slug')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/admin/posts')
  revalidatePath('/posts')
  if (parsed.publish) revalidatePath(`/posts/${data.slug}`)
  return { success: true, id: data.id, slug: data.slug }
}

export async function updatePostAction(
  postId: string,
  _prevState: PostActionResult | null,
  formData: FormData,
): Promise<PostActionResult> {
  await requireAdmin()
  const parsed = readPostInput(formData)
  if ('error' in parsed) return parsed

  const supabase = await createClient()
  const { data: existing } = await supabase
    .from('posts')
    .select('published_at, slug')
    .eq('id', postId)
    .maybeSingle()

  if (!existing) return { error: '존재하지 않는 포스트입니다.' }

  const { data, error } = await supabase
    .from('posts')
    .update({
      title: parsed.title,
      slug: parsed.slug,
      body_md: parsed.bodyMd,
      excerpt: parsed.excerpt,
      category: parsed.category,
      cover_image_url: parsed.coverImageUrl,
      read_time_minutes: calcReadTime(parsed.bodyMd),
      published_at: parsed.publish
        ? ((existing as { published_at: string | null }).published_at ?? new Date().toISOString())
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)
    .select('id, slug')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/admin/posts')
  revalidatePath('/posts')
  revalidatePath(`/posts/${(existing as { slug: string }).slug}`)
  revalidatePath(`/posts/${data.slug}`)
  return { success: true, id: data.id, slug: data.slug }
}

export async function deletePostAction(formData: FormData): Promise<void> {
  await requireAdmin()
  const id = String(formData.get('id') ?? '')
  if (!id) return

  const supabase = await createClient()
  await supabase.from('posts').delete().eq('id', id)
  revalidatePath('/admin/posts')
  revalidatePath('/posts')
  redirect('/admin/posts')
}
