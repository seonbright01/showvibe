const PLATFORM_PREFIXES = [
  /^Show\s+HN[:\s|—–-]+\s*/i,
  /^Ask\s+HN[:\s|—–-]+\s*/i,
  /^Tell\s+HN[:\s|—–-]+\s*/i,
  /^Show\s+\/r\/\w+[:\s|—–-]+\s*/i,
  /^\[Show\s+HN\]\s*/i,
  /^\[OC\]\s*/i,
  /^\[Project\]\s*/i,
  /^\[Showcase\]\s*/i,
]

const TRAILING_SUFFIXES = [
  /\s*\(\d{4}\)\s*$/,
]

export function cleanTitle(rawTitle: string | null | undefined): string {
  if (!rawTitle) return ''
  let title = rawTitle.trim()
  for (const pattern of PLATFORM_PREFIXES) {
    title = title.replace(pattern, '')
  }
  for (const pattern of TRAILING_SUFFIXES) {
    title = title.replace(pattern, '')
  }
  return title.trim()
}
