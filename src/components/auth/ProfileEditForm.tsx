'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  updateProfileAction,
  type UpdateProfileResult,
} from '@/lib/auth/actions'
import { AVATAR_PRESETS, type AvatarPresetId } from '@/lib/avatars/presets'
import { AvatarSvg } from '@/components/ui/AvatarSvg'
import { AvatarImage } from '@/components/ui/AvatarImage'

interface ProfileEditFormProps {
  initialName: string
  initialBio: string
  initialAvatarUrl: string | null
  initialPresetId: AvatarPresetId | null
}

const CATEGORY_LABEL: Record<'male' | 'female' | 'pet', string> = {
  male: '남자',
  female: '여자',
  pet: '동물',
}

export function ProfileEditForm({
  initialName,
  initialBio,
  initialAvatarUrl,
  initialPresetId,
}: ProfileEditFormProps) {
  const router = useRouter()
  // null = 변경 안함(현재 유지), preset id = 선택한 새 아바타
  const [selectedPreset, setSelectedPreset] = useState<AvatarPresetId | null>(
    initialPresetId,
  )

  const [state, formAction, pending] = useActionState<
    UpdateProfileResult | null,
    FormData
  >(updateProfileAction, null)

  useEffect(() => {
    if (state && 'success' in state && state.success) {
      router.push('/account')
      router.refresh()
    }
  }, [state, router])

  // selectedPreset이 null이면 서버는 avatar_url 갱신 안함 ('__keep__' sentinel)
  const avatarValue: string = selectedPreset ?? '__keep__'

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-xs text-text-medium font-medium">
          프로필 아바타
        </label>
        <input type="hidden" name="avatar" value={avatarValue} />

        {/* 현재 아바타 미리보기 — preset이 아닌 OAuth/외부 URL일 때만 별도 표시 */}
        {initialAvatarUrl && initialPresetId === null && (
          <div className="flex items-center gap-3 rounded-lg border border-stroke bg-bg-elevated p-3">
            <AvatarImage
              avatarUrl={initialAvatarUrl}
              name={initialName}
              size={48}
            />
            <div className="flex-1 text-[12px] text-text-muted leading-snug">
              현재 아바타 (외부 계정에서 가져옴).
              <br />
              아래 10종 중 선택하면 교체되고, 선택 안 하면 그대로 유지됩니다.
            </div>
          </div>
        )}

        {/* Picker — 항상 표시 */}
        <div
          className="grid grid-cols-5 gap-2 rounded-lg border border-stroke bg-bg-elevated p-3"
          role="radiogroup"
          aria-label="프로필 아바타 선택"
        >
          {AVATAR_PRESETS.map((p) => {
            const active = selectedPreset === p.id
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={`${CATEGORY_LABEL[p.category]} - ${p.label}`}
                onClick={() => setSelectedPreset(p.id)}
                className={[
                  'relative flex items-center justify-center rounded-full p-0.5 transition-all',
                  active
                    ? 'ring-2 ring-coral ring-offset-2 ring-offset-bg-elevated scale-105'
                    : 'opacity-70 hover:opacity-100 hover:scale-105',
                ].join(' ')}
              >
                <AvatarSvg presetId={p.id} size={56} animated={active} />
              </button>
            )
          })}
        </div>

        {/* 선택 해제 (현재 유지로 되돌리기) — 사용자가 picker 클릭한 뒤 마음 바꿨을 때 */}
        {selectedPreset !== null && initialPresetId !== selectedPreset && (
          <button
            type="button"
            onClick={() => setSelectedPreset(initialPresetId)}
            className="self-start text-[12px] text-text-muted hover:text-text-high"
          >
            ← 선택 취소
          </button>
        )}
      </div>

      <Field
        label="이름"
        name="name"
        defaultValue={initialName}
        required
        maxLength={60}
        placeholder="홍길동"
      />

      <Field
        label="소개 (선택)"
        name="bio"
        defaultValue={initialBio}
        as="textarea"
        rows={3}
        maxLength={500}
        placeholder="바이브코딩으로 무엇을 만들고 있나요?"
      />

      {state && 'error' in state && (
        <p
          role="alert"
          className="text-[13px] text-coral bg-coral/10 border border-coral/30 rounded-lg px-3 py-2"
        >
          {state.error}
        </p>
      )}

      {state && 'success' in state && state.success && (
        <p
          role="status"
          className="text-[13px] text-active bg-active/10 border border-active/30 rounded-lg px-3 py-2"
        >
          저장되었습니다.
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-coral px-5 py-2.5 text-[13px] font-semibold text-coral-ink hover:bg-coral-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? '저장 중…' : '변경사항 저장'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/account')}
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
  maxLength?: number
  as?: 'input' | 'textarea'
  rows?: number
}

function Field({
  label,
  name,
  defaultValue,
  required,
  placeholder,
  maxLength,
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
          maxLength={maxLength}
          rows={rows}
          className={`${baseClass} leading-relaxed`}
        />
      ) : (
        <input
          name={name}
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          className={baseClass}
        />
      )}
    </label>
  )
}
