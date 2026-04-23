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
        Row: { added_at: string | null; added_by: string | null; email: string; notes: string | null }
        Insert: { added_at?: string | null; added_by?: string | null; email: string; notes?: string | null }
        Update: { added_at?: string | null; added_by?: string | null; email?: string; notes?: string | null }
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
          rejected_at: string | null
          rejected_by: string | null
          rejected_reason: string | null
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
          rejected_at?: string | null
          rejected_by?: string | null
          rejected_reason?: string | null
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
            foreignKeyName: "candidate_documents_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
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
        Relationships: []
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
        Relationships: []
      }
      position_form_fields: {
        Row: {
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
        | "ktp" | "passport" | "cv" | "certificate" | "medical" | "photo" | "other"
      form_field_type:
        | "select" | "radio" | "number" | "text" | "textarea" | "file" | "multiselect"
      job_order_status: "open" | "closed" | "filled" | "cancelled"
      pipeline_stage:
        | "applied" | "screening" | "voice_screen" | "interview" | "document_check"
        | "briefing" | "trial" | "selected" | "training" | "deployed" | "active"
        | "rejected" | "exit"
      tier_label: "A" | "B" | "C" | "D" | "rejected"
      user_role: "candidate" | "admin" | "recruiter"
    }
    CompositeTypes: { [_ in never]: never }
  }
}
