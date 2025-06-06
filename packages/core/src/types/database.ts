import type { Json } from './index';

export type Database = {
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
      tasks: {
        Row: {
          actual_hours: number | null
          completion_quality: number | null
          created_at: string | null
          created_by: string | null
          deadline: string | null
          description: string | null
          difficulty: number | null
          estimated_hours: number | null
          id: string
          owner_id: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          reviewer_id: string | null
          reward_xp: number | null
          status: Database["public"]["Enums"]["task_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_hours?: number | null
          completion_quality?: number | null
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          difficulty?: number | null
          estimated_hours?: number | null
          id?: string
          owner_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          reviewer_id?: string | null
          reward_xp?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_hours?: number | null
          completion_quality?: number | null
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          difficulty?: number | null
          estimated_hours?: number | null
          id?: string
          owner_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          reviewer_id?: string | null
          reward_xp?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_reviewer_id_fkey"
            columns: ["reviewer_id"]
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']