'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import AppShell from '@/components/layout/AppShell'
import { initClaim, verifyClaim } from '@/lib/claims/actions'
import type { ClaimMethod } from '@/types'

interface MethodMeta {
  id: ClaimMethod
  title: string
  badge?: string
  summary: string
  guide: string[]
}

const METHODS: readonly MethodMeta[] = [
  {
    id: 'github',
    title: 'GitHub OAuth 인증',
    badge: 'Most Preferred',
    summary: 'GitHub 계정으로 로그인하고 저장소 소유권을 즉시 확인합니다.',
    guide: [
      '"Continue with GitHub" 버튼을 눌러 OAuth 로그인을 진행하세요.',
      'ShowVibe는 공개 프로필과 저장소 목록만 읽습니다 (write 권한 없음).',
      '대상 프로젝트와 동일한 도메인을 가진 저장소가 발견되면 자동 인증됩니다.',
    ],
  },
  {
    id: 'meta_tag',
    title: '메타 태그 추가',
    summary: 'HTML <head>에 인증용 메타 태그를 삽입한 뒤 다시 검사합니다.',
    guide: [
      '아래 태그를 사이트의 <head> 섹션에 추가하세요:',
      '<meta name="showvibe-verify" content="sv-XXXX-XXXX-XXXX" />',
      '배포 후 "Verify" 버튼을 누르면 ShowVibe가 페이지를 다시 가져와 확인합니다.',
      '확인 완료 후에는 태그를 제거해도 무방합니다.',
    ],
  },
  {
    id: 'dns',
    title: 'DNS TXT 레코드 추가',
    summary: '도메인 DNS에 TXT 레코드를 추가해 도메인 소유권을 증명합니다.',
    guide: [
      'DNS 관리 콘솔에서 다음 TXT 레코드를 추가하세요:',
      'Host: @  ·  Type: TXT  ·  Value: showvibe-verify=sv-XXXX-XXXX-XXXX',
      'DNS 전파에는 보통 5분~1시간이 소요됩니다.',
      '"Verify DNS" 버튼을 누르면 ShowVibe가 lookup을 수행합니다.',
    ],
  },
  {
    id: 'manual',
    title: 'Manual Review 요청',
    summary: '위 방법이 모두 어렵다면 운영팀이 직접 검토합니다.',
    guide: [
      '프로젝트의 소유권을 증명할 수 있는 자료(스크린샷, 도메인 등록 정보 등)를 제출하세요.',
      '운영팀 검토는 영업일 기준 2-5일이 소요됩니다.',
      '결과는 등록한 이메일로 안내됩니다.',
    ],
  },
] as const

const PERKS = [
  '인증 마크 (Verified Creator) 부여',
  '썸네일/스크린샷 직접 업로드',
  '프로젝트 설명, 태그, 카테고리 수정',
  '댓글 및 메이커 노트 작성',
  '월간 리포트(조회수, 클릭, 저장수) 열람',
] as const

interface InitiatedClaim {
  claimId: string
  token: string
  method: ClaimMethod
}

export default function ClaimPage() {
  const [projectQuery, setProjectQuery] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<ClaimMethod>('github')
  const [error, setError] = useState<string | null>(null)
  const [initiated, setInitiated] = useState<InitiatedClaim | null>(null)
  const [verifyResult, setVerifyResult] = useState<
    | { kind: 'verified' }
    | { kind: 'pending_manual_review' }
    | { kind: 'already_verified' }
    | null
  >(null)
  const [isInitPending, startInitTransition] = useTransition()
  const [isVerifyPending, startVerifyTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (!projectQuery.trim()) {
      setError('프로젝트 URL을 입력해주세요.')
      return
    }
    startInitTransition(async () => {
      const result = await initClaim({
        siteUrl: projectQuery,
        method: selectedMethod,
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setInitiated({
        claimId: result.claimId,
        token: result.token,
        method: result.method,
      })
    })
  }

  const handleVerify = () => {
    if (!initiated) return
    setError(null)
    startVerifyTransition(async () => {
      const result = await verifyClaim({ claimId: initiated.claimId })
      if (!result.ok) {
        setError(result.error)
        return
      }
      if (result.status === 'verified') {
        setVerifyResult({ kind: 'verified' })
      } else if (result.status === 'already_verified') {
        setVerifyResult({ kind: 'already_verified' })
      } else if (result.status === 'pending_manual_review') {
        setVerifyResult({ kind: 'pending_manual_review' })
      }
    })
  }

  const handleReset = () => {
    setProjectQuery('')
    setSelectedMethod('github')
    setInitiated(null)
    setVerifyResult(null)
    setError(null)
  }

  const activeMethod = METHODS.find((m) => m.id === selectedMethod) ?? METHODS[0]

  return (
    <AppShell>
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-12 lg:py-16">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-3 font-[var(--font-outfit)]">
              Claim Your Project
            </h1>
            <p className="text-text-medium">
              자신의 프로젝트를 인증하면 ShowVibe에서 더 많은 권한을 얻을 수 있습니다.
            </p>
          </div>

          <div className="bg-bg-surface border border-stroke rounded-xl p-6 mb-8">
            <p className="text-sm font-medium text-text-high mb-3">
              인증 후 얻는 권한
            </p>
            <ul className="space-y-2">
              {PERKS.map((perk) => (
                <li
                  key={perk}
                  className="flex items-start gap-2 text-sm text-text-medium"
                >
                  <span className="text-coral mt-0.5">✓</span>
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>

          {verifyResult && (
            <div className="bg-bg-surface border border-coral/40 rounded-xl p-6 mb-6">
              <div className="w-12 h-12 mb-3 rounded-full bg-coral/10 flex items-center justify-center text-coral text-xl">
                ✓
              </div>
              <h2 className="text-xl font-bold mb-2 font-[var(--font-outfit)]">
                {verifyResult.kind === 'verified' && '인증 완료!'}
                {verifyResult.kind === 'already_verified' && '이미 인증된 프로젝트입니다'}
                {verifyResult.kind === 'pending_manual_review' &&
                  'Manual Review 요청이 접수되었습니다'}
              </h2>
              <p className="text-sm text-text-medium mb-4">
                {verifyResult.kind === 'verified' &&
                  '제작자 권한이 부여되었습니다. 프로젝트 페이지에서 정보를 수정할 수 있습니다.'}
                {verifyResult.kind === 'already_verified' &&
                  '본 프로젝트는 이미 검증이 완료된 상태입니다.'}
                {verifyResult.kind === 'pending_manual_review' &&
                  '운영팀 검토는 영업일 기준 2-5일이 소요됩니다. 결과는 등록 이메일로 안내됩니다.'}
              </p>
              <div className="flex gap-3">
                <Link
                  href="/account"
                  className="bg-coral hover:bg-coral-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  내 계정으로
                </Link>
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-bg-elevated hover:bg-bg-base border border-stroke text-text-high text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  다른 프로젝트 인증
                </button>
              </div>
            </div>
          )}

          {!verifyResult && initiated && (
            <div className="bg-bg-surface border border-stroke rounded-xl p-6 lg:p-8 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-coral text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h2 className="text-lg font-bold font-[var(--font-outfit)]">
                    검증 토큰 적용
                  </h2>
                </div>
                <p className="text-sm text-text-medium mb-3">
                  아래 토큰을 선택한 인증 방법에 맞게 사이트에 적용한 뒤 Verify 버튼을 누르세요.
                </p>
                <div className="bg-bg-elevated border border-stroke rounded-lg p-4 mb-3">
                  <p className="text-xs text-text-muted mb-1">Verification Token</p>
                  <code className="block text-sm text-coral font-mono break-all">
                    {initiated.token}
                  </code>
                </div>
                {initiated.method === 'meta_tag' && (
                  <div className="text-xs text-text-medium space-y-1">
                    <p>다음 메타 태그를 사이트 <code className="text-coral">&lt;head&gt;</code>에 추가:</p>
                    <code className="block bg-bg-elevated border border-stroke rounded p-3 font-mono break-all">
                      {`<meta name="showvibe-verify" content="${initiated.token}" />`}
                    </code>
                  </div>
                )}
                {initiated.method === 'dns' && (
                  <div className="text-xs text-text-medium space-y-1">
                    <p>DNS TXT 레코드 추가:</p>
                    <code className="block bg-bg-elevated border border-stroke rounded p-3 font-mono break-all">
                      Host: _showvibe  ·  Type: TXT  ·  Value: {initiated.token}
                    </code>
                  </div>
                )}
                {initiated.method === 'manual' && (
                  <p className="text-xs text-text-medium">
                    Manual Review 큐에 등록되었습니다. Verify 버튼을 눌러 운영팀 검토를 시작하세요.
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={isVerifyPending}
                  className="flex-1 bg-coral hover:bg-coral-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  {isVerifyPending ? '검증 중...' : 'Verify'}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-bg-elevated hover:bg-bg-base border border-stroke text-text-high font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {!initiated && !verifyResult && (
          <form
            onSubmit={handleSubmit}
            className="bg-bg-surface border border-stroke rounded-xl p-6 lg:p-8 space-y-8"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-coral text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-lg font-bold font-[var(--font-outfit)]">
                  프로젝트 찾기
                </h2>
              </div>
              <label
                htmlFor="project-query"
                className="block text-sm font-medium text-text-high mb-2"
              >
                Project URL or ID
              </label>
              <input
                id="project-query"
                type="text"
                value={projectQuery}
                onChange={(e) => setProjectQuery(e.target.value)}
                placeholder="https://yourproject.com  또는  site_01"
                className="w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-stroke text-[13px] text-text-high placeholder:text-text-muted focus:outline-none focus:border-coral"
              />
              <p className="text-xs text-text-medium mt-2">
                ShowVibe에 등록된 프로젝트를 검색합니다. 등록되지 않았다면 먼저{' '}
                <a href="/submit" className="text-coral hover:text-coral-hover">
                  Submit
                </a>
                {' '}페이지에서 등록해주세요.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-coral text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-lg font-bold font-[var(--font-outfit)]">
                  인증 방법 선택
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {METHODS.map((m) => {
                  const isActive = selectedMethod === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMethod(m.id)}
                      className={`text-left p-4 rounded-lg border transition-colors ${
                        isActive
                          ? 'border-coral bg-coral/5'
                          : 'border-stroke bg-bg-elevated hover:border-text-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-text-high">
                          {m.title}
                        </span>
                        {m.badge && (
                          <span className="text-[10px] font-medium text-coral bg-coral/10 px-2 py-0.5 rounded">
                            {m.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-medium leading-relaxed">
                        {m.summary}
                      </p>
                    </button>
                  )
                })}
              </div>

              <div className="bg-bg-elevated border border-stroke rounded-lg p-5">
                <p className="text-sm font-medium text-text-high mb-3">
                  {activeMethod.title} 가이드
                </p>
                <ol className="space-y-2 text-sm text-text-medium leading-relaxed">
                  {activeMethod.guide.map((step, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-text-muted">{idx + 1}.</span>
                      <span className="font-mono text-xs sm:text-sm break-all">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isInitPending}
              className="w-full bg-coral hover:bg-coral-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium px-6 py-3.5 rounded-lg transition-colors"
            >
              {isInitPending ? '진행 중...' : 'Start Verification'}
            </button>
          </form>
          )}
        </section>
      </main>
    </AppShell>
  )
}
