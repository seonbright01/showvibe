import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import { ProjectCard } from "@/components/project/ProjectCard";
import { getArchivedSites } from "@/lib/sites/queries";
import { getSessionUser } from "@/lib/auth/guards";
import { getLikeStatesForSites } from "@/lib/social/queries";

export const metadata: Metadata = {
  title: "Archive — ShowVibe",
  description:
    "사라졌지만 기록할 가치가 있는 바이브코딩 프로젝트들. ShowVibe Archive에서 만나보세요.",
};

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const [sessionUser, archived] = await Promise.all([
    getSessionUser(),
    getArchivedSites(60),
  ]);

  const isAuthenticated = Boolean(sessionUser);
  const likeStates = await getLikeStatesForSites(
    archived.map((e) => e.site.id),
    sessionUser?.id ?? null,
  );

  return (
    <AppShell>
      <main className="flex-1">
        <section className="border-b border-stroke">
          <div className="mx-auto max-w-[1200px] px-6 py-10 lg:py-12">
            <p className="text-[12px] font-medium text-coral mb-2 tracking-wide font-[var(--font-outfit)]">
              Archive
            </p>
            <h1 className="text-3xl font-black tracking-tight mb-2 font-[var(--font-outfit)]">
              Archived Gems
            </h1>
            <p className="text-[13px] text-text-muted max-w-2xl">
              사라졌지만 기록할 가치가 있는 프로젝트. ShowVibe는 살아있는
              프로젝트만큼 사라진 프로젝트의 기록도 중요하게 다룹니다.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-6 py-8">
          <div className="rounded-lg border border-stroke bg-bg-surface px-4 py-3 mb-6">
            <p className="text-[11px] text-text-muted leading-relaxed">
              ShowVibe Archive는 원본 사이트 전체를 보존하지 않습니다. 과거 정상
              접속 당시의 저해상도 썸네일 1장과 제한적 메타데이터만 보존하며,
              제작자는 언제든 사이트를 복구하거나 정보 수정을 요청할 수
              있습니다.
            </p>
          </div>

          {archived.length === 0 ? (
            <div className="rounded-xl border border-stroke bg-bg-surface px-6 py-16 text-center">
              <p className="text-base font-medium text-text-high mb-2 font-[var(--font-outfit)]">
                아직 Archive 항목이 없습니다
              </p>
              <p className="text-sm text-text-medium max-w-md mx-auto leading-relaxed">
                health 모니터가 사이트의 응답 불가 상태를 감지하면 자동으로
                Archive로 이동합니다.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {archived.map((enriched) => {
                const lk = likeStates[enriched.site.id] ?? {
                  count: 0,
                  isLiked: false,
                };
                return (
                  <ProjectCard
                    key={enriched.site.id}
                    {...enriched}
                    initialLikeCount={lk.count}
                    initialIsLiked={lk.isLiked}
                    isAuthenticated={isAuthenticated}
                  />
                );
              })}
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
}
