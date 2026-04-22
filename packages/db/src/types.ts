// Generated via Supabase MCP `generate_typescript_types`.
// Regenerate: `mcp__supabase__generate_typescript_types { project_id: "jeadtvxgxmqnsqwxjmhj" }`
// Do not edit by hand.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          added_at: string | null
          added_by: string | null
          email: string
          notes: string | null
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          email: string
          notes?: string | null
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          email?: string
          notes?: string | null
        }
        Relationships: []
      }
      applications: {
        Row: {
          answers: Json
          candidate_id: string
          created_at: string
          id: string
          pipeline_stage: Database["public"]["Enums"]["pipeline_stage"]
          po_notes: string | null
          position_slug: string
          reached_out: boolean
          reached_out_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          score: number | null
          score_breakdown: Json | null
          status: string | null
          status_reason: string | null
          updated_at: string
        }
        Insert: {
          answers?: Json
          candidate_id: string
          created_at?: string
          id?: string
          pipeline_stage?: Database["public"]["Enums"]["pipeline_stage"]
          po_notes?: string | null
          position_slug: string
          reached_out?: boolean
          reached_out_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number | null
          score_breakdown?: Json | null
          status?: string | null
          status_reason?: string | null
          updated_at?: string
        }
        Update: {
          answers?: Json
          candidate_id?: string
          created_at?: string
          id?: string
          pipeline_stage?: Database["public"]["Enums"]["pipeline_stage"]
          po_notes?: string | null
          position_slug?: string
          reached_out?: boolean
          reached_out_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number | null
          score_breakdown?: Json | null
          status?: string | null
          status_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "readiness_view"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "applications_position_slug_fkey"
            columns: ["position_slug"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "applications_position_slug_fkey"
            columns: ["position_slug"]
            isOneToOne: false
            referencedRelation: "readiness_view"
            referencedColumns: ["position_slug"]
          },
        ]
      }
      candidate_documents: {
        Row: {
          candidate_id: string
          doc_type: Database["public"]["Enums"]["doc_type"]
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          notes: string | null
          uploaded_at: string
          verified: boolean
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          candidate_id: string
          doc_type: Database["public"]["Enums"]["doc_type"]
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          uploaded_at?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          candidate_id?: string
          doc_type?: Database["public"]["Enums"]["doc_type"]
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          uploaded_at?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_documents_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_documents_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "readiness_view"
            referencedColumns: ["candidate_id"]
          },
        ]
      }
      candidates: {
        Row: {
          auth_user_id: string | null
          birth_date: string | null
          city: string | null
          created_at: string
          education: string | null
          email: string | null
          full_name: string
          gender: string | null
          id: string
          phone: string | null
          profile_data: Json
          profile_schema_version: string
          province: string | null
          referrer_url: string | null
          source: string | null
          updated_at: string
          utm_campaign: string | null
          utm_source: string | null
        }
        Insert: {
          auth_user_id?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          education?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          id?: string
          phone?: string | null
          profile_data?: Json
          profile_schema_version?: string
          province?: string | null
          referrer_url?: string | null
          source?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_source?: string | null
        }
        Update: {
          auth_user_id?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          education?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          phone?: string | null
          profile_data?: Json
          profile_schema_version?: string
          province?: string | null
          referrer_url?: string | null
          source?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      consents: {
        Row: {
          candidate_id: string | null
          granted_at: string | null
          id: string
          ip_address: unknown
          pending_id: string | null
          purpose: string
          purpose_text: string
          user_agent: string | null
          version: string
          withdrawn_at: string | null
        }
        Insert: {
          candidate_id?: string | null
          granted_at?: string | null
          id?: string
          ip_address?: unknown
          pending_id?: string | null
          purpose: string
          purpose_text: string
          user_agent?: string | null
          version: string
          withdrawn_at?: string | null
        }
        Update: {
          candidate_id?: string | null
          granted_at?: string | null
          id?: string
          ip_address?: unknown
          pending_id?: string | null
          purpose?: string
          purpose_text?: string
          user_agent?: string | null
          version?: string
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consents_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consents_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "readiness_view"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "consents_pending_id_fkey"
            columns: ["pending_id"]
            isOneToOne: false
            referencedRelation: "pending_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_submissions: {
        Row: {
          consent_ids: string[] | null
          consumed_at: string | null
          created_at: string
          email: string
          expires_at: string
          form_data: Json
          id: string
          ip_address: unknown
          nonce: string
          phone: string | null
          position_slug: string
          user_agent: string | null
        }
        Insert: {
          consent_ids?: string[] | null
          consumed_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          form_data: Json
          id?: string
          ip_address?: unknown
          nonce?: string
          phone?: string | null
          position_slug: string
          user_agent?: string | null
        }
        Update: {
          consent_ids?: string[] | null
          consumed_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          form_data?: Json
          id?: string
          ip_address?: unknown
          nonce?: string
          phone?: string | null
          position_slug?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_submissions_position_slug_fkey"
            columns: ["position_slug"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "pending_submissions_position_slug_fkey"
            columns: ["position_slug"]
            isOneToOne: false
            referencedRelation: "readiness_view"
            referencedColumns: ["position_slug"]
          },
        ]
      }
      positions: {
        Row: {
          active: boolean
          country: string
          created_at: string
          description: string | null
          name: string
          pipeline: Json
          requirements: Json
          role: string
          scoring: Json
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          country: string
          created_at?: string
          description?: string | null
          name: string
          pipeline?: Json
          requirements?: Json
          role: string
          scoring?: Json
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          country?: string
          created_at?: string
          description?: string | null
          name?: string
          pipeline?: Json
          requirements?: Json
          role?: string
          scoring?: Json
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      readiness_view: {
        Row: {
          candidate_id: string | null
          completion_pct: number | null
          country: string | null
          hard_pass: boolean | null
          position_name: string | null
          position_slug: string | null
          readiness: Json | null
        }
        Relationships: []
      }
    }
    Functions: {
      compute_readiness: {
        Args: { profile: Json; requirements: Json }
        Returns: Json
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      doc_type:
        | "ktp"
        | "passport"
        | "cv"
        | "certificate"
        | "medical"
        | "photo"
        | "other"
      pipeline_stage:
        | "applied"
        | "screening"
        | "voice_screen"
        | "interview"
        | "document_check"
        | "briefing"
        | "trial"
        | "selected"
        | "training"
        | "deployed"
        | "active"
        | "rejected"
        | "exit"
      user_role: "candidate" | "admin" | "recruiter"
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
    Enums: {
      doc_type: [
        "ktp",
        "passport",
        "cv",
        "certificate",
        "medical",
        "photo",
        "other",
      ],
      pipeline_stage: [
        "applied",
        "screening",
        "voice_screen",
        "interview",
        "document_check",
        "briefing",
        "trial",
        "selected",
        "training",
        "deployed",
        "active",
        "rejected",
        "exit",
      ],
      user_role: ["candidate", "admin", "recruiter"],
    },
  },
} as const

// =========================================================================
// Requirements v2 helper types (migration 0005 + handwritten, kept in sync
// with the SQL compute_readiness() function signature).
// =========================================================================

export interface RequirementSpec {
  type: "hard" | "soft"
  label: string
  allowed_values?: readonly string[]
}

export type PositionRequirements = Record<string, RequirementSpec>

export interface ReadinessPerField {
  passed: boolean
  type: "hard" | "soft"
  label: string
}

export interface ReadinessResult {
  per_field: Record<string, ReadinessPerField>
  hard_pass: boolean
  score_pct: number
}

/**
 * profile_data JSONB shape (v2, post-migration 0005).
 * v1 (pre-0005) was flat — compute_readiness handles both via COALESCE.
 */
export interface CandidateProfileDataV2 {
  schema_version: 1
  credentials: Record<string, unknown>
  onboarding?: {
    started_at?: string
    completed_at?: string | null
    skipped?: boolean
    last_step?: number
  }
}
