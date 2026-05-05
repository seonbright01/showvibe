'use client'

import {
  archiveSiteFormAction,
  unarchiveSiteFormAction,
} from '@/lib/admin/actions'

interface ArchiveToggleButtonProps {
  siteId: string
  siteName: string
  isArchived: boolean
}

export function ArchiveToggleButton({
  siteId,
  siteName,
  isArchived,
}: ArchiveToggleButtonProps) {
  if (isArchived) {
    return (
      <form
        action={unarchiveSiteFormAction}
        className="inline-block"
        onSubmit={(e) => {
          if (
            !window.confirm(
              `"${siteName}"을 archived 상태에서 active로 복구할까요?\n(monitor가 다시 health-check 사이클에 포함시킵니다)`,
            )
          ) {
            e.preventDefault()
          }
        }}
      >
        <input type="hidden" name="siteId" value={siteId} />
        <button
          type="submit"
          className="rounded px-2.5 py-1 text-[12px] text-active hover:bg-active/10 transition-colors"
        >
          ↩ active로 복구
        </button>
      </form>
    )
  }

  return (
    <form
      action={archiveSiteFormAction}
      className="inline-block"
      onSubmit={(e) => {
        if (
          !window.confirm(
            `"${siteName}"을 수동으로 archived로 옮길까요?\n(공개 목록에서 회색 카드로만 보이고 90일간 자동 재검사 제외)`,
          )
        ) {
          e.preventDefault()
        }
      }}
    >
      <input type="hidden" name="siteId" value={siteId} />
      <button
        type="submit"
        className="rounded px-2.5 py-1 text-[12px] text-text-medium hover:text-coral hover:bg-coral/10 transition-colors"
      >
        Archive
      </button>
    </form>
  )
}
