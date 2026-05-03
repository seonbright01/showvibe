/**
 * Vercel 프로젝트 설정 (자동화 예비)
 *
 * 현재 상태: cron schedules 주석 처리 (로컬 개발 우선)
 * 활성화 방법: 사용자가 Vercel 프로젝트를 link한 뒤 아래 crons 배열의 주석을 풀고 deploy
 * 보안: 활성화 전 CRON_SECRET 환경변수 등록 필수
 *
 * @vercel/config가 설치되어 있지 않은 환경에서도 안전하게 import-only로 동작합니다.
 * 실제 배포 시 `npm install -D @vercel/config` 후 아래 import 사용.
 */

// import { type VercelConfig } from '@vercel/config/v1'

export const config = {
  buildCommand: 'npm run build',
  framework: 'nextjs',

  // 자동화 활성화 시 아래 주석 제거 + Vercel Pro 플랜 + CRON_SECRET 환경변수 등록 필요
  // crons: [
  //   { path: '/api/cron/collect',  schedule: '0 4 * * *'   }, // 일 1회 04:00 UTC
  //   { path: '/api/cron/classify', schedule: '*/5 * * * *' }, // 5분마다
  //   { path: '/api/cron/screenshot', schedule: '*/5 * * * *' },
  //   { path: '/api/cron/article',   schedule: '*/5 * * * *' },
  //   { path: '/api/cron/monitor?bucket=active',   schedule: '0 */6 * * *' },
  //   { path: '/api/cron/monitor?bucket=slow',     schedule: '0 */3 * * *' },
  //   { path: '/api/cron/monitor?bucket=degraded', schedule: '0 */1 * * *' },
  //   { path: '/api/cron/recheck', schedule: '0 5 * * *' }, // 일 1회 05:00 UTC, blocked/archived 재검토
  // ],
} as const

export default config
