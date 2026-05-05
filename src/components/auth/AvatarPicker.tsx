'use client'

import { useState } from 'react'
import { AVATAR_PRESETS, type AvatarPresetId } from '@/lib/avatars/presets'
import { AvatarSvg } from '@/components/ui/AvatarSvg'

interface AvatarPickerProps {
  name?: string
  defaultValue?: AvatarPresetId
  size?: number
}

const CATEGORY_LABEL: Record<'male' | 'female' | 'pet', string> = {
  male: '남자',
  female: '여자',
  pet: '동물',
}

export function AvatarPicker({
  name = 'avatar',
  defaultValue = 'm1',
  size = 56,
}: AvatarPickerProps) {
  const [selected, setSelected] = useState<AvatarPresetId>(defaultValue)

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-text-medium font-medium">
        프로필 아바타
      </label>
      <input type="hidden" name={name} value={selected} />
      <div
        className="grid grid-cols-5 gap-2 rounded-lg border border-stroke bg-bg-elevated p-3"
        role="radiogroup"
        aria-label="프로필 아바타 선택"
      >
        {AVATAR_PRESETS.map((p) => {
          const active = selected === p.id
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${CATEGORY_LABEL[p.category]} - ${p.label}`}
              onClick={() => setSelected(p.id)}
              className={[
                'relative flex items-center justify-center rounded-full p-0.5 transition-all',
                active
                  ? 'ring-2 ring-coral ring-offset-2 ring-offset-bg-elevated scale-105'
                  : 'opacity-70 hover:opacity-100 hover:scale-105',
              ].join(' ')}
            >
              <AvatarSvg presetId={p.id} size={size} animated={active} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
