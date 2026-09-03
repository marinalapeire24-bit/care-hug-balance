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
      difficulty_reports: {
        Row: {
          caregiver_id: string
          created_at: string | null
          id: string
          intervention_id: string | null
          note: string
          status: string
          suggested_action: string
          type: string
        }
        Insert: {
          caregiver_id?: string
          created_at?: string | null
          id?: string
          intervention_id?: string | null
          note?: string
          status?: string
          suggested_action?: string
          type: string
        }
        Update: {
          caregiver_id?: string
          created_at?: string | null
          id?: string
          intervention_id?: string | null
          note?: string
          status?: string
          suggested_action?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "difficulty_reports_intervention_id_fkey"
            columns: ["intervention_id"]
            isOneToOne: false
            referencedRelation: "interventions"
            referencedColumns: ["id"]
          },
        ]
      }
      interventions: {
        Row: {
          actual_difficulty: number | null
          actual_duration: number | null
          actual_end: string | null
          actual_start: string | null
          actual_travel: number | null
          address: string | null
          caregiver_id: string
          created_at: string | null
          difficulty_level: number
          duration_minutes: number
          extra_tasks: string | null
          id: string
          instructions: string
          patient_id: string
          required_equipment: string
          required_skills: string
          room: string | null
          scheduled_at: string
          status: string
          travel_minutes: number
          variance_reason: string | null
        }
        Insert: {
          actual_difficulty?: number | null
          actual_duration?: number | null
          actual_end?: string | null
          actual_start?: string | null
          actual_travel?: number | null
          address?: string | null
          caregiver_id?: string
          created_at?: string | null
          difficulty_level?: number
          duration_minutes?: number
          extra_tasks?: string | null
          id?: string
          instructions?: string
          patient_id: string
          required_equipment?: string
          required_skills?: string
          room?: string | null
          scheduled_at: string
          status?: string
          travel_minutes?: number
          variance_reason?: string | null
        }
        Update: {
          actual_difficulty?: number | null
          actual_duration?: number | null
          actual_end?: string | null
          actual_start?: string | null
          actual_travel?: number | null
          address?: string | null
          caregiver_id?: string
          created_at?: string | null
          difficulty_level?: number
          duration_minutes?: number
          extra_tasks?: string | null
          id?: string
          instructions?: string
          patient_id?: string
          required_equipment?: string
          required_skills?: string
          room?: string | null
          scheduled_at?: string
          status?: string
          travel_minutes?: number
          variance_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interventions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      invisible_tasks: {
        Row: {
          caregiver_id: string
          created_at: string | null
          duration_minutes: number
          id: string
          note: string
          type: string
        }
        Insert: {
          caregiver_id?: string
          created_at?: string | null
          duration_minutes?: number
          id?: string
          note?: string
          type: string
        }
        Update: {
          caregiver_id?: string
          created_at?: string | null
          duration_minutes?: number
          id?: string
          note?: string
          type?: string
        }
        Relationships: []
      }
      patient_alerts: {
        Row: {
          created_at: string | null
          id: string
          level: string
          message: string
          patient_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: string
          message: string
          patient_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: string
          message?: string
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_changes: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          occurred_at: string
          patient_id: string
          source: string
        }
        Insert: {
          category?: string
          created_at?: string | null
          description: string
          id?: string
          occurred_at?: string
          patient_id: string
          source?: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          occurred_at?: string
          patient_id?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_changes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          birth_date: string | null
          created_at: string | null
          environment: string
          first_name: string
          fragility_level: number
          id: string
          last_name: string
          room: string | null
          summary: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          created_at?: string | null
          environment?: string
          first_name: string
          fragility_level?: number
          id?: string
          last_name: string
          room?: string | null
          summary?: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          created_at?: string | null
          environment?: string
          first_name?: string
          fragility_level?: number
          id?: string
          last_name?: string
          room?: string | null
          summary?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string | null
          full_name?: string
          id: string
          role?: string
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      seed_demo_data: { Args: never; Returns: undefined }
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
