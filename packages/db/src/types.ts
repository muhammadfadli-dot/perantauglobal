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
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_email: string
          admin_user_id: string
          id: string
          ip_address: unknown
          metadata: Json | null
          occurred_at: string
          resource_id: string | null
          resource_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_email: string
          admin_user_id: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          occurred_at?: string
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_email?: string
          admin_user_id?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          occurred_at?: string
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
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
      application_status_history: {
        Row: {
          application_id: string
          changed_at: string
          changed_by: string | null
          from_stage: Database["public"]["Enums"]["pipeline_stage"] | null
          id: string
          internal_note: string | null
          public_note: string | null
          to_stage: Database["public"]["Enums"]["pipeline_stage"]
        }
        Insert: {
          application_id: string
          changed_at?: string
          changed_by?: string | null
          from_stage?: Database["public"]["Enums"]["pipeline_stage"] | null
          id?: string
          internal_note?: string | null
          public_note?: string | null
          to_stage: Database["public"]["Enums"]["pipeline_stage"]
        }
        Update: {
          application_id?: string
          changed_at?: string
          changed_by?: string | null
          from_stage?: Database["public"]["Enums"]["pipeline_stage"] | null
          id?: string
          internal_note?: string | null
          public_note?: string | null
          to_stage?: Database["public"]["Enums"]["pipeline_stage"]
        }
        Relationships: [
          {
            foreignKeyName: "application_status_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_tiers: {
        Row: {
          application_id: string
          assigned_at: string
          assigned_by: string | null
          notes: string | null
          score: number | null
          tier: Database["public"]["Enums"]["tier_label"]
        }
        Insert: {
          application_id: string
          assigned_at?: string
          assigned_by?: string | null
          notes?: string | null
          score?: number | null
          tier: Database["public"]["Enums"]["tier_label"]
        }
        Update: {
          application_id?: string
          assigned_at?: string
          assigned_by?: string | null
          notes?: string | null
          score?: number | null
          tier?: Database["public"]["Enums"]["tier_label"]
        }
        Relationships: [
          {
            foreignKeyName: "application_tiers_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          answers: Json
          candidate_id: string
          created_at: string
          id: string
          job_order_id: string | null
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
          job_order_id?: string | null
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
          job_order_id?: string | null
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
            foreignKeyName: "applications_job_order_id_fkey"
            columns: ["job_order_id"]
            isOneToOne: false
            referencedRelation: "job_orders"
            referencedColumns: ["id"]
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
          application_id: string | null
          candidate_id: string
          display_name: string | null
          doc_type: Database["public"]["Enums"]["doc_type"]
          expires_at: string | null
          file_path: string
          file_size: number | null
          id: string
          metadata: Json
          mime_type: string | null
          notes: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejected_reason: string | null
          uploaded_at: string
          verified: boolean
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          application_id?: string | null
          candidate_id: string
          display_name?: string | null
          doc_type: Database["public"]["Enums"]["doc_type"]
          expires_at?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          metadata?: Json
          mime_type?: string | null
          notes?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejected_reason?: string | null
          uploaded_at?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          application_id?: string | null
          candidate_id?: string
          display_name?: string | null
          doc_type?: Database["public"]["Enums"]["doc_type"]
          expires_at?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          metadata?: Json
          mime_type?: string | null
          notes?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejected_reason?: string | null
          uploaded_at?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
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
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          notes: string | null
          phone: string | null
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
      employer_inquiries: {
        Row: {
          additional_requirements: string | null
          company_name: string
          contact_person: string
          country: string
          created_at: string
          email: string
          id: string
          industry: string
          notes: string | null
          phone: string
          status: string
          timeline: string
          workers_needed: string
        }
        Insert: {
          additional_requirements?: string | null
          company_name: string
          contact_person: string
          country: string
          created_at?: string
          email: string
          id?: string
          industry: string
          notes?: string | null
          phone: string
          status?: string
          timeline: string
          workers_needed: string
        }
        Update: {
          additional_requirements?: string | null
          company_name?: string
          contact_person?: string
          country?: string
          created_at?: string
          email?: string
          id?: string
          industry?: string
          notes?: string | null
          phone?: string
          status?: string
          timeline?: string
          workers_needed?: string
        }
        Relationships: []
      }
      job_orders: {
        Row: {
          created_at: string
          created_by: string | null
          deadline: string | null
          employer_city: string | null
          id: string
          intake_label: string
          internal_employer_name: string
          notes: string | null
          position_slug: string
          public_description: string | null
          public_employer_name: string | null
          slot_count: number
          slot_filled: number
          status: Database["public"]["Enums"]["job_order_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          employer_city?: string | null
          id?: string
          intake_label: string
          internal_employer_name: string
          notes?: string | null
          position_slug: string
          public_description?: string | null
          public_employer_name?: string | null
          slot_count: number
          slot_filled?: number
          status?: Database["public"]["Enums"]["job_order_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          employer_city?: string | null
          id?: string
          intake_label?: string
          internal_employer_name?: string
          notes?: string | null
          position_slug?: string
          public_description?: string | null
          public_employer_name?: string | null
          slot_count?: number
          slot_filled?: number
          status?: Database["public"]["Enums"]["job_order_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_orders_position_slug_fkey"
            columns: ["position_slug"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "job_orders_position_slug_fkey"
            columns: ["position_slug"]
            isOneToOne: false
            referencedRelation: "readiness_view"
            referencedColumns: ["position_slug"]
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
      position_application_fields: {
        Row: {
          collect_at_stage: Database["public"]["Enums"]["pipeline_stage"]
          created_at: string
          document_type: Database["public"]["Enums"]["doc_type"] | null
          field_help: string | null
          field_key: string
          field_label: string
          field_type: Database["public"]["Enums"]["form_field_type"]
          id: string
          importance: Database["public"]["Enums"]["application_field_importance"]
          options: Json | null
          position_slug: string
          section: Database["public"]["Enums"]["application_field_section"]
          sort_order: number
          tier_weight: number
          updated_at: string
        }
        Insert: {
          collect_at_stage?: Database["public"]["Enums"]["pipeline_stage"]
          created_at?: string
          document_type?: Database["public"]["Enums"]["doc_type"] | null
          field_help?: string | null
          field_key: string
          field_label: string
          field_type: Database["public"]["Enums"]["form_field_type"]
          id?: string
          importance?: Database["public"]["Enums"]["application_field_importance"]
          options?: Json | null
          position_slug: string
          section?: Database["public"]["Enums"]["application_field_section"]
          sort_order?: number
          tier_weight?: number
          updated_at?: string
        }
        Update: {
          collect_at_stage?: Database["public"]["Enums"]["pipeline_stage"]
          created_at?: string
          document_type?: Database["public"]["Enums"]["doc_type"] | null
          field_help?: string | null
          field_key?: string
          field_label?: string
          field_type?: Database["public"]["Enums"]["form_field_type"]
          id?: string
          importance?: Database["public"]["Enums"]["application_field_importance"]
          options?: Json | null
          position_slug?: string
          section?: Database["public"]["Enums"]["application_field_section"]
          sort_order?: number
          tier_weight?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "position_application_fields_position_slug_fkey"
            columns: ["position_slug"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "position_application_fields_position_slug_fkey"
            columns: ["position_slug"]
            isOneToOne: false
            referencedRelation: "readiness_view"
            referencedColumns: ["position_slug"]
          },
        ]
      }
      position_form_fields: {
        Row: {
          collect_at_stage: Database["public"]["Enums"]["pipeline_stage"]
          created_at: string
          field_help: string | null
          field_key: string
          field_label: string
          field_type: Database["public"]["Enums"]["form_field_type"]
          id: string
          options: Json | null
          position_slug: string
          required: boolean
          sort_order: number
          tier_weight: number
          updated_at: string
        }
        Insert: {
          collect_at_stage?: Database["public"]["Enums"]["pipeline_stage"]
          created_at?: string
          field_help?: string | null
          field_key: string
          field_label: string
          field_type: Database["public"]["Enums"]["form_field_type"]
          id?: string
          options?: Json | null
          position_slug: string
          required?: boolean
          sort_order?: number
          tier_weight?: number
          updated_at?: string
        }
        Update: {
          collect_at_stage?: Database["public"]["Enums"]["pipeline_stage"]
          created_at?: string
          field_help?: string | null
          field_key?: string
          field_label?: string
          field_type?: Database["public"]["Enums"]["form_field_type"]
          id?: string
          options?: Json | null
          position_slug?: string
          required?: boolean
          sort_order?: number
          tier_weight?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "position_form_fields_position_slug_fkey"
            columns: ["position_slug"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "position_form_fields_position_slug_fkey"
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
          content: Json
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
          content?: Json
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
          content?: Json
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
      applications_stage_counts: {
        Args: { p_position?: string; p_search?: string }
        Returns: {
          count: number
          pipeline_stage: Database["public"]["Enums"]["pipeline_stage"]
        }[]
      }
      compute_readiness: {
        Args: { profile: Json; requirements: Json }
        Returns: Json
      }
      compute_readiness_v3: {
        Args: { p_candidate_id: string; p_position_slug: string }
        Returns: Json
      }
      is_admin: { Args: never; Returns: boolean }
      list_applications_for_admin: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_pool?: string
          p_position?: string
          p_search?: string
          p_sort?: string
        }
        Returns: {
          candidate_city: string
          candidate_id: string
          candidate_name: string
          candidate_phone: string
          created_at: string
          id: string
          job_order_id: string
          job_order_intake_label: string
          pipeline_stage: Database["public"]["Enums"]["pipeline_stage"]
          position_country: string
          position_name: string
          position_slug: string
          reached_out: boolean
          readiness: Json
          score: number
          total_count: number
        }[]
      }
      log_admin_action: {
        Args: {
          p_action: string
          p_ip_address?: unknown
          p_metadata?: Json
          p_resource_id: string
          p_resource_type: string
          p_user_agent?: string
        }
        Returns: string
      }
      migrate_requirement_v2_to_v3: { Args: { req: Json }; Returns: Json }
    }
    Enums: {
      application_field_importance: "required" | "optional"
      application_field_section: "syarat_utama" | "kualifikasi" | "screening"
      doc_type:
        | "ktp"
        | "passport"
        | "cv"
        | "certificate"
        | "medical"
        | "photo"
        | "other"
        | "formal_photo"
        | "str_certificate"
        | "driving_license"
        | "language_certificate"
        | "professional_certificate"
        | "education_certificate"
        | "work_certificate"
        | "medical_check"
      form_field_type:
        | "select"
        | "radio"
        | "number"
        | "text"
        | "textarea"
        | "file"
        | "multiselect"
      job_order_status: "open" | "closed" | "filled" | "cancelled"
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
      tier_label: "A" | "B" | "C" | "D" | "rejected"
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

// =========================================================================
// Convenience aliases — hand-added (not regenerated).
// Re-add these if generate_typescript_types overwrites this file.
// =========================================================================
export type PipelineStage = Database["public"]["Enums"]["pipeline_stage"]
export type DocType = Database["public"]["Enums"]["doc_type"]
export type FormFieldType = Database["public"]["Enums"]["form_field_type"]
export type JobOrderStatus = Database["public"]["Enums"]["job_order_status"]
export type TierLabel = Database["public"]["Enums"]["tier_label"]
export type UserRole = Database["public"]["Enums"]["user_role"]
export type ApplicationFieldImportance = Database["public"]["Enums"]["application_field_importance"]
export type ApplicationFieldSection = Database["public"]["Enums"]["application_field_section"]

export const Constants = {
  public: {
    Enums: {
      application_field_importance: ["required", "optional"],
      application_field_section: ["syarat_utama", "kualifikasi", "screening"],
      doc_type: [
        "ktp",
        "passport",
        "cv",
        "certificate",
        "medical",
        "photo",
        "other",
        "formal_photo",
        "str_certificate",
        "driving_license",
        "language_certificate",
        "professional_certificate",
        "education_certificate",
        "work_certificate",
        "medical_check",
      ],
      form_field_type: [
        "select",
        "radio",
        "number",
        "text",
        "textarea",
        "file",
        "multiselect",
      ],
      job_order_status: [
        "open",
        "closed",
        "filled",
        "cancelled",
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
      tier_label: ["A", "B", "C", "D", "rejected"],
      user_role: ["candidate", "admin", "recruiter"],
    },
  },
} as const
