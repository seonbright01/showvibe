import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon, icon, apple-icon (PWA / browser icons)
     * - logo/* (public 로고 디렉토리)
     * - ads.txt, robots.txt, sitemap.xml (정적 메타 파일)
     * - 기타 정적 SVG (file.svg, globe.svg, next.svg, vercel.svg, window.svg)
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|logo|ads.txt|robots.txt|sitemap.xml|file.svg|globe.svg|next.svg|vercel.svg|window.svg).*)',
  ],
}
