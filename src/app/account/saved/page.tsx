import { redirect } from 'next/navigation'

// /account/saved 는 /library 로 통합됨 (북마크/외부 링크 호환용 redirect만 유지)
export default function SavedRedirect(): never {
  redirect('/library')
}
