'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  createPostAction,
  updatePostAction,
  type PostActionResult,
} from '@/lib/posts/actions'

interface PostFormDefaults {
  id?: string
  title: string
  slug: string
  bodyMd: string
  excerpt: string
  category: string
  coverImageUrl: string
  isPublished: boolean
}

interface PostFormProps {
  mode: 'create' | 'edit'
  defaults?: Partial<PostFormDefaults>
  postId?: string
}

const EMPTY_DEFAULTS: PostFormDefaults = {
  title: '',
  slug: '',
  bodyMd: '',
  excerpt: '',
  category: '',
  coverImageUrl: '',
  isPublished: false,
}

export function PostForm({ mode, defaults, postId }: PostFormProps) {
  const router = useRouter()
  const merged: PostFormDefaults = { ...EMPTY_DEFAULTS, ...defaults }

  const action =
    mode === 'create'
      ? createPostAction
      : (prev: PostActionResult | null, fd: FormData) =>
          updatePostAction(postId ?? '', prev, fd)

  const [state, formAction, pending] = useActionState<
    PostActionResult | null,
    FormData
  >(action, null)

  useEffect(() => {
    if (state && 'success' in state && state.success) {
      router.push('/admin/posts')
      router.refresh()
    }
  }, [state, router])

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="제목" name="title" defaultValue={merged.title} required />
        <Field
          label="Slug (선택)"
          name="slug"
          defaultValue={merged.slug}
          placeholder="auto from title"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="카테고리"
          name="category"
          defaultValue={merged.category}
          placeholder="Trends / Reviews / ..."
        />
        <Field
          label="커버 이미지 URL"
          name="coverImageUrl"
          defaultValue={merged.coverImageUrl}
          placeholder="https://..."
        />
      </div>

      <Field
        label="요약 (Excerpt)"
        name="excerpt"
        defaultValue={merged.excerpt}
        as="textarea"
        rows={2}
      />

      <Field
        label="본문 (Markdown)"
        name="bodyMd"
        defaultValue={merged.bodyMd}
        as="textarea"
        rows={18}
        required
      />

      <label className="flex items-center gap-2 text-[13px] text-text-medium">
        <input
          type="checkbox"
          name="publish"
          defaultChecked={merged.isPublished}
          className="h-4 w-4 rounded border-stroke bg-bg-elevated text-coral focus:ring-coral"
        />
        즉시 공개 (체크 해제 시 초안 저장)
      </label>

      {state && 'error' in state && (
        <p
          role="alert"
          className="text-[13px] text-coral bg-coral/10 border border-coral/30 rounded-lg px-3 py-2"
        >
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-coral px-5 py-2.5 text-[13px] font-semibold text-coral-ink hover:bg-coral-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? '저장 중…' : mode === 'create' ? '포스트 생성' : '변경사항 저장'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/posts')}
          className="rounded-lg border border-stroke px-4 py-2.5 text-[13px] font-medium text-text-medium hover:text-text-high hover:bg-bg-elevated transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  )
}

interface FieldProps {
  label: string
  name: string
  defaultValue?: string
  required?: boolean
  placeholder?: string
  as?: 'input' | 'textarea'
  rows?: number
}

function Field({
  label,
  name,
  defaultValue,
  required,
  placeholder,
  as = 'input',
  rows,
}: FieldProps) {
  const baseClass =
    'w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-stroke text-[13px] text-text-high placeholder:text-text-muted focus:outline-none focus:border-coral'

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-text-medium font-medium">
        {label}
        {required && <span className="text-coral ml-1">*</span>}
      </span>
      {as === 'textarea' ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          rows={rows}
          className={`${baseClass} font-mono text-[12.5px] leading-relaxed`}
        />
      ) : (
        <input
          name={name}
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          className={baseClass}
        />
      )}
    </label>
  )
}
