import type { Metadata } from "next";
import Image from "next/image";
import AppShell from "@/components/layout/AppShell";
import { SourceBadge, ToolBadge } from "@/components/ui/Badge";
import {
  MOCK_SITES,
  MOCK_ANALYSES,
  MOCK_MEDIA,
} from "@/data/mock";
import type { Site } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

function findSite(id: string): Site {
  const found = MOCK_SITES.find((s) => s.id === id);
  if (found) return found;
  const firstArchived = MOCK_SITES.find((s) => s.status === "archived");
  if (firstArchived) return firstArchived;
  return MOCK_SITES[0];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const site = findSite(id);
  return {
    title: `${site.name} (Archived) — ShowVibe`,
    description: `${site.name}은(는) 현재 접속되지 않는 프로젝트입니다. ShowVibe Archive에 보존된 메타데이터.`,
  };
}

function formatKoreanDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatIsoDate(iso: string): string {
  return iso.replace("T", " ").replace(/\.\d+/, "").replace("Z", " UTC");
}

export default async function ArchiveDetailPage({ params }: PageProps) {
  const { id } = await params;
  const site = findSite(id);
  const analysis = MOCK_ANALYSES.find((a) => a.siteId === site.id);
  const media = MOCK_MEDIA.find((m) => m.siteId === site.id);
  const lastActiveLabel = formatKoreanDate(site.lastActiveAt);
  const toolName = analysis?.toolGuess ?? site.sourcePlatform;

  return (
    <AppShell>
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-12 lg:py-16">
          <header className="mb-8">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted mb-3 font-[var(--font-outfit)]">
              Archived
            </p>
            <h1 className="text-3xl font-black tracking-tight mb-3 font-[var(--font-outfit)]">
              {site.name}
            </h1>
            <p className="text-text-medium leading-relaxed mb-4">
              {site.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <SourceBadge sourceType={site.sourceType} />
              {toolName && <ToolBadge tool={toolName} />}
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{
                  color: "#6B7280",
                  backgroundColor: "rgba(107,114,128,0.15)",
                }}
              >
                Archived
              </span>
            </div>
          </header>

          <div className="relative aspect-video rounded-xl overflow-hidden mb-10 border border-stroke bg-bg-elevated">
            {media?.imageUrl ? (
              <Image
                src={media.imageUrl}
                alt={`${site.name} archived screenshot`}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover grayscale opacity-60"
              />
            ) : (
              <div className="absolute inset-0 grayscale opacity-60 flex items-center justify-center bg-gradient-to-br from-bg-elevated to-bg-surface">
                <span className="text-3xl font-bold text-white/20 font-[family-name:var(--font-outfit)]">
                  {site.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center text-xs font-mono uppercase text-text-medium px-2 py-0.5 rounded bg-bg-base/80 border border-stroke">
                Archived Thumbnail · low-res
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-stroke bg-bg-surface p-6 mb-10">
            <p className="text-base font-semibold text-text-high mb-3">
              이 사이트는 현재 접속되지 않습니다.
            </p>
            <ul className="space-y-1.5 text-sm text-text-medium mb-4">
              <li>마지막 정상 확인일: {lastActiveLabel}</li>
              <li>마지막 확인 결과: 404 Not Found</li>
            </ul>
            <p className="text-sm text-text-medium leading-relaxed mb-2">
              showvibe의 아카이브는 원본 사이트 전체를 보존하는 기능이
              아닙니다.
            </p>
            <p className="text-sm text-text-medium leading-relaxed mb-2">
              과거 정상 접속 당시의 저해상도 썸네일 1장과 제한적 메타데이터만
              보존합니다.
            </p>
            <p className="text-sm text-text-medium leading-relaxed">
              제작자라면 사이트를 복구하거나 정보를 수정할 수 있습니다.
            </p>
          </div>

          <div className="rounded-lg border border-stroke bg-bg-base p-6 mb-10 font-mono text-xs text-text-medium leading-relaxed">
            <p className="text-text-muted uppercase tracking-wider mb-3 text-[10px]">
              ─── data provenance ───────────────────
            </p>
            <div className="space-y-1.5">
              <div className="flex justify-between gap-4">
                <span className="text-text-muted">Registration</span>
                <span className="text-text-high">{site.url}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-text-muted">First discovered</span>
                <span className="text-text-high">
                  {formatIsoDate(site.firstDiscoveredAt)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-text-muted">Last checked</span>
                <span className="text-text-high">
                  {formatIsoDate(site.lastCheckedAt)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-text-muted">HTTP Status</span>
                <span className="text-text-high">404 Not Found</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-text-muted">Thumbnail</span>
                <span className="text-text-high">
                  {media ? "preserved (low-res)" : "not available"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-text-muted">Status</span>
                <span className="text-text-high">Archived</span>
              </div>
            </div>
            <p className="text-text-muted uppercase tracking-wider mt-3 text-[10px]">
              ────────────────────────────────────────
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mb-10">
            <button
              type="button"
              className="bg-coral hover:bg-coral-hover text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              Claim This Project
            </button>
            <button
              type="button"
              className="bg-bg-elevated hover:bg-bg-surface border border-stroke text-text-high font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              Request Correction
            </button>
          </div>

          <p className="text-xs text-text-muted leading-relaxed pt-6 border-t border-stroke">
            showvibe는 Cursor, Lovable, Replit, Bolt, v0 등 언급된 특정 AI
            코딩 도구 및 서비스와 공식 제휴 관계가 아닙니다. 각 상표는 해당
            권리자에게 귀속됩니다.
          </p>
        </article>
      </main>
    </AppShell>
  );
}
