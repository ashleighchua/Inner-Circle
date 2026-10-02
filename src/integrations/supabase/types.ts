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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      criteria: {
        Row: {
          active: boolean
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          type: string
          user_id: string
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          type?: string
          user_id?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      decisions: {
        Row: {
          created_at: string
          date: string
          decision: string
          evidence: string | null
          id: string
          is_demo: boolean
          person_id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          decision: string
          evidence?: string | null
          id?: string
          is_demo?: boolean
          person_id: string
          reason?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          date?: string
          decision?: string
          evidence?: string | null
          id?: string
          is_demo?: boolean
          person_id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "decisions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence: {
        Row: {
          category: string | null
          created_at: string
          feeling: string | null
          id: string
          interaction_id: string | null
          interpretation: string | null
          is_demo: boolean
          observation: string
          person_id: string
          significance: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          feeling?: string | null
          id?: string
          interaction_id?: string | null
          interpretation?: string | null
          is_demo?: boolean
          observation: string
          person_id: string
          significance?: string
          user_id?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          feeling?: string | null
          id?: string
          interaction_id?: string | null
          interpretation?: string | null
          is_demo?: boolean
          observation?: string
          person_id?: string
          significance?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_interaction_id_fkey"
            columns: ["interaction_id"]
            isOneToOne: false
            referencedRelation: "interactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      insight_feedback: {
        Row: {
          created_at: string
          feedback: string
          id: string
          insight_key: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback: string
          id?: string
          insight_key: string
          user_id?: string
        }
        Update: {
          created_at?: string
          feedback?: string
          id?: string
          insight_key?: string
          user_id?: string
        }
        Relationships: []
      }
      interaction_metrics: {
        Row: {
          id: string
          interaction_id: string
          metric_name: string
          score: number
          user_id: string
        }
        Insert: {
          id?: string
          interaction_id: string
          metric_name: string
          score: number
          user_id?: string
        }
        Update: {
          id?: string
          interaction_id?: string
          metric_name?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interaction_metrics_interaction_id_fkey"
            columns: ["interaction_id"]
            isOneToOne: false
            referencedRelation: "interactions"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          created_at: string
          date: string
          disliked: string | null
          factual_observations: string | null
          feelings: string[]
          id: string
          interaction_type: string
          is_demo: boolean
          liked: string | null
          notes: string | null
          person_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          disliked?: string | null
          factual_observations?: string | null
          feelings?: string[]
          id?: string
          interaction_type?: string
          is_demo?: boolean
          liked?: string | null
          notes?: string | null
          person_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          date?: string
          disliked?: string | null
          factual_observations?: string | null
          feelings?: string[]
          id?: string
          interaction_type?: string
          is_demo?: boolean
          liked?: string | null
          notes?: string | null
          person_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          access_level: string
          age: number | null
          created_at: string
          current_status: string
          date_met: string | null
          how_met: string | null
          id: string
          is_demo: boolean
          location: string | null
          name: string
          notes: string | null
          occupation: string | null
          photo_url: string | null
          relationship_type: string
          signals: Json
          unknowns: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_level?: string
          age?: number | null
          created_at?: string
          current_status?: string
          date_met?: string | null
          how_met?: string | null
          id?: string
          is_demo?: boolean
          location?: string | null
          name: string
          notes?: string | null
          occupation?: string | null
          photo_url?: string | null
          relationship_type?: string
          signals?: Json
          unknowns?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          access_level?: string
          age?: number | null
          created_at?: string
          current_status?: string
          date_met?: string | null
          how_met?: string | null
          id?: string
          is_demo?: boolean
          location?: string | null
          name?: string
          notes?: string | null
          occupation?: string | null
          photo_url?: string | null
          relationship_type?: string
          signals?: Json
          unknowns?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reality_checks: {
        Row: {
          answers: Json
          created_at: string
          id: string
          interaction_id: string | null
          is_demo: boolean
          person_id: string
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: string
          interaction_id?: string | null
          is_demo?: boolean
          person_id: string
          user_id?: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          interaction_id?: string | null
          is_demo?: boolean
          person_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reality_checks_interaction_id_fkey"
            columns: ["interaction_id"]
            isOneToOne: false
            referencedRelation: "interactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reality_checks_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      reality_story: {
        Row: {
          created_at: string
          id: string
          is_demo: boolean
          next_step: string | null
          person_id: string
          story: string | null
          user_id: string
          what_happened: string | null
          what_i_dont_know: string | null
          what_i_know: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo?: boolean
          next_step?: string | null
          person_id: string
          story?: string | null
          user_id?: string
          what_happened?: string | null
          what_i_dont_know?: string | null
          what_i_know?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
          next_step?: string | null
          person_id?: string
          story?: string | null
          user_id?: string
          what_happened?: string | null
          what_i_dont_know?: string | null
          what_i_know?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reality_story_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
