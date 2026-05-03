import type { CommentStatus, UserRole } from '@/types'

export interface CommentAuthor {
  id: string
  name: string
  avatar_url: string | null
  role: UserRole
}

export interface CommentWithAuthor {
  id: string
  body: string
  like_count: number
  report_count: number
  created_at: string
  updated_at: string
  status: CommentStatus
  user_id: string
  users: CommentAuthor | null
}
