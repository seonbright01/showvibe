'use client'

import { signInWithGitHub } from '@/lib/auth/actions'

interface GitHubButtonProps {
  label?: string
  next?: string
}

export function GitHubButton({
  label = 'GitHub로 계속하기',
  next,
}: GitHubButtonProps = {}) {
  return (
    <form action={signInWithGitHub}>
      {next && <input type="hidden" name="next" value={next} />}
      <button
        type="submit"
        className="w-full flex items-center justify-center gap-3 bg-bg-elevated hover:bg-bg-base border border-stroke text-text-high text-[13px] font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.97 3.22 9.18 7.69 10.67.56.1.77-.24.77-.54v-1.88c-3.13.68-3.79-1.51-3.79-1.51-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.57 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.43.11-2.99 0 0 .95-.3 3.11 1.16.9-.25 1.86-.38 2.82-.38.96 0 1.92.13 2.82.38 2.16-1.46 3.11-1.16 3.11-1.16.61 1.56.23 2.71.11 2.99.72.79 1.16 1.8 1.16 3.03 0 4.33-2.63 5.29-5.14 5.57.4.34.76 1.02.76 2.06v3.05c0 .3.21.65.78.54 4.46-1.49 7.68-5.7 7.68-10.67C23.25 5.48 18.27.5 12 .5z" />
        </svg>
        <span>{label}</span>
      </button>
    </form>
  )
}
