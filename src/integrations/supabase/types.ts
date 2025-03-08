export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          achieved_at: string | null
          category: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          points_earned: number
          progress: number | null
          total: number | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          achieved_at?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          points_earned?: number
          progress?: number | null
          total?: number | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          achieved_at?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          points_earned?: number
          progress?: number | null
          total?: number | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      daily_routines: {
        Row: {
          category: string
          completed: boolean | null
          created_at: string
          description: string | null
          duration_days: number | null
          end_date: string | null
          end_time: string | null
          frequency: string
          id: string
          last_completed_at: string | null
          participants: Json | null
          reminder_time: number | null
          repeat_config: Json | null
          scheduled_date: string
          start_time: string
          streak_count: number | null
          title: string
          total_completions: number | null
          user_id: string | null
        }
        Insert: {
          category?: string
          completed?: boolean | null
          created_at?: string
          description?: string | null
          duration_days?: number | null
          end_date?: string | null
          end_time?: string | null
          frequency?: string
          id?: string
          last_completed_at?: string | null
          participants?: Json | null
          reminder_time?: number | null
          repeat_config?: Json | null
          scheduled_date: string
          start_time: string
          streak_count?: number | null
          title: string
          total_completions?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string
          completed?: boolean | null
          created_at?: string
          description?: string | null
          duration_days?: number | null
          end_date?: string | null
          end_time?: string | null
          frequency?: string
          id?: string
          last_completed_at?: string | null
          participants?: Json | null
          reminder_time?: number | null
          repeat_config?: Json | null
          scheduled_date?: string
          start_time?: string
          streak_count?: number | null
          title?: string
          total_completions?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      goal_actions: {
        Row: {
          action_type: string
          completed: boolean | null
          created_at: string | null
          description: string | null
          frequency: string | null
          goal_id: string | null
          id: string
          source: string | null
          source_reference: string | null
          title: string
        }
        Insert: {
          action_type: string
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          frequency?: string | null
          goal_id?: string | null
          id?: string
          source?: string | null
          source_reference?: string | null
          title: string
        }
        Update: {
          action_type?: string
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          frequency?: string | null
          goal_id?: string | null
          id?: string
          source?: string | null
          source_reference?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_actions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_milestones: {
        Row: {
          completed: boolean | null
          created_at: string | null
          description: string | null
          goal_id: string | null
          id: string
          order_index: number
          target_date: string
          title: string
          updated_at: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          goal_id?: string | null
          id?: string
          order_index: number
          target_date: string
          title: string
          updated_at?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          goal_id?: string | null
          id?: string
          order_index?: number
          target_date?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          area: string
          completed: boolean | null
          created_at: string | null
          description: string | null
          id: string
          progress: number | null
          status: string | null
          target_date: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          area: string
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          target_date: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          area?: string
          completed?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          target_date?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      google_calendar_integration: {
        Row: {
          access_token: string | null
          created_at: string
          id: string
          is_enabled: boolean | null
          refresh_token: string | null
          token_expiry: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          refresh_token?: string | null
          token_expiry?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          refresh_token?: string | null
          token_expiry?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      google_calendar_preferences: {
        Row: {
          created_at: string
          id: string
          import_all: boolean | null
          import_meetings: boolean | null
          import_personal: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          import_all?: boolean | null
          import_meetings?: boolean | null
          import_personal?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          import_all?: boolean | null
          import_meetings?: boolean | null
          import_personal?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      memories: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          file_path: string | null
          id: string
          is_favorite: boolean | null
          last_reviewed_at: string | null
          review_count: number | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string | null
          url: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          file_path?: string | null
          id?: string
          is_favorite?: boolean | null
          last_reviewed_at?: string | null
          review_count?: number | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          file_path?: string | null
          id?: string
          is_favorite?: boolean | null
          last_reviewed_at?: string | null
          review_count?: number | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      memory_reflections: {
        Row: {
          content: string
          created_at: string | null
          id: string
          mood_ref: string | null
          prompt_used: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          mood_ref?: string | null
          prompt_used?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          mood_ref?: string | null
          prompt_used?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memory_reflections_mood_ref_fkey"
            columns: ["mood_ref"]
            isOneToOne: false
            referencedRelation: "moods"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_reminders: {
        Row: {
          created_at: string | null
          id: string
          memory_id: string | null
          reminder_date: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          memory_id?: string | null
          reminder_date: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          memory_id?: string | null
          reminder_date?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memory_reminders_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memories"
            referencedColumns: ["id"]
          },
        ]
      }
      monitoring_data: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          processed: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data: Json
          id?: string
          processed?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          processed?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      monitoring_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          created_at: string | null
          id: string
          intensity: number
          mood_type: string
          note: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          intensity: number
          mood_type: string
          note?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          intensity?: number
          mood_type?: string
          note?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      moods: {
        Row: {
          color: string
          created_at: string | null
          id: string
          mood: string
          user_id: string | null
        }
        Insert: {
          color: string
          created_at?: string | null
          id?: string
          mood: string
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          mood?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          has_due_date: boolean | null
          has_reminder: boolean | null
          id: string
          is_priority: boolean | null
          is_today: boolean | null
          title: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          has_due_date?: boolean | null
          has_reminder?: boolean | null
          id?: string
          is_priority?: boolean | null
          is_today?: boolean | null
          title: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          has_due_date?: boolean | null
          has_reminder?: boolean | null
          id?: string
          is_priority?: boolean | null
          is_today?: boolean | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      points_history: {
        Row: {
          created_at: string | null
          id: string
          points: number
          reason: string
          reference_id: string
          reference_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          points: number
          reason: string
          reference_id: string
          reference_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          points?: number
          reason?: string
          reference_id?: string
          reference_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      subtasks: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          order_index: number | null
          task_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          order_index?: number | null
          task_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          order_index?: number | null
          task_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          log_type: string
          processed: boolean | null
          user_id: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          id?: string
          log_type: string
          processed?: boolean | null
          user_id?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          log_type?: string
          processed?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          archived: boolean | null
          color: string | null
          completed: boolean | null
          created_at: string | null
          details: string | null
          duration: number | null
          frequency: string | null
          id: string
          location: string | null
          meeting_link: string | null
          notification_time: string | null
          priority: string | null
          scheduled: boolean | null
          scheduled_date: string
          start_time: string | null
          title: string
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          archived?: boolean | null
          color?: string | null
          completed?: boolean | null
          created_at?: string | null
          details?: string | null
          duration?: number | null
          frequency?: string | null
          id?: string
          location?: string | null
          meeting_link?: string | null
          notification_time?: string | null
          priority?: string | null
          scheduled?: boolean | null
          scheduled_date: string
          start_time?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          archived?: boolean | null
          color?: string | null
          completed?: boolean | null
          created_at?: string | null
          details?: string | null
          duration?: number | null
          frequency?: string | null
          id?: string
          location?: string | null
          meeting_link?: string | null
          notification_time?: string | null
          priority?: string | null
          scheduled?: boolean | null
          scheduled_date?: string
          start_time?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_levels: {
        Row: {
          created_at: string | null
          id: string
          level: number
          points: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: number
          points?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: number
          points?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_questionnaire: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          results: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          results?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          results?: Json | null
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
      calculate_level: {
        Args: {
          points: number
        }
        Returns: number
      }
      delete_all_user_tasks: {
        Args: {
          user_uuid: string
        }
        Returns: undefined
      }
      update_user_points: {
        Args: {
          user_id: string
          points_to_add: number
          reason: string
          ref_type: string
          ref_id: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
