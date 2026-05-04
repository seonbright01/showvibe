export type AvatarPresetId =
  | 'm1' | 'm2' | 'm3' | 'm4'
  | 'w1' | 'w2' | 'w3' | 'w4'
  | 'dog' | 'cat'

export interface AvatarPreset {
  id: AvatarPresetId
  label: string
  category: 'male' | 'female' | 'pet'
  bg: string
  accent: string
  hair: string
  skin: string
}

export const AVATAR_PRESETS: readonly AvatarPreset[] = [
  { id: 'm1', label: 'Lee', category: 'male', bg: '#1F2937', accent: '#E54F42', hair: '#1A1A1A', skin: '#F4D2B0' },
  { id: 'm2', label: 'Min', category: 'male', bg: '#0F3055', accent: '#3B82F6', hair: '#2C1810', skin: '#E8C3A5' },
  { id: 'm3', label: 'Park', category: 'male', bg: '#3D2657', accent: '#A855F7', hair: '#3F1E0A', skin: '#F5DDC0' },
  { id: 'm4', label: 'Han', category: 'male', bg: '#0E3A2F', accent: '#10B981', hair: '#1F1F1F', skin: '#E5BC95' },
  { id: 'w1', label: 'Kim', category: 'female', bg: '#3B1F3D', accent: '#EC4899', hair: '#2A1A0F', skin: '#F8DDC4' },
  { id: 'w2', label: 'Yoon', category: 'female', bg: '#1F3D3B', accent: '#06B6D4', hair: '#5C3A1E', skin: '#F4D2B0' },
  { id: 'w3', label: 'Choi', category: 'female', bg: '#3D2A1F', accent: '#F59E0B', hair: '#1A1A1A', skin: '#F0CCA8' },
  { id: 'w4', label: 'Seo', category: 'female', bg: '#2D2D55', accent: '#818CF8', hair: '#7B4F2A', skin: '#F8DDC4' },
  { id: 'dog', label: 'Pup', category: 'pet', bg: '#3D2D1A', accent: '#F59E0B', hair: '#C68B4A', skin: '#F5DDC0' },
  { id: 'cat', label: 'Kitty', category: 'pet', bg: '#2A1F3D', accent: '#A855F7', hair: '#3F3F46', skin: '#F8DDC4' },
] as const

export const AVATAR_PRESET_PREFIX = 'preset:'

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
