export type AvatarPresetId =
  | 'm1' | 'm2' | 'm3' | 'm4'
  | 'w1' | 'w2' | 'w3' | 'w4'
  | 'dog' | 'cat'

export type AvatarCategory = 'male' | 'female' | 'pet'

export interface AvatarPreset {
  id: AvatarPresetId
  label: string
  category: AvatarCategory
  /** DiceBear seed for `notionists` style. Pets ignore this. */
  seed: string
}

export const AVATAR_PRESETS: readonly AvatarPreset[] = [
  { id: 'm1', label: 'Jimin',  category: 'male',   seed: 'jimin-m' },
  { id: 'm2', label: 'David',  category: 'male',   seed: 'david-m' },
  { id: 'm3', label: 'Kenji',  category: 'male',   seed: 'kenji-m' },
  { id: 'm4', label: 'Leo',    category: 'male',   seed: 'leo-m' },
  { id: 'w1', label: 'Sarah',  category: 'female', seed: 'sarah-w' },
  { id: 'w2', label: 'Mina',   category: 'female', seed: 'mina-w' },
  { id: 'w3', label: 'Aria',   category: 'female', seed: 'aria-w' },
  { id: 'w4', label: 'Luna',   category: 'female', seed: 'luna-w' },
  { id: 'dog', label: 'Pup',   category: 'pet',    seed: 'pup' },
  { id: 'cat', label: 'Kitty', category: 'pet',    seed: 'kitty' },
] as const

export const AVATAR_PRESET_PREFIX = 'preset:'

/**
 * Local URL for a pre-baked notionists SVG (humans only).
 * Files were generated once via DiceBear and live in /public/avatars/.
 */
export function humanAvatarUrl(seed: string): string {
  return `/avatars/${seed}.svg`
}

export function isAvatarPresetId(value: string): value is AvatarPresetId {
  return AVATAR_PRESETS.some((p) => p.id === value)
}

export function presetIdToAvatarUrl(id: AvatarPresetId): string {
  return `${AVATAR_PRESET_PREFIX}${id}`
}

export function parseAvatarUrl(url: string | null | undefined): AvatarPresetId | null {
  if (!url) return null
  if (!url.startsWith(AVATAR_PRESET_PREFIX)) return null
  const id = url.slice(AVATAR_PRESET_PREFIX.length)
  return isAvatarPresetId(id) ? id : null
}

export function getAvatarPreset(id: AvatarPresetId): AvatarPreset {
  const found = AVATAR_PRESETS.find((p) => p.id === id)
  if (!found) throw new Error(`Unknown avatar preset: ${id}`)
  return found
}
