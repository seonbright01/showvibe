const BLOCKED_HOST_PATTERNS: Array<{ test: (host: string, path: string) => boolean; reason: string }> = [
  {
    test: (host) => host === 'github.com',
    reason: 'github.com profile/repo (not a deployed app)',
  },
  {
    test: (host) => host === 'gist.github.com',
    reason: 'github gist',
  },
  {
    test: (host) => host === 'gitlab.com',
    reason: 'gitlab.com profile/repo',
  },
  {
    test: (host) => host === 'bitbucket.org',
    reason: 'bitbucket.org profile/repo',
  },
  {
    test: (host) => host === 'codeberg.org',
    reason: 'codeberg.org profile/repo',
  },
  {
    test: (host, path) => host === 'npmjs.com' || (host === 'www.npmjs.com' && path.startsWith('/package/')),
    reason: 'npm package page',
  },
  {
    test: (host) => host === 'pypi.org',
    reason: 'PyPI package page',
  },
  {
    test: (host) => host === 'crates.io',
    reason: 'crates.io package page',
  },
  {
    test: (host) => host === 'rubygems.org',
    reason: 'RubyGems package page',
  },
  {
    test: (host) => host === 'pkg.go.dev',
    reason: 'Go package page',
  },
  {
    test: (host) => host === 'kaggle.com' || host === 'www.kaggle.com',
    reason: 'Kaggle (notebook hosting, not a deployed app)',
  },
  {
    test: (host, path) => host === 'huggingface.co' && !path.startsWith('/spaces/'),
    reason: 'Hugging Face model/dataset page (not a Space)',
  },
  {
    test: (host) => host === 'medium.com' || host.endsWith('.medium.com'),
    reason: 'Medium article (not a deployed app)',
  },
  {
    test: (host) => host === 'dev.to',
    reason: 'dev.to article',
  },
  {
    test: (host) => host === 'reddit.com' || host === 'old.reddit.com' || host === 'www.reddit.com',
    reason: 'Reddit thread',
  },
  {
    test: (host) => host === 'twitter.com' || host === 'x.com',
    reason: 'Twitter/X post',
  },
  {
    test: (host) => host === 'youtube.com' || host === 'www.youtube.com' || host === 'youtu.be',
    reason: 'YouTube video',
  },
  {
    test: (host) => host === 'producthunt.com' || host === 'www.producthunt.com',
    reason: 'Product Hunt listing (link to actual product instead)',
  },
  {
    test: (host) => host === 'news.ycombinator.com',
    reason: 'Hacker News thread',
  },
]

export interface BlocklistResult {
  blocked: boolean
  reason?: string
}

export function checkBlocklist(rawUrl: string): BlocklistResult {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    return { blocked: false }
  }
  const host = parsed.host.toLowerCase()
  const path = parsed.pathname || '/'

  for (const entry of BLOCKED_HOST_PATTERNS) {
    if (entry.test(host, path)) {
      return { blocked: true, reason: entry.reason }
    }
  }
  return { blocked: false }
}
