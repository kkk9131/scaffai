// Database types (copied from @scaffai/core)
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

// Scaffold calculation types
export interface ScaffoldInputData {
  // 躯体寸法
  width_NS: number;
  width_EW: number;
  
  // 軒の出
  eaves_N: number;
  eaves_E: number;
  eaves_S: number;
  eaves_W: number;
  
  // 境界線距離 (nullは境界指示なし)
  boundary_N: number | null;
  boundary_E: number | null;
  boundary_S: number | null;
  boundary_W: number | null;
  
  // 基準高さと屋根形状
  standard_height: number;
  roof_shape: 'フラット' | '勾配軒' | '陸屋根';
  
  // 根がらみ支柱と軒先手すり
  tie_column: boolean;
  railing_count: number;
  
  // 特殊部材 (南北方向)
  use_355_NS: number;
  use_300_NS: number;
  use_150_NS: number;
  
  // 特殊部材 (東西方向)
  use_355_EW: number;
  use_300_EW: number;
  use_150_EW: number;
  
  // 目標離れ (4面個別設定、nullは軒の出+80の最小離れのみ)
  target_margin_N: number | null;
  target_margin_E: number | null;
  target_margin_S: number | null;
  target_margin_W: number | null;
}

export interface ScaffoldCalculationResult {
  // スパン情報
  ns_total_span: number;
  ew_total_span: number;
  ns_span_structure: string;
  ew_span_structure: string;
  
  // 離れ情報
  north_gap: string;
  south_gap: string;
  east_gap: string;
  west_gap: string;
  
  // 段数・高さ情報
  num_stages: number;
  modules_count: number;
  jack_up_height: number;
  first_layer_height: number;
  
  // 根がらみ支柱情報
  tie_ok: boolean;
  tie_column_used: boolean;
}