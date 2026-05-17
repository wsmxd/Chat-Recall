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
      character_versions: {
        Row: {
          change_note: string | null
          character_id: string
          created_at: string
          created_by: string | null
          definition: Json
          id: string
          version: number
        }
        Insert: {
          change_note?: string | null
          character_id: string
          created_at?: string
          created_by?: string | null
          definition: Json
          id?: string
          version: number
        }
        Update: {
          change_note?: string | null
          character_id?: string
          created_at?: string
          created_by?: string | null
          definition?: Json
          id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "character_versions_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          avatar_url: string | null
          card_version: number
          cover_url: string | null
          created_at: string
          default_lore_pack_id: string | null
          definition: Json
          id: string
          name: string
          owner_id: string | null
          schema_version: string
          slug: string
          subtitle: string | null
          theme_id: string | null
          updated_at: string
          visibility: Database["public"]["Enums"]["content_visibility"]
        }
        Insert: {
          avatar_url?: string | null
          card_version?: number
          cover_url?: string | null
          created_at?: string
          default_lore_pack_id?: string | null
          definition?: Json
          id?: string
          name: string
          owner_id?: string | null
          schema_version?: string
          slug: string
          subtitle?: string | null
          theme_id?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["content_visibility"]
        }
        Update: {
          avatar_url?: string | null
          card_version?: number
          cover_url?: string | null
          created_at?: string
          default_lore_pack_id?: string | null
          definition?: Json
          id?: string
          name?: string
          owner_id?: string | null
          schema_version?: string
          slug?: string
          subtitle?: string | null
          theme_id?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["content_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "characters_default_lore_pack_id_fkey"
            columns: ["default_lore_pack_id"]
            isOneToOne: false
            referencedRelation: "lore_packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "characters_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "characters_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          active_theme_id: string | null
          character_ids: string[]
          created_at: string
          id: string
          mode: Database["public"]["Enums"]["conversation_mode"]
          owner_id: string
          settings: Json
          title: string | null
          updated_at: string
        }
        Insert: {
          active_theme_id?: string | null
          character_ids?: string[]
          created_at?: string
          id?: string
          mode?: Database["public"]["Enums"]["conversation_mode"]
          owner_id: string
          settings?: Json
          title?: string | null
          updated_at?: string
        }
        Update: {
          active_theme_id?: string | null
          character_ids?: string[]
          created_at?: string
          id?: string
          mode?: Database["public"]["Enums"]["conversation_mode"]
          owner_id?: string
          settings?: Json
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_active_theme_id_fkey"
            columns: ["active_theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_chunks: {
        Row: {
          content: string
          created_at: string
          document_id: string
          embedding: string | null
          embedding_content_hash: string | null
          embedding_dimension: number | null
          embedding_model: string | null
          embedding_provider: string | null
          id: string
          lore_pack_id: string
          metadata: Json
          token_count: number | null
        }
        Insert: {
          content: string
          created_at?: string
          document_id: string
          embedding?: string | null
          embedding_content_hash?: string | null
          embedding_dimension?: number | null
          embedding_model?: string | null
          embedding_provider?: string | null
          id?: string
          lore_pack_id: string
          metadata?: Json
          token_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          document_id?: string
          embedding?: string | null
          embedding_content_hash?: string | null
          embedding_dimension?: number | null
          embedding_model?: string | null
          embedding_provider?: string | null
          id?: string
          lore_pack_id?: string
          metadata?: Json
          token_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_chunks_lore_pack_id_fkey"
            columns: ["lore_pack_id"]
            isOneToOne: false
            referencedRelation: "lore_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content_hash: string | null
          created_at: string
          id: string
          lore_pack_id: string
          metadata: Json
          source_url: string | null
          storage_path: string | null
          title: string
        }
        Insert: {
          content_hash?: string | null
          created_at?: string
          id?: string
          lore_pack_id: string
          metadata?: Json
          source_url?: string | null
          storage_path?: string | null
          title: string
        }
        Update: {
          content_hash?: string | null
          created_at?: string
          id?: string
          lore_pack_id?: string
          metadata?: Json
          source_url?: string | null
          storage_path?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_lore_pack_id_fkey"
            columns: ["lore_pack_id"]
            isOneToOne: false
            referencedRelation: "lore_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      lore_packs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          metadata: Json
          name: string
          owner_id: string | null
          source_type: string | null
          updated_at: string
          visibility: Database["public"]["Enums"]["content_visibility"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          name: string
          owner_id?: string | null
          source_type?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["content_visibility"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          name?: string
          owner_id?: string | null
          source_type?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["content_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "lore_packs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      memories: {
        Row: {
          character_id: string | null
          confidence: number
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          owner_id: string
          pinned: boolean
          source_message_ids: string[]
          type: Database["public"]["Enums"]["memory_type"]
          updated_at: string
        }
        Insert: {
          character_id?: string | null
          confidence?: number
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          owner_id: string
          pinned?: boolean
          source_message_ids?: string[]
          type: Database["public"]["Enums"]["memory_type"]
          updated_at?: string
        }
        Update: {
          character_id?: string | null
          confidence?: number
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          owner_id?: string
          pinned?: boolean
          source_message_ids?: string[]
          type?: Database["public"]["Enums"]["memory_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memories_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memories_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memories_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_citations: {
        Row: {
          document_chunk_id: string
          id: string
          message_id: string
          metadata: Json
          quote: string | null
          score: number | null
        }
        Insert: {
          document_chunk_id: string
          id?: string
          message_id: string
          metadata?: Json
          quote?: string | null
          score?: number | null
        }
        Update: {
          document_chunk_id?: string
          id?: string
          message_id?: string
          metadata?: Json
          quote?: string | null
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "message_citations_document_chunk_id_fkey"
            columns: ["document_chunk_id"]
            isOneToOne: false
            referencedRelation: "document_chunks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_citations_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          character_id: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json
          role: Database["public"]["Enums"]["message_role"]
          token_count: number | null
        }
        Insert: {
          character_id?: string | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json
          role: Database["public"]["Enums"]["message_role"]
          token_count?: number | null
        }
        Update: {
          character_id?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          role?: Database["public"]["Enums"]["message_role"]
          token_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          settings: Json
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          settings?: Json
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      provider_configs: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          model: string
          owner_id: string | null
          provider: string
          settings: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          model: string
          owner_id?: string | null
          provider: string
          settings?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          model?: string
          owner_id?: string | null
          provider?: string
          settings?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_configs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      themes: {
        Row: {
          created_at: string
          definition: Json
          id: string
          name: string
          owner_id: string | null
          slug: string
          updated_at: string
          visibility: Database["public"]["Enums"]["content_visibility"]
        }
        Insert: {
          created_at?: string
          definition?: Json
          id?: string
          name: string
          owner_id?: string | null
          slug: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["content_visibility"]
        }
        Update: {
          created_at?: string
          definition?: Json
          id?: string
          name?: string
          owner_id?: string | null
          slug?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["content_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "themes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_document_chunks: {
        Args: {
          filter_canon_level?: string
          filter_character_names?: string[]
          filter_lore_pack_ids?: string[]
          filter_spoiler_level?: string
          match_count?: number
          query_embedding: string
        }
        Returns: {
          content: string
          document_id: string
          id: string
          lore_pack_id: string
          metadata: Json
          similarity: number
        }[]
      }
    }
    Enums: {
      content_visibility: "private" | "unlisted" | "public" | "official"
      conversation_mode: "single_character" | "group_chat" | "scene" | "qa"
      memory_type:
        | "fact"
        | "relationship"
        | "preference"
        | "timeline"
        | "summary"
      message_role: "user" | "assistant" | "system" | "tool"
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
    Enums: {
      content_visibility: ["private", "unlisted", "public", "official"],
      conversation_mode: ["single_character", "group_chat", "scene", "qa"],
      memory_type: [
        "fact",
        "relationship",
        "preference",
        "timeline",
        "summary",
      ],
      message_role: ["user", "assistant", "system", "tool"],
    },
  },
} as const
