'use client'

interface DeletePostButtonProps {
  title: string
}

export function DeletePostButton({ title }: DeletePostButtonProps) {
  return (
    <button
      type="submit"
      className="rounded px-2 py-1 text-[12px] text-coral hover:bg-coral/10"
      onClick={(e) => {
        if (!window.confirm(`"${title}" 포스트를 삭제할까요? 되돌릴 수 없습니다.`)) {
          e.preventDefault()
        }
      }}
    >
      삭제
    </button>
  )
}
