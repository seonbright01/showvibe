/**
 * ShowVibe — Seed DB from src/data/mock.ts
 *
 * Usage:
 *   npx tsx scripts/seed-from-mock.ts
 *
 * Requires (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...
 *
 * Behavior:
 *   - Creates auth.users via admin API (idempotent — skip if exists)
 *   - Maps mock string ids ('user_01', 'site_01') to deterministic UUIDs
 *   - Inserts public.users / sites / site_analysis / site_media
 *   - Idempotent: re-runs are safe.
 *
 * WARNING: Service Role Key bypasses RLS. NEVER run this against production.
 */

import { config as loadEnv } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import {
  MOCK_USERS,
  MOCK_SITES,
  MOCK_ANALYSES,
  MOCK_MEDIA,
} from '../src/data/mock'

loadEnv({ path: '.env.local' })
loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set in .env.local')
}

if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in .env.local')
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// =============================================================================
// Mock id ('user_01', 'site_01') -> deterministic UUID
// Format: 00000000-0000-0000-NNNN-MMMMMMMMMMMM
// =============================================================================
function mockIdToUuid(prefix: 'user' | 'site', mockId: string): string {
  const num = mockId.split('_').pop() ?? '0'
  const padded = num.padStart(12, '0')
  const namespace = prefix === 'user' ? '0001' : '0000'
  return `00000000-0000-0000-${namespace}-${padded}`
}

function normalizeUrl(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^https?:\/\/(www\.)?/, 'https://')
    .replace(/\/$/, '')
}

const DEV_PASSWORD = 'showvibe-dev-password-do-not-use-in-prod'

interface AuthErrorLike {
  message: string
  status?: number
}

function isAlreadyExistsError(error: AuthErrorLike | null): boolean {
  if (!error) return false
  const msg = (error.message || '').toLowerCase()
  return msg.includes('already') || msg.includes('exists') || error.status === 422
}

async function ensureAuthUser(id: string, email: string, name: string): Promise<void> {
  const { error } = await supabase.auth.admin.createUser({
    id,
    email,
    password: DEV_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: name },
  })

  if (error && !isAlreadyExistsError(error as AuthErrorLike)) {
    throw new Error(`Failed to create auth user ${email}: ${error.message}`)
  }
}

async function seedUsers(): Promise<void> {
  console.log(`Seeding ${MOCK_USERS.length} users...`)

  for (const user of MOCK_USERS) {
    const uuid = mockIdToUuid('user', user.id)
    await ensureAuthUser(uuid, user.email, user.name)

    const { error } = await supabase
      .from('users')
      .upsert(
        {
          id: uuid,
          name: user.name,
          email: user.email,
          avatar_url: user.avatarUrl,
          role: user.role,
        },
        { onConflict: 'id' },
      )

    if (error) {
      throw new Error(`Failed to upsert public.users ${user.email}: ${error.message}`)
    }
  }

  console.log(`  -> users done`)
}

async function seedSites(): Promise<void> {
  console.log(`Seeding ${MOCK_SITES.length} sites...`)

  const rows = MOCK_SITES.map((site) => ({
    id: mockIdToUuid('site', site.id),
    name: site.name,
    url: site.url,
    normalized_url: normalizeUrl(site.url),
    description: site.description,
    source_type: site.sourceType,
    source_platform: site.sourcePlatform,
    status: site.status,
    visibility: site.visibility,
    is_claimed: site.isClaimed,
    claimed_by_user_id: site.claimedByUserId
      ? mockIdToUuid('user', site.claimedByUserId)
      : null,
    first_discovered_at: site.firstDiscoveredAt,
    last_checked_at: site.lastCheckedAt,
    last_active_at: site.lastActiveAt,
  }))

  const { error } = await supabase.from('sites').upsert(rows, {
    onConflict: 'normalized_url',
  })

  if (error) {
    throw new Error(`Failed to upsert sites: ${error.message}`)
  }

  console.log(`  -> sites done`)
}

async function seedAnalyses(): Promise<void> {
  console.log(`Seeding ${MOCK_ANALYSES.length} site_analysis rows...`)

  const rows = MOCK_ANALYSES.map((a) => ({
    site_id: mockIdToUuid('site', a.siteId),
    ai_summary: a.aiSummary,
    article_summary: a.articleSummary,
    main_features: a.mainFeatures,
    category: a.category,
    tool_guess: a.toolGuess,
    vibe_score: a.vibeScore,
    quality_score: a.qualityScore,
    risk_score: a.riskScore,
    ui_pattern: a.uiPattern,
  }))

  const { error } = await supabase.from('site_analysis').upsert(rows, {
    onConflict: 'site_id',
  })

  if (error) {
    throw new Error(`Failed to upsert site_analysis: ${error.message}`)
  }

  console.log(`  -> site_analysis done`)
}

async function seedMedia(): Promise<void> {
  console.log(`Seeding ${MOCK_MEDIA.length} site_media rows...`)

  const siteUuids = Array.from(
    new Set(MOCK_MEDIA.map((m) => mockIdToUuid('site', m.siteId))),
  )

  // Clear primary media for these sites first to keep idempotency simple
  const { error: deleteError } = await supabase
    .from('site_media')
    .delete()
    .in('site_id', siteUuids)
    .eq('is_primary', true)

  if (deleteError) {
    throw new Error(`Failed to clear existing primary media: ${deleteError.message}`)
  }

  const rows = MOCK_MEDIA.map((m) => ({
    site_id: mockIdToUuid('site', m.siteId),
    media_type: m.mediaType,
    media_source: m.mediaSource,
    image_url: m.imageUrl,
    image_resolution: m.imageResolution,
    is_primary: m.isPrimary,
    captured_at: m.capturedAt,
  }))

  const { error } = await supabase.from('site_media').insert(rows)

  if (error) {
    throw new Error(`Failed to insert site_media: ${error.message}`)
  }

  console.log(`  -> site_media done`)
}

async function main(): Promise<void> {
  const startedAt = Date.now()
  console.log('ShowVibe seed-from-mock starting...')
  console.log(`  Target: ${SUPABASE_URL}`)

  await seedUsers()
  await seedSites()
  await seedAnalyses()
  await seedMedia()

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1)
  console.log(`Done in ${elapsed}s.`)
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err)
  console.error(`Seed failed: ${message}`)
  process.exit(1)
})
