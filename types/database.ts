export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          website_url: string | null;
          twitter_handle: string | null;
          github_username: string | null;
          github_access_token: string | null;
          is_pro: boolean;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website_url?: string | null;
          twitter_handle?: string | null;
          github_username?: string | null;
          github_access_token?: string | null;
          is_pro?: boolean;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website_url?: string | null;
          twitter_handle?: string | null;
          github_username?: string | null;
          github_access_token?: string | null;
          is_pro?: boolean;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          slug: string;
          description: string | null;
          status: "active" | "paused" | "graveyard" | "shipped";
          is_public: boolean;
          github_repo_url: string | null;
          github_repo_id: number | null;
          github_stars: number;
          github_forks: number;
          github_open_issues: number;
          github_language: string | null;
          github_autosync: boolean;
          live_url: string | null;
          screenshot_url: string | null;
          where_i_left_off: string | null;
          lessons_learned: string | null;
          last_activity_at: string;
          github_synced_at: string | null;
          api_key: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          slug: string;
          description?: string | null;
          status?: "active" | "paused" | "graveyard" | "shipped";
          is_public?: boolean;
          github_repo_url?: string | null;
          github_repo_id?: number | null;
          github_stars?: number;
          github_forks?: number;
          github_open_issues?: number;
          github_language?: string | null;
          github_autosync?: boolean;
          live_url?: string | null;
          screenshot_url?: string | null;
          where_i_left_off?: string | null;
          lessons_learned?: string | null;
          last_activity_at?: string;
          github_synced_at?: string | null;
          api_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          status?: "active" | "paused" | "graveyard" | "shipped";
          is_public?: boolean;
          github_repo_url?: string | null;
          github_repo_id?: number | null;
          github_stars?: number;
          github_forks?: number;
          github_open_issues?: number;
          github_language?: string | null;
          github_autosync?: boolean;
          live_url?: string | null;
          screenshot_url?: string | null;
          where_i_left_off?: string | null;
          lessons_learned?: string | null;
          last_activity_at?: string;
          github_synced_at?: string | null;
          api_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      api_activity_log: {
        Row: {
          id: string;
          project_id: string;
          action: string;
          details: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          action: string;
          details?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          action?: string;
          details?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      project_tags: {
        Row: {
          id: string;
          project_id: string;
          tag_type: "model" | "framework" | "tool";
          tag_value: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          tag_type: "model" | "framework" | "tool";
          tag_value: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          tag_type?: "model" | "framework" | "tool";
          tag_value?: string;
        };
      };
      tags_catalog: {
        Row: {
          id: string;
          name: string;
          type: "model" | "framework" | "tool";
          icon_url: string | null;
          color: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          type: "model" | "framework" | "tool";
          icon_url?: string | null;
          color?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          type?: "model" | "framework" | "tool";
          icon_url?: string | null;
          color?: string | null;
        };
      };
      project_likes: {
        Row: {
          user_id: string;
          project_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          project_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          project_id?: string;
          created_at?: string;
        };
      };
      bookmarks: {
        Row: {
          user_id: string;
          project_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          project_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          project_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
export type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];
export type ProjectStatus = Project["status"];

export type ProjectTag = Database["public"]["Tables"]["project_tags"]["Row"];
export type TagCatalog = Database["public"]["Tables"]["tags_catalog"]["Row"];

export type ApiActivityLog = Database["public"]["Tables"]["api_activity_log"]["Row"];
export type ApiActivityLogInsert = Database["public"]["Tables"]["api_activity_log"]["Insert"];
