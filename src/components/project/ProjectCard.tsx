'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Site, SiteAnalysis, SiteMedia, User } from '@/types'
import { StatusBadge, SourceBadge, ToolBadge } from '@/components/ui/Badge'
import { LikeButton } from '@/components/sites/LikeButton'
import { SaveButton } from '@/components/sites/SaveButton'

interface ProjectCardProps {
  site: Site
  analysis?: SiteAnalysis
  media?: SiteMedia
  maker?: User
  stats?: {
    views: number
    comments: number
    saves: number
  }
  initialLikeCount?: number
  initialIsLiked?: boolean
  initialIsSaved?: boolean
  isAuthenticated?: boolean
}

function GradientPlaceholder({ name }: { name: string }) {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const hue = hash % 360

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, hsl(${hue}, 60%, 20%) 0%, hsl(${(hue + 60) % 360}, 50%, 15%) 100%)`,
      }}
    >
      <span className="text-2xl font-bold text-white/30 font-[family-name:var(--font-outfit)]">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function ProjectCard({
  site,
  analysis,
  media,
  maker,
  stats,
  initialLikeCount = 0,
  initialIsLiked = false,
  initialIsSaved = false,
  isAuthenticated = false,
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isArchived = site.status === 'archived'
  const thumbnailUrl = media?.imageUrl ?? null
  const toolName = analysis?.toolGuess ?? site.sourcePlatform

  return (
    <div
      className="group overflow-hidden rounded-lg border border-stroke bg-bg-surface transition-shadow hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div
        className="relative aspect-video overflow-hidden"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}
      >
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={`${site.name} screenshot`}
            fill
            className={`object-cover transition-all ${
              isArchived ? 'grayscale opacity-50' : ''
            } ${isHovered && !isArchived ? 'brightness-75' : ''}`}
          />
        ) : (
          <div className={isArchived ? 'grayscale opacity-50' : ''}>
            <GradientPlaceholder name={site.name} />
          </div>
        )}

        {/* Hover overlay */}
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center gap-2">
            {isArchived ? (
              <span className="rounded-lg bg-bg-elevated/90 px-3 py-1.5 text-[12px] text-text-muted">
                접속 불가 · Archived
              </span>
            ) : (
              <Link
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-coral px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-coral-hover"
              >
                <span>↗</span>
                Visit
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-3">
        <div className="mb-1.5">
          <h3
            className={`line-clamp-2 text-[14px] font-semibold leading-snug ${
              isArchived ? 'text-text-muted' : 'text-text-high'
            }`}
          >
            {site.name}
          </h3>
          {maker && (
            <span className="mt-0.5 block truncate text-[11px] font-mono text-text-muted">
              by {maker.name}
            </span>
          )}
        </div>

        <p
          className={`mb-2 line-clamp-3 text-[12.5px] leading-snug ${
            isArchived ? 'text-text-muted' : 'text-text-medium'
          }`}
        >
          {analysis?.aiSummary || site.description || ''}
        </p>

        {/* Badges */}
        <div className="mb-1.5 flex flex-wrap gap-1">
          <StatusBadge status={site.status} />
          <SourceBadge sourceType={site.sourceType} />
          {toolName && <ToolBadge tool={toolName} />}
        </div>

        {/* Like + Save + Report (회원만 — 미로그인 시 클릭 → /signin redirect) */}
        {!isArchived && (
          <div className="mb-2 flex items-center gap-2">
            <LikeButton
              siteId={site.id}
              initialIsLiked={initialIsLiked}
              initialCount={initialLikeCount}
              isAuthenticated={isAuthenticated}
              size="sm"
            />
            <SaveButton
              siteId={site.id}
              initialIsSaved={initialIsSaved}
              isAuthenticated={isAuthenticated}
              size="sm"
            />
            <Link
              href={`/takedown?siteId=${site.id}&url=${encodeURIComponent(site.url)}`}
              onClick={(e) => e.stopPropagation()}
              aria-label="이 프로젝트 신고하기"
              title="신고하기"
              className="ml-auto inline-flex items-center gap-1 rounded-md border border-coral-line/40 px-2 py-1 text-[11px] font-medium text-text-muted hover:text-coral hover:border-coral-line transition-colors"
            >
              <span aria-hidden>⚠</span> 신고
            </Link>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="flex items-center gap-3 text-[11px] font-mono text-text-muted">
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {formatCount(stats.views)}
            </span>
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
              </svg>
              {formatCount(stats.comments)}
            </span>
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              </svg>
              {formatCount(stats.saves)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
