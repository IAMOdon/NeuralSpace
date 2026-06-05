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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      article_authors: {
        Row: {
          article_id: string
          author_id: string
          order: number
        }
        Insert: {
          article_id: string
          author_id: string
          order?: number
        }
        Update: {
          article_id?: string
          author_id?: string
          order?: number
        }
        Relationships: [
          {
            foreignKeyName: "article_authors_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_authors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      article_series: {
        Row: {
          article_id: string
          order: number
          series_id: string
        }
        Insert: {
          article_id: string
          order: number
          series_id: string
        }
        Update: {
          article_id?: string
          order?: number
          series_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_series_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: true
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_series_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      article_views: {
        Row: {
          article_id: string
          country_code: string | null
          created_at: string | null
          day_of_week: number | null
          device: string | null
          hour_of_day: number | null
          id: string
          referrer_source: string | null
          session_id: string | null
        }
        Insert: {
          article_id: string
          country_code?: string | null
          created_at?: string | null
          day_of_week?: number | null
          device?: string | null
          hour_of_day?: number | null
          id?: string
          referrer_source?: string | null
          session_id?: string | null
        }
        Update: {
          article_id?: string
          country_code?: string | null
          created_at?: string | null
          day_of_week?: number | null
          device?: string | null
          hour_of_day?: number | null
          id?: string
          referrer_source?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_views_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          category_id: string | null
          content: Json
          is_sponsored: boolean
          cover_image_alt: string | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          embedding: string | null
          id: string
          last_updated_note: string | null
          layout_preset: string | null
          og_image_url: string | null
          published_at: string | null
          reading_time_min: number
          scheduled_at: string | null
          search_vector: unknown
          seo_description: string | null
          seo_title: string | null
          slug: string
          sources: Json
          status: string
          summary: string
          title: string
          type: string
          updated_at: string | null
          view_count: number
          word_count: number
        }
        Insert: {
          category_id?: string | null
          content?: Json
          cover_image_alt?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          embedding?: string | null
          id?: string
          is_sponsored?: boolean
          last_updated_note?: string | null
          layout_preset?: string | null
          og_image_url?: string | null
          published_at?: string | null
          reading_time_min?: number
          scheduled_at?: string | null
          search_vector?: unknown
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sources?: Json
          status?: string
          summary: string
          title: string
          type: string
          updated_at?: string | null
          view_count?: number
          word_count?: number
        }
        Update: {
          category_id?: string | null
          content?: Json
          cover_image_alt?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          embedding?: string | null
          id?: string
          is_sponsored?: boolean
          last_updated_note?: string | null
          layout_preset?: string | null
          og_image_url?: string | null
          published_at?: string | null
          reading_time_min?: number
          scheduled_at?: string | null
          search_vector?: unknown
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sources?: Json
          status?: string
          summary?: string
          title?: string
          type?: string
          updated_at?: string | null
          view_count?: number
          word_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      authors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          id: string
          institution: string | null
          links: Json | null
          name: string
          role: string | null
          slug: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          institution?: string | null
          links?: Json | null
          name: string
          role?: string | null
          slug: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          institution?: string | null
          links?: Json | null
          name?: string
          role?: string | null
          slug?: string
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          color_hex: string | null
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color_hex?: string | null
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color_hex?: string | null
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      content_analytics: {
        Row: {
          article_id: string
          avg_completion_rate: number | null
          avg_duration_sec: number | null
          expert_reader_pct: number | null
          id: string
          mobile_pct: number | null
          quality_reads: number | null
          top_country: string | null
          top_referrer: string | null
          total_views: number | null
          unique_sessions: number | null
          week_start: string
        }
        Insert: {
          article_id: string
          avg_completion_rate?: number | null
          avg_duration_sec?: number | null
          expert_reader_pct?: number | null
          id?: string
          mobile_pct?: number | null
          quality_reads?: number | null
          top_country?: string | null
          top_referrer?: string | null
          total_views?: number | null
          unique_sessions?: number | null
          week_start: string
        }
        Update: {
          article_id?: string
          avg_completion_rate?: number | null
          avg_duration_sec?: number | null
          expert_reader_pct?: number | null
          id?: string
          mobile_pct?: number | null
          quality_reads?: number | null
          top_country?: string | null
          top_referrer?: string | null
          total_views?: number | null
          unique_sessions?: number | null
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_analytics_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_config: {
        Row: {
          config: Json
          id: string
          type: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          config?: Json
          id?: string
          type?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          config?: Json
          id?: string
          type?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      series: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          slug: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          slug: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      session_interests: {
        Row: {
          entity_id: string
          entity_type: string
          score: number
          session_id: string
          updated_at: string | null
        }
        Insert: {
          entity_id: string
          entity_type: string
          score?: number
          session_id: string
          updated_at?: string | null
        }
        Update: {
          entity_id?: string
          entity_type?: string
          score?: number
          session_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      session_profiles: {
        Row: {
          articles_read: number | null
          country_code: string | null
          device: string | null
          expertise_signal: number | null
          first_seen: string | null
          last_seen: string | null
          preferred_format: string | null
          quality_reads: number | null
          session_id: string
          source_clicks_total: number | null
          top_category_id: string | null
          total_duration_sec: number | null
          word_lookups_total: number | null
        }
        Insert: {
          articles_read?: number | null
          country_code?: string | null
          device?: string | null
          expertise_signal?: number | null
          first_seen?: string | null
          last_seen?: string | null
          preferred_format?: string | null
          quality_reads?: number | null
          session_id: string
          source_clicks_total?: number | null
          top_category_id?: string | null
          total_duration_sec?: number | null
          word_lookups_total?: number | null
        }
        Update: {
          articles_read?: number | null
          country_code?: string | null
          device?: string | null
          expertise_signal?: number | null
          first_seen?: string | null
          last_seen?: string | null
          preferred_format?: string | null
          quality_reads?: number | null
          session_id?: string
          source_clicks_total?: number | null
          top_category_id?: string | null
          total_duration_sec?: number | null
          word_lookups_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "session_profiles_top_category_id_fkey"
            columns: ["top_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      watch_events: {
        Row: {
          article_id: string
          country_code: string | null
          created_at: string | null
          day_of_week: number | null
          device: string | null
          duration_sec: number
          hour_of_day: number | null
          id: string
          read_completed: boolean | null
          referrer_source: string | null
          scroll_depth: number
          session_id: string
          source_clicks: number | null
          utm_params: Json | null
          word_lookups: number | null
        }
        Insert: {
          article_id: string
          country_code?: string | null
          created_at?: string | null
          day_of_week?: number | null
          device?: string | null
          duration_sec: number
          hour_of_day?: number | null
          id?: string
          read_completed?: boolean | null
          referrer_source?: string | null
          scroll_depth: number
          session_id: string
          source_clicks?: number | null
          utm_params?: Json | null
          word_lookups?: number | null
        }
        Update: {
          article_id?: string
          country_code?: string | null
          created_at?: string | null
          day_of_week?: number | null
          device?: string | null
          duration_sec?: number
          hour_of_day?: number | null
          id?: string
          read_completed?: boolean | null
          referrer_source?: string | null
          scroll_depth?: number
          session_id?: string
          source_clicks?: number | null
          utm_params?: Json | null
          word_lookups?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "watch_events_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_category_interest: {
        Args: { p_category_id: string; p_score: number; p_session_id: string }
        Returns: undefined
      }
      increment_view_count: {
        Args: { p_article_id: string }
        Returns: undefined
      }
      refresh_top_category: {
        Args: { p_session_id: string }
        Returns: undefined
      }
      search_articles: {
        Args: { max_results?: number; query: string }
        Returns: {
          id: string
          published_at: string
          rank: number
          slug: string
          status: string
          summary: string
          title: string
          view_count: number
        }[]
      }
      upsert_session_profile: {
        Args: {
          p_country_code: string
          p_device: string
          p_duration_sec: number
          p_format: string
          p_read_completed: boolean
          p_session_id: string
          p_source_clicks: number
          p_word_lookups: number
        }
        Returns: undefined
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
