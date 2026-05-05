'use client'

import { useActionState, useEffect, useState } from 'react'
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

const CATEGORIES = [
  'notice',
  'events',
  'news',
  'trends',
  'reviews',
  'tools',
  'interview',
  'tutorial',
  'other',
] as const

const COVER_MAX_BYTES = 5 * 1024 * 1024
const COVER_ACCEPT = 'image/png,image/jpeg,image/webp'

export function PostForm({ mode, defaults, postId }: PostFormProps) {
  const router = useRouter()
  const merged: PostFormDefaults = { ...EMPTY_DEFAULTS, ...defaults }

  const [coverUrl, setCoverUrl] = useState(merged.coverImageUrl)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

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

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!COVER_ACCEPT.split(',').includes(file.type)) {
      setUploadError('PNG, JPEG, WebP 이미지만 업로드 가능합니다.')
      e.target.value = ''
      return
    }
    if (file.size > COVER_MAX_BYTES) {
      setUploadError('이미지 크기는 5MB 이하여야 합니다.')
      e.target.value = ''
      return
    }
    setUploadError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/screenshot-upload', {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(j.error ?? '업로드 실패')
      }
      const { url } = (await res.json()) as { url: string }
      setCoverUrl(url)
    } catch (err) {
      setUploadError((err as Error).message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

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
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-text-medium font-medium">카테고리</span>
          <select
            name="category"
            defaultValue={merged.category}
            className="w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-stroke text-[13px] text-text-high focus:outline-none focus:border-coral"
          >
            <option value="">— 미분류 —</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            {merged.category &&
              !CATEGORIES.includes(merged.category as (typeof CATEGORIES)[number]) && (
                <option value={merged.category}>
                  {merged.category} (custom)
                </option>
              )}
          </select>
        </label>

        <Field
          label="커버 이미지 URL"
          name="coverImageUrl"
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          placeholder="https://... 또는 아래에서 직접 업로드"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs text-text-medium font-medium">
          커버 이미지 첨부 (선택)
        </span>
        <div className="flex items-start gap-3">
          <label
            className={`flex h-24 w-32 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-dashed border-stroke bg-bg-elevated/50 hover:bg-bg-elevated text-[11px] text-text-medium transition-colors ${
              uploading ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <input
              type="file"
              accept={COVER_ACCEPT}
              onChange={handleFileChange}
              className="sr-only"
              disabled={uploading}
            />
            {uploading ? '업로드 중…' : '파일 선택'}
          </label>

          {coverUrl && (
            <div className="flex flex-col gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverUrl}
                alt="커버 미리보기"
                className="h-24 w-32 object-cover rounded-lg border border-stroke"
              />
              <button
                type="button"
                onClick={() => setCoverUrl('')}
                className="text-[11px] text-coral hover:text-coral-hover self-start"
              >
                제거
              </button>
            </div>
          )}
        </div>
        {uploadError && (
          <p className="text-[12px] text-coral">{uploadError}</p>
        )}
        <p className="text-[11px] text-text-muted">
          URL을 직접 입력해도 되고, 위 영역에서 파일을 첨부해도 됩니다 (PNG/JPEG/WebP, 5MB 이하).
        </p>
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
  value?: string
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void
  required?: boolean
  placeholder?: string
  as?: 'input' | 'textarea'
  rows?: number
}

function Field({
  label,
  name,
  defaultValue,
  value,
  onChange,
  required,
  placeholder,
  as = 'input',
  rows,
}: FieldProps) {
  const baseClass =
    'w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-stroke text-[13px] text-text-high placeholder:text-text-muted focus:outline-none focus:border-coral'

  const controlled = value !== undefined

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-text-medium font-medium">
        {label}
        {required && <span className="text-coral ml-1">*</span>}
      </span>
      {as === 'textarea' ? (
        <textarea
          name={name}
          defaultValue={controlled ? undefined : defaultValue}
          value={controlled ? value : undefined}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          rows={rows}
          className={`${baseClass} font-mono text-[12.5px] leading-relaxed`}
        />
      ) : (
        <input
          name={name}
          defaultValue={controlled ? undefined : defaultValue}
          value={controlled ? value : undefined}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={baseClass}
        />
      )}
    </label>
  )
}
