import {
  AVATAR_PRESETS,
  getAvatarPreset,
  type AvatarPresetId,
  type AvatarPreset,
} from '@/lib/avatars/presets'

interface AvatarSvgProps {
  presetId: AvatarPresetId
  size?: number
  className?: string
  animated?: boolean
}

export function AvatarSvg({
  presetId,
  size = 64,
  className,
  animated = false,
}: AvatarSvgProps) {
  const preset = getAvatarPreset(presetId)
  const animClass = animated ? 'sv-anim-float' : ''

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={`${preset.label} avatar`}
      className={[className, animClass].filter(Boolean).join(' ')}
    >
      <defs>
        <linearGradient id={`bg-${presetId}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={preset.bg} />
          <stop offset="100%" stopColor={preset.accent} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill={`url(#bg-${presetId})`} />
      {renderCharacter(preset)}
    </svg>
  )
}

function renderCharacter(preset: AvatarPreset) {
  switch (preset.id) {
    case 'm1': return <ManShortHair preset={preset} />
    case 'm2': return <ManSideSwept preset={preset} />
    case 'm3': return <ManCurly preset={preset} />
    case 'm4': return <ManBuzzCut preset={preset} />
    case 'w1': return <WomanLong preset={preset} />
    case 'w2': return <WomanBob preset={preset} />
    case 'w3': return <WomanPony preset={preset} />
    case 'w4': return <WomanWavy preset={preset} />
    case 'dog': return <DogFace preset={preset} />
    case 'cat': return <CatFace preset={preset} />
  }
}

function Eyes({ y = 50, dx = 8 }: { y?: number; dx?: number }) {
  return (
    <g fill="#1A1A1A">
      <circle cx={50 - dx} cy={y} r="2.2" />
      <circle cx={50 + dx} cy={y} r="2.2" />
    </g>
  )
}

function Smile({ y = 60, w = 6 }: { y?: number; w?: number }) {
  return (
    <path
      d={`M${50 - w} ${y} Q50 ${y + 4} ${50 + w} ${y}`}
      stroke="#1A1A1A"
      strokeWidth="1.6"
      strokeLinecap="round"
      fill="none"
    />
  )
}

function ManShortHair({ preset }: { preset: AvatarPreset }) {
  return (
    <g>
      <ellipse cx="50" cy="78" rx="22" ry="14" fill={preset.skin} />
      <circle cx="50" cy="50" r="18" fill={preset.skin} />
      <path d="M32 44 Q50 26 68 44 L68 38 Q50 22 32 38 Z" fill={preset.hair} />
      <Eyes y={50} dx={6} />
      <Smile y={58} w={5} />
    </g>
  )
}

function ManSideSwept({ preset }: { preset: AvatarPreset }) {
  return (
    <g>
      <ellipse cx="50" cy="78" rx="22" ry="14" fill={preset.skin} />
      <circle cx="50" cy="50" r="18" fill={preset.skin} />
      <path d="M32 42 Q40 24 64 30 Q70 38 68 44 L60 40 Q50 36 32 44 Z" fill={preset.hair} />
      <Eyes y={51} dx={6} />
      <Smile y={59} w={5} />
    </g>
  )
}

function ManCurly({ preset }: { preset: AvatarPreset }) {
  return (
    <g>
      <ellipse cx="50" cy="78" rx="22" ry="14" fill={preset.skin} />
      <circle cx="50" cy="50" r="18" fill={preset.skin} />
      <g fill={preset.hair}>
        <circle cx="38" cy="34" r="6" />
        <circle cx="46" cy="30" r="6" />
        <circle cx="54" cy="30" r="6" />
        <circle cx="62" cy="34" r="6" />
        <circle cx="34" cy="42" r="5" />
        <circle cx="66" cy="42" r="5" />
      </g>
      <Eyes y={52} dx={6} />
      <Smile y={60} w={5} />
    </g>
  )
}

function ManBuzzCut({ preset }: { preset: AvatarPreset }) {
  return (
    <g>
      <ellipse cx="50" cy="78" rx="22" ry="14" fill={preset.skin} />
      <circle cx="50" cy="50" r="18" fill={preset.skin} />
      <path d="M32 46 Q34 30 50 30 Q66 30 68 46 Z" fill={preset.hair} opacity="0.85" />
      <Eyes y={52} dx={6} />
      <path d="M44 60 L56 60" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  )
}

function WomanLong({ preset }: { preset: AvatarPreset }) {
  return (
    <g>
      <path d="M28 56 Q26 84 50 86 Q74 84 72 56 L72 44 Q50 22 28 44 Z" fill={preset.hair} />
      <ellipse cx="50" cy="78" rx="20" ry="12" fill={preset.skin} />
      <circle cx="50" cy="52" r="17" fill={preset.skin} />
      <path d="M34 44 Q50 28 66 44 L66 40 Q50 24 34 40 Z" fill={preset.hair} />
      <Eyes y={52} dx={6} />
      <Smile y={60} w={5} />
      <circle cx="40" cy="58" r="2" fill={preset.accent} opacity="0.45" />
      <circle cx="60" cy="58" r="2" fill={preset.accent} opacity="0.45" />
    </g>
  )
}

function WomanBob({ preset }: { preset: AvatarPreset }) {
  return (
    <g>
      <path d="M30 50 Q28 70 50 72 Q72 70 70 50 L70 42 Q50 22 30 42 Z" fill={preset.hair} />
      <ellipse cx="50" cy="76" rx="20" ry="12" fill={preset.skin} />
      <circle cx="50" cy="50" r="17" fill={preset.skin} />
      <Eyes y={50} dx={6} />
      <Smile y={58} w={5} />
    </g>
  )
}

function WomanPony({ preset }: { preset: AvatarPreset }) {
  return (
    <g>
      <path d="M68 38 Q82 50 80 70 Q72 64 68 56 Z" fill={preset.hair} />
      <ellipse cx="50" cy="78" rx="20" ry="12" fill={preset.skin} />
      <circle cx="50" cy="50" r="17" fill={preset.skin} />
      <path d="M33 44 Q50 26 67 44 L67 40 Q50 22 33 40 Z" fill={preset.hair} />
      <Eyes y={51} dx={6} />
      <Smile y={59} w={5} />
    </g>
  )
}

function WomanWavy({ preset }: { preset: AvatarPreset }) {
  return (
    <g>
      <path d="M26 52 Q22 76 36 84 Q40 70 38 58 Z" fill={preset.hair} />
      <path d="M74 52 Q78 76 64 84 Q60 70 62 58 Z" fill={preset.hair} />
      <ellipse cx="50" cy="78" rx="20" ry="12" fill={preset.skin} />
      <circle cx="50" cy="50" r="17" fill={preset.skin} />
      <path d="M34 44 Q42 28 58 30 Q66 38 66 44 L60 40 Q50 36 34 44 Z" fill={preset.hair} />
      <Eyes y={51} dx={6} />
      <Smile y={59} w={5} />
    </g>
  )
}

function DogFace({ preset }: { preset: AvatarPreset }) {
  return (
    <g>
      <ellipse cx="32" cy="44" rx="9" ry="14" fill={preset.hair} transform="rotate(-25 32 44)" />
      <ellipse cx="68" cy="44" rx="9" ry="14" fill={preset.hair} transform="rotate(25 68 44)" />
      <circle cx="50" cy="56" r="22" fill={preset.skin} />
      <ellipse cx="50" cy="62" rx="10" ry="8" fill="#FFFFFF" opacity="0.9" />
      <circle cx="42" cy="52" r="2.5" fill="#1A1A1A" />
      <circle cx="58" cy="52" r="2.5" fill="#1A1A1A" />
      <ellipse cx="50" cy="62" rx="3" ry="2.2" fill="#1A1A1A" />
      <path d="M44 67 Q50 71 56 67" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </g>
  )
}

function CatFace({ preset }: { preset: AvatarPreset }) {
  return (
    <g>
      <polygon points="28,32 38,46 22,48" fill={preset.hair} />
      <polygon points="72,32 78,48 62,46" fill={preset.hair} />
      <polygon points="32,36 36,44 27,45" fill={preset.accent} opacity="0.6" />
      <polygon points="68,36 73,45 64,44" fill={preset.accent} opacity="0.6" />
      <circle cx="50" cy="56" r="22" fill={preset.skin} />
      <ellipse cx="44" cy="55" rx="3" ry="4" fill="#1A1A1A" />
      <ellipse cx="56" cy="55" rx="3" ry="4" fill="#1A1A1A" />
      <path d="M48 64 L52 64 L50 67 Z" fill={preset.accent} />
      <path d="M50 67 Q47 70 45 69" stroke="#1A1A1A" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M50 67 Q53 70 55 69" stroke="#1A1A1A" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <line x1="34" y1="60" x2="42" y2="61" stroke="#1A1A1A" strokeWidth="1" />
      <line x1="34" y1="64" x2="42" y2="64" stroke="#1A1A1A" strokeWidth="1" />
      <line x1="58" y1="61" x2="66" y2="60" stroke="#1A1A1A" strokeWidth="1" />
      <line x1="58" y1="64" x2="66" y2="64" stroke="#1A1A1A" strokeWidth="1" />
    </g>
  )
}

export function AllAvatarsPreview({ size = 56 }: { size?: number }) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {AVATAR_PRESETS.map((p) => (
        <AvatarSvg key={p.id} presetId={p.id} size={size} />
      ))}
    </div>
  )
}
