export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      claims: {
        Row: {
          claim_method: string
          created_at: string
          id: string
          rejected_reason: string | null
          site_id: string
          status: string
          user_id: string
          verification_token: string | null
          verified_at: string | null
        }
        Insert: {
          claim_method: string
          created_at?: string
          id?: string
          rejected_reason?: string | null
          site_id: string
          status?: string
          user_id: string
          verification_token?: string | null
          verified_at?: string | null
        }
        Update: {
          claim_method?: string
          created_at?: string
          id?: string
          rejected_reason?: string | null
          site_id?: string
          status?: string
          user_id?: string
          verification_token?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claims_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_reports: {
        Row: {
          comment_id: string
          created_at: string
          detail: string | null
          id: string
          reason: string
          reporter_user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          detail?: string | null
          id?: string
          reason: string
          reporter_user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          detail?: string | null
          id?: string
          reason?: string
          reporter_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_reports_reporter_user_id_fkey"
            columns: ["reporter_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          body: string
          created_at: string
          id: string
          like_count: number
          post_id: string | null
          report_count: number
          site_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          like_count?: number
          post_id?: string | null
          report_count?: number
          site_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          like_count?: number
          post_id?: string | null
          report_count?: number
          site_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      link_policies: {
        Row: {
          id: string
          reason: string | null
          rel_policy: string
          site_id: string
          updated_at: string
        }
        Insert: {
          id?: string
          reason?: string | null
          rel_policy?: string
          site_id: string
          updated_at?: string
        }
        Update: {
          id?: string
          reason?: string | null
          rel_policy?: string
          site_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "link_policies_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_user_id: string
          body_md: string
          category: string | null
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          read_time_minutes: number | null
          related_site_ids: string[]
          slug: string
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_user_id: string
          body_md: string
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          read_time_minutes?: number | null
          related_site_ids?: string[]
          slug: string
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_user_id?: string
          body_md?: string
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          read_time_minutes?: number | null
          related_site_ids?: string[]
          slug?: string
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      site_analysis: {
        Row: {
          ai_summary: string | null
          article_summary: string | null
          category: string | null
          created_at: string
          id: string
          main_features: Json
          quality_score: number | null
          risk_score: number | null
          site_id: string
          tool_guess: string | null
          ui_pattern: string | null
          updated_at: string
          vibe_score: number | null
        }
        Insert: {
          ai_summary?: string | null
          article_summary?: string | null
          category?: string | null
          created_at?: string
          id?: string
          main_features?: Json
          quality_score?: number | null
          risk_score?: number | null
          site_id: string
          tool_guess?: string | null
          ui_pattern?: string | null
          updated_at?: string
          vibe_score?: number | null
        }
        Update: {
          ai_summary?: string | null
          article_summary?: string | null
          category?: string | null
          created_at?: string
          id?: string
          main_features?: Json
          quality_score?: number | null
          risk_score?: number | null
          site_id?: string
          tool_guess?: string | null
          ui_pattern?: string | null
          updated_at?: string
          vibe_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "site_analysis_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json
          site_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          site_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          site_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_events_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      site_likes: {
        Row: {
          created_at: string
          site_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          site_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          site_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_likes_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      site_media: {
        Row: {
          captured_at: string
          id: string
          image_resolution: string
          image_url: string
          is_primary: boolean
          media_source: string
          media_type: string
          site_id: string
        }
        Insert: {
          captured_at?: string
          id?: string
          image_resolution?: string
          image_url: string
          is_primary?: boolean
          media_source: string
          media_type: string
          site_id: string
        }
        Update: {
          captured_at?: string
          id?: string
          image_resolution?: string
          image_url?: string
          is_primary?: boolean
          media_source?: string
          media_type?: string
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_media_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_saves: {
        Row: {
          created_at: string
          note: string | null
          site_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          note?: string | null
          site_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          note?: string | null
          site_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_saves_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      site_status_checks: {
        Row: {
          checked_at: string
          error_message: string | null
          final_url: string | null
          http_status: number | null
          id: string
          method: string
          response_time_ms: number | null
          result_status: string
          screenshot_changed: boolean | null
          site_id: string
        }
        Insert: {
          checked_at?: string
          error_message?: string | null
          final_url?: string | null
          http_status?: number | null
          id?: string
          method: string
          response_time_ms?: number | null
          result_status: string
          screenshot_changed?: boolean | null
          site_id: string
        }
        Update: {
          checked_at?: string
          error_message?: string | null
          final_url?: string | null
          http_status?: number | null
          id?: string
          method?: string
          response_time_ms?: number | null
          result_status?: string
          screenshot_changed?: boolean | null
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_status_checks_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          block_reason: string | null
          claimed_by_user_id: string | null
          created_at: string
          description: string | null
          editors_note: string | null
          editors_pick_updated_at: string | null
          editors_pick_updated_by: string | null
          first_discovered_at: string
          id: string
          is_claimed: boolean
          is_editors_pick: boolean
          last_active_at: string
          last_checked_at: string
          name: string
          normalized_url: string
          recheck_count: number
          recheck_eligible_at: string | null
          screenshot_attempts: number
          source_platform: string | null
          source_type: string
          status: string
          updated_at: string
          url: string
          visibility: string
        }
        Insert: {
          block_reason?: string | null
          claimed_by_user_id?: string | null
          created_at?: string
          description?: string | null
          editors_note?: string | null
          editors_pick_updated_at?: string | null
          editors_pick_updated_by?: string | null
          first_discovered_at?: string
          id?: string
          is_claimed?: boolean
          is_editors_pick?: boolean
          last_active_at?: string
          last_checked_at?: string
          name: string
          normalized_url: string
          recheck_count?: number
          recheck_eligible_at?: string | null
          screenshot_attempts?: number
          source_platform?: string | null
          source_type: string
          status?: string
          updated_at?: string
          url: string
          visibility?: string
        }
        Update: {
          block_reason?: string | null
          claimed_by_user_id?: string | null
          created_at?: string
          description?: string | null
          editors_note?: string | null
          editors_pick_updated_at?: string | null
          editors_pick_updated_by?: string | null
          first_discovered_at?: string
          id?: string
          is_claimed?: boolean
          is_editors_pick?: boolean
          last_active_at?: string
          last_checked_at?: string
          name?: string
          normalized_url?: string
          recheck_count?: number
          recheck_eligible_at?: string | null
          screenshot_attempts?: number
          source_platform?: string | null
          source_type?: string
          status?: string
          updated_at?: string
          url?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "sites_claimed_by_user_id_fkey"
            columns: ["claimed_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sites_editors_pick_updated_by_fkey"
            columns: ["editors_pick_updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          body_md: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          maker_user_id: string
          published_at: string | null
          reply_count: number
          slug: string
          tags: string[]
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          body_md: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          maker_user_id: string
          published_at?: string | null
          reply_count?: number
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          body_md?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          maker_user_id?: string
          published_at?: string | null
          reply_count?: number
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "stories_maker_user_id_fkey"
            columns: ["maker_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      takedown_requests: {
        Row: {
          admin_note: string | null
          created_at: string
          id: string
          reason: string
          request_type: string
          requester_email: string
          requester_name: string | null
          resolved_at: string | null
          site_id: string | null
          status: string
          target_url: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          id?: string
          reason: string
          request_type: string
          requester_email: string
          requester_name?: string | null
          resolved_at?: string | null
          site_id?: string | null
          status?: string
          target_url: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          id?: string
          reason?: string
          request_type?: string
          requester_email?: string
          requester_name?: string | null
          resolved_at?: string | null
          site_id?: string | null
          status?: string
          target_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "takedown_requests_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          banned_at: string | null
          banned_reason: string | null
          bio: string | null
          created_at: string
          email: string
          id: string
          is_banned: boolean
          name: string
          role: string
        }
        Insert: {
          avatar_url?: string | null
          banned_at?: string | null
          banned_reason?: string | null
          bio?: string | null
          created_at?: string
          email: string
          id: string
          is_banned?: boolean
          name: string
          role?: string
        }
        Update: {
          avatar_url?: string | null
          banned_at?: string | null
          banned_reason?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          id?: string
          is_banned?: boolean
          name?: string
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      compute_trend_score: {
        Args: { p_site_id: string; p_window?: string }
        Returns: number
      }
      get_top_chart: {
        Args: { p_category?: string; p_limit?: number; p_window?: string }
        Returns: {
          change: number
          rank: number
          score: number
          site_id: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      normalize_url: { Args: { raw: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
