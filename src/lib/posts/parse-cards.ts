export interface PostCard {
  /** 카드 번호 (1부터) */
  index: number
  /** 카드 제목 (선택) */
  title: string | null
  /** 카드 본문 markdown */
  content: string
}

/**
 * markdown 본문에서 카드뉴스 구획을 파싱한다.
 *
 * 형식:
 *   ---카드 1: 제목---
 *   본문...
 *
 *   ---카드 2: 제목---
 *   본문...
 *
 * 첫 카드 헤더 이전 텍스트는 무시. 카드가 1개도 없으면 빈 배열 반환.
 */
const CARD_HEADER_RE =
  /^[\s]*-{3,}\s*카드\s*(\d+)\s*(?::\s*([^-\n]+?))?\s*-{3,}\s*$/gm

export function parsePostCards(bodyMd: string): PostCard[] {
  const cards: PostCard[] = []
  const headers: Array<{
    matchIndex: number
    matchLength: number
    cardIndex: number
    title: string | null
  }> = []

  CARD_HEADER_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = CARD_HEADER_RE.exec(bodyMd)) !== null) {
    headers.push({
      matchIndex: m.index,
      matchLength: m[0].length,
      cardIndex: Number(m[1]),
      title: (m[2] ?? '').trim() || null,
    })
  }

  if (headers.length === 0) return []

  for (let i = 0; i < headers.length; i++) {
    const h = headers[i]
    const start = h.matchIndex + h.matchLength
    const end =
      i + 1 < headers.length ? headers[i + 1].matchIndex : bodyMd.length
    const content = bodyMd.slice(start, end).trim()
    cards.push({
      index: h.cardIndex,
      title: h.title,
      content,
    })
  }

  return cards
}

/** 본문이 카드 형식인지 빠르게 확인 */
export function hasCardFormat(bodyMd: string): boolean {
  CARD_HEADER_RE.lastIndex = 0
  return CARD_HEADER_RE.test(bodyMd)
}
