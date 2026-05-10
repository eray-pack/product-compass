import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://iikoxopupfjiavjjvkgm.supabase.co";
const SUPABASE_KEY = "sb_publishable_lG6o7ZK94dOd5Px5iaBL-Q_d0rQGJ_f";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          created_at: string;
        };
      };
      addictions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          emoji: string;
          start_date: number;
          total_clean_days: number;
          urges_survived: number;
          created_at: string;
        };
      };
      relapses: {
        Row: {
          id: string;
          user_id: string;
          addiction_id: string;
          ts: number;
          note: string | null;
          reframe_shown: boolean;
          created_at: string;
        };
      };
      user_state: {
        Row: {
          user_id: string;
          points: number;
          tree_xp: number;
          badges: string[];
          total_returns: number;
          last_login_at: number;
          onboarding: Record<string, unknown> | null;
          updated_at: string;
        };
      };
      community_messages: {
        Row: {
          id: string;
          user_id: string;
          room: string;
          content: string;
          created_at: string;
        };
      };
    };
  };
};
