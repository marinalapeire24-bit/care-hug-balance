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
      care_evaluations: {
        Row: {
          autonomy_score: number
          care_request_id: string
          created_at: string
          duration_per_visit: number
          evaluated_by: string
          evaluation_type: string
          frequency: string
          home_environment: string
          human_needs: string
          id: string
          material_needs: string
          notes: string
          risks: string
          services_needed: string
          validated: boolean
        }
        Insert: {
          autonomy_score?: number
          care_request_id: string
          created_at?: string
          duration_per_visit?: number
          evaluated_by?: string
          evaluation_type?: string
          frequency?: string
          home_environment?: string
          human_needs?: string
          id?: string
          material_needs?: string
          notes?: string
          risks?: string
          services_needed?: string
          validated?: boolean
        }
        Update: {
          autonomy_score?: number
          care_request_id?: string
          created_at?: string
          duration_per_visit?: number
          evaluated_by?: string
          evaluation_type?: string
          frequency?: string
          home_environment?: string
          human_needs?: string
          id?: string
          material_needs?: string
          notes?: string
          risks?: string
          services_needed?: string
          validated?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "care_evaluations_care_request_id_fkey"
            columns: ["care_request_id"]
            isOneToOne: false
            referencedRelation: "care_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      care_plans: {
        Row: {
          care_request_id: string
          created_at: string
          created_by: string
          evaluation_id: string | null
          id: string
          material_needed: Json
          professionals_needed: Json
          schedule_summary: string
          services: Json
          status: string
          title: string
          updated_at: string
          validated_at: string | null
        }
        Insert: {
          care_request_id: string
          created_at?: string
          created_by?: string
          evaluation_id?: string | null
          id?: string
          material_needed?: Json
          professionals_needed?: Json
          schedule_summary?: string
          services?: Json
          status?: string
          title?: string
          updated_at?: string
          validated_at?: string | null
        }
        Update: {
          care_request_id?: string
          created_at?: string
          created_by?: string
          evaluation_id?: string | null
          id?: string
          material_needed?: Json
          professionals_needed?: Json
          schedule_summary?: string
          services?: Json
          status?: string
          title?: string
          updated_at?: string
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_plans_care_request_id_fkey"
            columns: ["care_request_id"]
            isOneToOne: false
            referencedRelation: "care_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_plans_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "care_evaluations"
            referencedColumns: ["id"]
          },
        ]
      }
      care_requests: {
        Row: {
          autonomy_level: number
          created_at: string
          created_by: string
          discharge_date: string | null
          hospital_name: string
          hospital_service: string
          hospitalization_reason: string
          id: string
          needs_summary: string
          patient_id: string
          precautions: string
          situation_summary: string
          status: string
          updated_at: string
        }
        Insert: {
          autonomy_level?: number
          created_at?: string
          created_by?: string
          discharge_date?: string | null
          hospital_name?: string
          hospital_service?: string
          hospitalization_reason?: string
          id?: string
          needs_summary?: string
          patient_id: string
          precautions?: string
          situation_summary?: string
          status?: string
          updated_at?: string
        }
        Update: {
          autonomy_level?: number
          created_at?: string
          created_by?: string
          discharge_date?: string | null
          hospital_name?: string
          hospital_service?: string
          hospitalization_reason?: string
          id?: string
          needs_summary?: string
          patient_id?: string
          precautions?: string
          situation_summary?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
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
      documents: {
        Row: {
          care_request_id: string | null
          category: string
          created_at: string
          description: string
          file_url: string | null
          id: string
          name: string
          patient_id: string
          uploaded_by: string
        }
        Insert: {
          care_request_id?: string | null
          category?: string
          created_at?: string
          description?: string
          file_url?: string | null
          id?: string
          name: string
          patient_id: string
          uploaded_by?: string
        }
        Update: {
          care_request_id?: string | null
          category?: string
          created_at?: string
          description?: string
          file_url?: string | null
          id?: string
          name?: string
          patient_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_care_request_id_fkey"
            columns: ["care_request_id"]
            isOneToOne: false
            referencedRelation: "care_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      family_notifications: {
        Row: {
          created_at: string
          family_member_id: string
          id: string
          message: string
          patient_id: string
          read: boolean
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          family_member_id?: string
          id?: string
          message: string
          patient_id: string
          read?: boolean
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          family_member_id?: string
          id?: string
          message?: string
          patient_id?: string
          read?: boolean
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_notifications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
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
      pathway_history: {
        Row: {
          action: string
          care_request_id: string
          created_at: string
          details: string
          id: string
          performed_by: string | null
          performed_by_name: string
          step_number: number | null
        }
        Insert: {
          action: string
          care_request_id: string
          created_at?: string
          details?: string
          id?: string
          performed_by?: string | null
          performed_by_name?: string
          step_number?: number | null
        }
        Update: {
          action?: string
          care_request_id?: string
          created_at?: string
          details?: string
          id?: string
          performed_by?: string | null
          performed_by_name?: string
          step_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pathway_history_care_request_id_fkey"
            columns: ["care_request_id"]
            isOneToOne: false
            referencedRelation: "care_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      pathway_steps: {
        Row: {
          blocked_reason: string | null
          blocked_since: string | null
          care_request_id: string
          completed_at: string | null
          id: string
          label: string
          notes: string
          responsible_name: string
          responsible_role: string
          started_at: string | null
          status: string
          step_key: string
          step_number: number
        }
        Insert: {
          blocked_reason?: string | null
          blocked_since?: string | null
          care_request_id: string
          completed_at?: string | null
          id?: string
          label: string
          notes?: string
          responsible_name?: string
          responsible_role?: string
          started_at?: string | null
          status?: string
          step_key: string
          step_number: number
        }
        Update: {
          blocked_reason?: string | null
          blocked_since?: string | null
          care_request_id?: string
          completed_at?: string | null
          id?: string
          label?: string
          notes?: string
          responsible_name?: string
          responsible_role?: string
          started_at?: string | null
          status?: string
          step_key?: string
          step_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "pathway_steps_care_request_id_fkey"
            columns: ["care_request_id"]
            isOneToOne: false
            referencedRelation: "care_requests"
            referencedColumns: ["id"]
          },
        ]
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
      transmissions: {
        Row: {
          author_id: string
          author_name: string
          care_request_id: string | null
          category: string
          content: string
          created_at: string
          id: string
          patient_id: string
          priority: string
          read_by: Json
          target_role: string | null
        }
        Insert: {
          author_id?: string
          author_name?: string
          care_request_id?: string | null
          category?: string
          content: string
          created_at?: string
          id?: string
          patient_id: string
          priority?: string
          read_by?: Json
          target_role?: string | null
        }
        Update: {
          author_id?: string
          author_name?: string
          care_request_id?: string | null
          category?: string
          content?: string
          created_at?: string
          id?: string
          patient_id?: string
          priority?: string
          read_by?: Json
          target_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transmissions_care_request_id_fkey"
            columns: ["care_request_id"]
            isOneToOne: false
            referencedRelation: "care_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transmissions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
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
