// Database types - モバイル版と統合
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          agi: number | null
          avatar_char: string | null
          cha: number | null
          company_name: string | null
          created_at: string | null
          department: string | null
          email: string | null
          end: number | null
          energy: number | null
          id: string
          int: number | null
          level: number | null
          name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          scaffai_role: string | null
          str: number | null
          team_contribution_score: number | null
          title: string | null
          total_tasks_completed: number | null
          updated_at: string | null
          xp: number | null
          // 課金関連フィールド
          subscription_plan: 'free' | 'plus' | 'pro' | 'max' | null
          subscription_status: 'active' | 'inactive' | 'canceled' | 'expired' | null
          subscription_end_date: string | null
          platform_access: 'mobile_only' | 'web_only' | 'both' | null
        }
        Insert: {
          agi?: number | null
          avatar_char?: string | null
          cha?: number | null
          company_name?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          end?: number | null
          energy?: number | null
          id: string
          int?: number | null
          level?: number | null
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          scaffai_role?: string | null
          str?: number | null
          team_contribution_score?: number | null
          title?: string | null
          total_tasks_completed?: number | null
          updated_at?: string | null
          xp?: number | null
          subscription_plan?: 'free' | 'plus' | 'pro' | 'max' | null
          subscription_status?: 'active' | 'inactive' | 'canceled' | 'expired' | null
          subscription_end_date?: string | null
          platform_access?: 'mobile_only' | 'web_only' | 'both' | null
        }
        Update: {
          agi?: number | null
          avatar_char?: string | null
          cha?: number | null
          company_name?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          end?: number | null
          energy?: number | null
          id?: string
          int?: number | null
          level?: number | null
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          scaffai_role?: string | null
          str?: number | null
          team_contribution_score?: number | null
          title?: string | null
          total_tasks_completed?: number | null
          updated_at?: string | null
          xp?: number | null
          subscription_plan?: 'free' | 'plus' | 'pro' | 'max' | null
          subscription_status?: 'active' | 'inactive' | 'canceled' | 'expired' | null
          subscription_end_date?: string | null
          platform_access?: 'mobile_only' | 'web_only' | 'both' | null
        }
        Relationships: []
      }
      scaffold_calculations: {
        Row: {
          calculation_version: string | null
          created_at: string | null
          description: string | null
          east_gap: string | null
          eaves_east: number | null
          eaves_handrails: number | null
          eaves_north: number | null
          eaves_south: number | null
          eaves_west: number | null
          ew_span_structure: string | null
          ew_total_span: number | null
          first_layer_height: number | null
          frame_width_ew: number | null
          frame_width_ns: number | null
          has_tie_columns: boolean | null
          id: string
          jack_up_height: number | null
          modules_count: number | null
          north_gap: string | null
          ns_span_structure: string | null
          ns_total_span: number | null
          num_stages: number | null
          project_name: string | null
          property_line_distance_east: number | null
          property_line_distance_north: number | null
          property_line_distance_south: number | null
          property_line_distance_west: number | null
          property_line_east: boolean | null
          property_line_north: boolean | null
          property_line_south: boolean | null
          property_line_west: boolean | null
          reference_height: number | null
          roof_shape: string | null
          site_location: string | null
          south_gap: string | null
          special_material_ew_150: number | null
          special_material_ew_300: number | null
          special_material_ew_355: number | null
          special_material_ns_150: number | null
          special_material_ns_300: number | null
          special_material_ns_355: number | null
          target_offset: number | null
          tie_column_used: boolean | null
          tie_ok: boolean | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          west_gap: string | null
          input_data: Json | null
          result_data: Json | null
        }
        Insert: {
          calculation_version?: string | null
          created_at?: string | null
          description?: string | null
          east_gap?: string | null
          eaves_east?: number | null
          eaves_handrails?: number | null
          eaves_north?: number | null
          eaves_south?: number | null
          eaves_west?: number | null
          ew_span_structure?: string | null
          ew_total_span?: number | null
          first_layer_height?: number | null
          frame_width_ew?: number | null
          frame_width_ns?: number | null
          has_tie_columns?: boolean | null
          id?: string
          jack_up_height?: number | null
          modules_count?: number | null
          north_gap?: string | null
          ns_span_structure?: string | null
          ns_total_span?: number | null
          num_stages?: number | null
          project_name?: string | null
          property_line_distance_east?: number | null
          property_line_distance_north?: number | null
          property_line_distance_south?: number | null
          property_line_distance_west?: number | null
          property_line_east?: boolean | null
          property_line_north?: boolean | null
          property_line_south?: boolean | null
          property_line_west?: boolean | null
          reference_height?: number | null
          roof_shape?: string | null
          site_location?: string | null
          south_gap?: string | null
          special_material_ew_150?: number | null
          special_material_ew_300?: number | null
          special_material_ew_355?: number | null
          special_material_ns_150?: number | null
          special_material_ns_300?: number | null
          special_material_ns_355?: number | null
          target_offset?: number | null
          tie_column_used?: boolean | null
          tie_ok?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          west_gap?: string | null
          input_data?: Json | null
          result_data?: Json | null
        }
        Update: {
          calculation_version?: string | null
          created_at?: string | null
          description?: string | null
          east_gap?: string | null
          eaves_east?: number | null
          eaves_handrails?: number | null
          eaves_north?: number | null
          eaves_south?: number | null
          eaves_west?: number | null
          ew_span_structure?: string | null
          ew_total_span?: number | null
          first_layer_height?: number | null
          frame_width_ew?: number | null
          frame_width_ns?: number | null
          has_tie_columns?: boolean | null
          id?: string
          jack_up_height?: number | null
          modules_count?: number | null
          north_gap?: string | null
          ns_span_structure?: string | null
          ns_total_span?: number | null
          num_stages?: number | null
          project_name?: string | null
          property_line_distance_east?: number | null
          property_line_distance_north?: number | null
          property_line_distance_south?: number | null
          property_line_distance_west?: number | null
          property_line_east?: boolean | null
          property_line_north?: boolean | null
          property_line_south?: boolean | null
          property_line_west?: boolean | null
          reference_height?: number | null
          roof_shape?: string | null
          site_location?: string | null
          south_gap?: string | null
          special_material_ew_150?: number | null
          special_material_ew_300?: number | null
          special_material_ew_355?: number | null
          special_material_ns_150?: number | null
          special_material_ns_300?: number | null
          special_material_ns_355?: number | null
          target_offset?: number | null
          tie_column_used?: boolean | null
          tie_ok?: boolean | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          west_gap?: string | null
          input_data?: Json | null
          result_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "scaffold_calculations_user_id_fkey"
            columns: ["user_id"]
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
      calculate_required_xp: {
        Args: { current_level: number }
        Returns: number
      }
      confirm_user_signup: {
        Args: { user_id: string }
        Returns: undefined
      }
      update_user_stats_and_level: {
        Args: {
          user_id: string
          task_tags: string[]
          task_difficulty: number
          reward_xp: number
        }
        Returns: undefined
      }
    }
    Enums: {
      task_priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
      task_status: "TODO" | "DOING" | "BLOCKED" | "REVIEW" | "DONE"
      user_role: "GUILD_MASTER" | "MEMBER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Table helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Profile type for easier use
export type Profile = Tables<'profiles'>

// Subscription types
export type SubscriptionPlan = 'free' | 'plus' | 'pro' | 'max'
export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'expired'
export type PlatformAccess = 'mobile_only' | 'web_only' | 'both'

// Subscription plan details
export interface PlanDetails {
  name: string
  price: number
  features: string[]
  platformAccess: PlatformAccess
  maxCalculations: number | null // null = unlimited
}

export const PLAN_DETAILS: Record<SubscriptionPlan, PlanDetails> = {
  free: {
    name: 'Free',
    price: 0,
    features: ['Web版 + モバイル版', '無制限計算', '全機能利用可能'],
    platformAccess: 'both',
    maxCalculations: null
  },
  plus: {
    name: 'Plus',
    price: 4980,
    features: ['モバイル版のみ', '無制限計算', '履歴保存', '基本サポート'],
    platformAccess: 'mobile_only',
    maxCalculations: null
  },
  pro: {
    name: 'Pro',
    price: 12800,
    features: ['Web版 + モバイル版', '無制限計算', '作図機能', '高度な計算', 'プライオリティサポート'],
    platformAccess: 'both',
    maxCalculations: null
  },
  max: {
    name: 'Max',
    price: 24800,
    features: ['全プラットフォーム', 'CAD連携', 'API利用', 'チーム機能', '24時間サポート'],
    platformAccess: 'both',
    maxCalculations: null
  }
}

// Scaffold calculation types (Web版用の型定義)
export interface WebScaffoldInputData {
  northSouth: number
  eastWest: number
  referenceHeight: number
  targetDistances: {
    north: number
    east: number
    south: number
    west: number
  }
  roofShape: 'flat' | 'sloped' | 'parapet'
  eaveWidths: {
    north: number
    east: number
    south: number
    west: number
  }
  boundaryDistances: {
    north: number | null
    east: number | null
    south: number | null
    west: number | null
  }
  specialParts: {
    type355: number
    type300: number
    type150: number
  }
}

// モバイル版との変換用
export interface MobileScaffoldInputData {
  width_NS: number
  width_EW: number
  eaves_N: number
  eaves_E: number
  eaves_S: number
  eaves_W: number
  boundary_N: number | null
  boundary_E: number | null
  boundary_S: number | null
  boundary_W: number | null
  standard_height: number
  roof_shape: 'フラット' | '勾配軒' | '陸屋根'
  tie_column: boolean
  railing_count: number
  use_355_NS: number
  use_300_NS: number
  use_150_NS: number
  use_355_EW: number
  use_300_EW: number
  use_150_EW: number
  target_margin_N: number | null
  target_margin_E: number | null
  target_margin_S: number | null
  target_margin_W: number | null
}

export interface ScaffoldCalculationResult {
  ns_total_span: number
  ew_total_span: number
  ns_span_structure: string
  ew_span_structure: string
  north_gap: string
  south_gap: string
  east_gap: string
  west_gap: string
  num_stages: number
  modules_count: number
  jack_up_height: number
  first_layer_height: number
  tie_ok: boolean
  tie_column_used: boolean
}