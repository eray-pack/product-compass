import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://iikoxopupfjiavjjvkgm.supabase.co";
const SUPABASE_KEY = "sb_publishable_lG6o7ZK94dOd5Px5iaBL-Q_d0rQGJ_f";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ⚠️ Generated from the live Supabase schema via `generate_typescript_types`
// (Supabase MCP) — do NOT hand-edit; regenerate when the schema changes.
// (To get full query type-safety, swap the client above to
// `createClient<Database>(...)` — deferred, it ripples type-checks across the app.)
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
      addictions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          name: string
          start_date: number
          total_clean_days: number | null
          urges_survived: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          name: string
          start_date: number
          total_clean_days?: number | null
          urges_survived?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          name?: string
          start_date?: number
          total_clean_days?: number | null
          urges_survived?: number | null
          user_id?: string
        }
        Relationships: []
      }
      community_messages: {
        Row: {
          content: string
          created_at: string | null
          display_name: string
          id: string
          rank: string | null
          room: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          display_name?: string
          id?: string
          rank?: string | null
          room?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          display_name?: string
          id?: string
          rank?: string | null
          room?: string
          user_id?: string
        }
        Relationships: []
      }
      device_tokens: {
        Row: {
          id: string
          platform: string
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          platform?: string
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          platform?: string
          token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          referral_code: string | null
          referral_count: number
          referred_by: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name?: string | null
          referral_code?: string | null
          referral_count?: number
          referred_by?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          referral_code?: string | null
          referral_count?: number
          referred_by?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referee_id: string
          referrer_id: string
          rewarded: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          referee_id: string
          referrer_id: string
          rewarded?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          referee_id?: string
          referrer_id?: string
          rewarded?: boolean
        }
        Relationships: []
      }
      relapses: {
        Row: {
          addiction_id: string
          created_at: string | null
          id: string
          note: string | null
          reframe_shown: boolean | null
          ts: number
          user_id: string
        }
        Insert: {
          addiction_id: string
          created_at?: string | null
          id?: string
          note?: string | null
          reframe_shown?: boolean | null
          ts: number
          user_id: string
        }
        Update: {
          addiction_id?: string
          created_at?: string | null
          id?: string
          note?: string | null
          reframe_shown?: boolean | null
          ts?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relapses_addiction_id_fkey"
            columns: ["addiction_id"]
            isOneToOne: false
            referencedRelation: "addictions"
            referencedColumns: ["id"]
          },
        ]
      }
      room_memberships: {
        Row: {
          joined_at: string
          room_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          room_id: string
          user_id: string
        }
        Update: {
          joined_at?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_memberships_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string
          description: string
          id: string
          is_private: boolean
          member_count: number
          name: string
          owner_id: string | null
          password_hash: string | null
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          is_private?: boolean
          member_count?: number
          name: string
          owner_id?: string | null
          password_hash?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_private?: boolean
          member_count?: number
          name?: string
          owner_id?: string | null
          password_hash?: string | null
        }
        Relationships: []
      }
      user_state: {
        Row: {
          badges: string[] | null
          is_premium: boolean | null
          last_login_at: number | null
          onboarding: Json | null
          points: number | null
          total_returns: number | null
          tree_xp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          badges?: string[] | null
          is_premium?: boolean | null
          last_login_at?: number | null
          onboarding?: Json | null
          points?: number | null
          total_returns?: number | null
          tree_xp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          badges?: string[] | null
          is_premium?: boolean | null
          last_login_at?: number | null
          onboarding?: Json | null
          points?: number | null
          total_returns?: number | null
          tree_xp?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_room: {
        Args: {
          p_description: string
          p_is_private: boolean
          p_name: string
          p_password?: string
        }
        Returns: string
      }
      get_member_count: { Args: never; Returns: number }
      join_room: {
        Args: { p_password?: string; p_room_id: string }
        Returns: boolean
      }
      resolve_referral_code: { Args: { p_code: string }; Returns: string }
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
