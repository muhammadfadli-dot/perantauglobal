// Generated via Supabase MCP `generate_typescript_types`.
// Regenerate: `mcp__supabase__generate_typescript_types { project_id: "jeadtvxgxmqnsqwxjmhj" }`
// Do not edit by hand (except the Convenience aliases section at bottom).

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
      academy_enrollments: {
        Row: {
          answers: Json
          candidate_id: string
          certificate_id: string | null
          certificate_url: string | null
          completed_at: string | null
          created_at: string
          enrolled_at: string
          external_ref: string | null
          external_status: string | null
          external_url: string | null
          id: string
          program_slug: string
          progress_pct: number
          score: number | null
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          answers?: Json
          candidate_id: string
          certificate_id?: string | null
          certificate_url?: string | null
          completed_at?: string | null
          created_at?: string
          enrolled_at?: string
          external_ref?: string | null
          external_status?: string | null
          external_url?: string | null
          id?: string
          program_slug: string
          progress_pct?: number
          score?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          answers?: Json
          candidate_id?: string
          certificate_id?: string | null
          certificate_url?: string | null
          completed_at?: string | null
          created_at?: string
          enrolled_at?: string
          external_ref?: string | null
          external_status?: string | null
          external_url?: string | null
          id?: string
          program_slug?: string
          progress_pct?: number
          score?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_enrollments_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_enrollments_program_slug_fkey"
            columns: ["program_slug"]
            isOneToOne: false
            referencedRelation: "academy_programs"
            referencedColumns: ["slug"]
          },
        ]
      }
      academy_lesson_keys: {
        Row: {
          created_at: string
          keys: Json
          lesson_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          keys?: Json
          lesson_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          keys?: Json
          lesson_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_lesson_keys_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: true
            referencedRelation: "academy_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_lesson_progress: {
        Row: {
          answers: Json | null
          completed_at: string
          enrollment_id: string
          id: string
          lesson_id: string
          score: number | null
          status: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string
          enrollment_id: string
          id?: string
          lesson_id: string
          score?: number | null
          status?: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string
          enrollment_id?: string
          id?: string
          lesson_id?: string
          score?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_lesson_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "academy_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "academy_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_lessons: {
        Row: {
          content: Json
          created_at: string
          estimated_minutes: number | null
          id: string
          lesson_num: number
          lesson_type: string
          module_id: string
          pass_threshold: number | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          estimated_minutes?: number | null
          id?: string
          lesson_num: number
          lesson_type?: string
          module_id: string
          pass_threshold?: number | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          estimated_minutes?: number | null
          id?: string
          lesson_num?: number
          lesson_type?: string
          module_id?: string
          pass_threshold?: number | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "academy_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_modules: {
        Row: {
          created_at: string
          id: string
          module_num: number
          program_slug: string
          sort_order: number
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          module_num: number
          program_slug: string
          sort_order?: number
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          module_num?: number
          program_slug?: string
          sort_order?: number
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_modules_program_slug_fkey"
            columns: ["program_slug"]
            isOneToOne: false
            referencedRelation: "academy_programs"
            referencedColumns: ["slug"]
          },
        ]
      }
      academy_programs: {
        Row: {
          capacity: number | null
          category: string
          content: Json
          country: string | null
          cover_image: string | null
          created_at: string
          credential_delivery: string
          credential_issuer: string | null
          delivery_mode: string
          duration_label: string | null
          external_url: string | null
          facilitated_by: string
          is_free: boolean
          location: string | null
          output_type: string
          pass_threshold: number
          price: number | null
          published_at: string | null
          slug: string
          sort_order: number
          starts_at: string | null
          status: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          category?: string
          content?: Json
          country?: string | null
          cover_image?: string | null
          created_at?: string
          credential_delivery?: string
          credential_issuer?: string | null
          delivery_mode?: string
          duration_label?: string | null
          external_url?: string | null
          facilitated_by?: string
          is_free?: boolean
          location?: string | null
          output_type?: string
          pass_threshold?: number
          price?: number | null
          published_at?: string | null
          slug: string
          sort_order?: number
          starts_at?: string | null
          status?: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          category?: string
          content?: Json
          country?: string | null
          cover_image?: string | null
          created_at?: string
          credential_delivery?: string
          credential_issuer?: string | null
          delivery_mode?: string
          duration_label?: string | null
          external_url?: string | null
          facilitated_by?: string
          is_free?: boolean
          location?: string | null
          output_type?: string
          pass_threshold?: number
          price?: number | null
          published_at?: string | null
          slug?: string
          sort_order?: number
          starts_at?: string | null
          status?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      affiliate_agents: {
        Row: {
          city: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      affiliate_commission_events: {
        Row: {
          agent_id: string
          amount: number | null
          application_id: string | null
          approved_at: string | null
          approved_by: string | null
          candidate_id: string
          created_at: string
          currency: string
          event_type: string
          id: string
          notes: string | null
          paid_at: string | null
          status: string
          triggered_stage: Database["public"]["Enums"]["pipeline_stage"] | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          amount?: number | null
          application_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          candidate_id: string
          created_at?: string
          currency?: string
          event_type: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          status?: string
          triggered_stage?: Database["public"]["Enums"]["pipeline_stage"] | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          amount?: number | null
          application_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          candidate_id?: string
          created_at?: string
          currency?: string
          event_type?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          status?: string
          triggered_stage?: Database["public"]["Enums"]["pipeline_stage"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commission_events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "affiliate_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commission_events_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "application_readiness_view"
            referencedColumns: ["application_id"]
          },
          {
            foreignKeyName: "affiliate_commission_events_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commission_events_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      application_cv_fit: {
        Row: {
          application_id: string
          assessment_id: string | null
          cost_usd: number | null
          created_at: string
          fit_score: number | null
          has_flags: boolean
          id: string
          model: string | null
          position_slug: string
          prompt_version: string | null
          reasons: Json
          status: string
          updated_at: string
          verification: Json
        }
        Insert: {
          application_id: string
          assessment_id?: string | null
          cost_usd?: number | null
          created_at?: string
          fit_score?: number | null
          has_flags?: boolean
          id?: string
          model?: string | null
          position_slug: string
          prompt_version?: string | null
          reasons?: Json
          status?: string
          updated_at?: string
          verification?: Json
        }
        Update: {
          application_id?: string
          assessment_id?: string | null
          cost_usd?: number | null
          created_at?: string
          fit_score?: number | null
          has_flags?: boolean
          id?: string
          model?: string | null
          position_slug?: string
          prompt_version?: string | null
          reasons?: Json
          status?: string
          updated_at?: string
          verification?: Json
        }
        Relationships: [
          {
            foreignKeyName: "application_cv_fit_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "application_readiness_view"
            referencedColumns: ["application_id"]
          },
          {
            foreignKeyName: "application_cv_fit_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_cv_fit_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "cv_assessments"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "application_readiness_view"
            referencedColumns: ["application_id"]
          },
          {
            foreignKeyName: "application_status_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
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
            referencedRelation: "application_readiness_view"
            referencedColumns: ["application_id"]
          },
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
          referral_attributed_at: string | null
          referral_code_input: string | null
          referred_by_agent_id: string | null
          referred_by_code_id: string | null
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
          referral_attributed_at?: string | null
          referral_code_input?: string | null
          referred_by_agent_id?: string | null
          referred_by_code_id?: string | null
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
          referral_attributed_at?: string | null
          referral_code_input?: string | null
          referred_by_agent_id?: string | null
          referred_by_code_id?: string | null
          referrer_url?: string | null
          source?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_referred_by_agent_id_fkey"
            columns: ["referred_by_agent_id"]
            isOneToOne: false
            referencedRelation: "affiliate_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_referred_by_code_id_fkey"
            columns: ["referred_by_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
        ]
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
      cv_assessments: {
        Row: {
          candidate_id: string
          cost_usd: number | null
          created_at: string
          derived: Json
          document_id: string
          error: string | null
          id: string
          model: string | null
          parsed: Json
          prompt_version: string | null
          quality: Json
          quality_score: number | null
          status: string
          tokens_in: number | null
          tokens_out: number | null
          updated_at: string
        }
        Insert: {
          candidate_id: string
          cost_usd?: number | null
          created_at?: string
          derived?: Json
          document_id: string
          error?: string | null
          id?: string
          model?: string | null
          parsed?: Json
          prompt_version?: string | null
          quality?: Json
          quality_score?: number | null
          status?: string
          tokens_in?: number | null
          tokens_out?: number | null
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          cost_usd?: number | null
          created_at?: string
          derived?: Json
          document_id?: string
          error?: string | null
          id?: string
          model?: string | null
          parsed?: Json
          prompt_version?: string | null
          quality?: Json
          quality_score?: number | null
          status?: string
          tokens_in?: number | null
          tokens_out?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cv_assessments_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cv_assessments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "candidate_documents"
            referencedColumns: ["id"]
          },
        ]
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
      event_registrations: {
        Row: {
          answers: Json
          city: string | null
          consent_marketing: boolean
          created_at: string
          email: string
          event_slug: string
          fbc: string | null
          fbp: string | null
          full_name: string
          id: string
          interest: string | null
          ip_address: unknown
          meta_event_id: string | null
          profession: string | null
          referrer_url: string | null
          source: string | null
          status: string
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          whatsapp: string
        }
        Insert: {
          answers?: Json
          city?: string | null
          consent_marketing?: boolean
          created_at?: string
          email: string
          event_slug: string
          fbc?: string | null
          fbp?: string | null
          full_name: string
          id?: string
          interest?: string | null
          ip_address?: unknown
          meta_event_id?: string | null
          profession?: string | null
          referrer_url?: string | null
          source?: string | null
          status?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          whatsapp: string
        }
        Update: {
          answers?: Json
          city?: string | null
          consent_marketing?: boolean
          created_at?: string
          email?: string
          event_slug?: string
          fbc?: string | null
          fbp?: string | null
          full_name?: string
          id?: string
          interest?: string | null
          ip_address?: unknown
          meta_event_id?: string | null
          profession?: string | null
          referrer_url?: string | null
          source?: string | null
          status?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_slug_fkey"
            columns: ["event_slug"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["slug"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          content: Json
          cover_image: string | null
          created_at: string
          ends_at: string | null
          join_url: string | null
          kind: string
          platform: string
          slug: string
          starts_at: string
          status: string
          timezone: string
          title: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          content?: Json
          cover_image?: string | null
          created_at?: string
          ends_at?: string | null
          join_url?: string | null
          kind?: string
          platform?: string
          slug: string
          starts_at: string
          status?: string
          timezone?: string
          title: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          content?: Json
          cover_image?: string | null
          created_at?: string
          ends_at?: string | null
          join_url?: string | null
          kind?: string
          platform?: string
          slug?: string
          starts_at?: string
          status?: string
          timezone?: string
          title?: string
          updated_at?: string
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
          intent: string
          ip_address: unknown
          nonce: string
          phone: string | null
          position_slug: string | null
          program_slug: string | null
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
          intent?: string
          ip_address?: unknown
          nonce?: string
          phone?: string | null
          position_slug?: string | null
          program_slug?: string | null
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
          intent?: string
          ip_address?: unknown
          nonce?: string
          phone?: string | null
          position_slug?: string | null
          program_slug?: string | null
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
            foreignKeyName: "pending_submissions_program_slug_fkey"
            columns: ["program_slug"]
            isOneToOne: false
            referencedRelation: "academy_programs"
            referencedColumns: ["slug"]
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
        ]
      }
      positions: {
        Row: {
          active: boolean
          content: Json
          country: string
          created_at: string
          description: string | null
          draft_content: Json | null
          name: string
          pipeline: Json
          published_at: string | null
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
          draft_content?: Json | null
          name: string
          pipeline?: Json
          published_at?: string | null
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
          draft_content?: Json | null
          name?: string
          pipeline?: Json
          published_at?: string | null
          role?: string
          scoring?: Json
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      program_registration_fields: {
        Row: {
          created_at: string
          field_help: string | null
          field_key: string
          field_label: string
          field_type: Database["public"]["Enums"]["form_field_type"]
          id: string
          options: Json | null
          program_slug: string
          required: boolean
          sort_order: number
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
          program_slug: string
          required?: boolean
          sort_order?: number
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
          program_slug?: string
          required?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_registration_fields_program_slug_fkey"
            columns: ["program_slug"]
            isOneToOne: false
            referencedRelation: "academy_programs"
            referencedColumns: ["slug"]
          },
        ]
      }
      referral_codes: {
        Row: {
          agent_id: string
          code: string
          created_at: string
          id: string
          label: string | null
          status: string
        }
        Insert: {
          agent_id: string
          code: string
          created_at?: string
          id?: string
          label?: string | null
          status?: string
        }
        Update: {
          agent_id?: string
          code?: string
          created_at?: string
          id?: string
          label?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "affiliate_agents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      application_completeness_view: {
        Row: {
          all_required_filled: boolean | null
          application_id: string | null
          candidate_id: string | null
          position_slug: string | null
        }
        Insert: {
          all_required_filled?: never
          application_id?: string | null
          candidate_id?: string | null
          position_slug?: string | null
        }
        Update: {
          all_required_filled?: never
          application_id?: string | null
          candidate_id?: string | null
          position_slug?: string | null
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
            foreignKeyName: "applications_position_slug_fkey"
            columns: ["position_slug"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["slug"]
          },
        ]
      }
      application_readiness_view: {
        Row: {
          application_id: string | null
          candidate_id: string | null
          hard_pass: boolean | null
          position_slug: string | null
        }
        Insert: {
          application_id?: string | null
          candidate_id?: string | null
          hard_pass?: never
          position_slug?: string | null
        }
        Update: {
          application_id?: string | null
          candidate_id?: string | null
          hard_pass?: never
          position_slug?: string | null
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
            foreignKeyName: "applications_position_slug_fkey"
            columns: ["position_slug"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["slug"]
          },
        ]
      }
    }
    Functions: {
      _assert_academy_enrollment_owner: {
        Args: { p_enrollment_id: string }
        Returns: string
      }
      _attribute_candidate_referral: {
        Args: { p_candidate_id: string; p_raw: string }
        Returns: undefined
      }
      _recompute_academy_enrollment: {
        Args: { p_enrollment_id: string }
        Returns: undefined
      }
      applications_stage_counts: {
        Args: { p_position?: string; p_search?: string }
        Returns: {
          count: number
          pipeline_stage: Database["public"]["Enums"]["pipeline_stage"]
        }[]
      }
      complete_academy_reading: {
        Args: { p_enrollment_id: string; p_lesson_id: string }
        Returns: undefined
      }
      enroll_in_academy_program: {
        Args: {
          p_answers?: Json
          p_consent_text?: string
          p_consent_version?: string
          p_program_slug: string
        }
        Returns: string
      }
      grade_academy_quiz: {
        Args: { p_answers: Json; p_enrollment_id: string; p_lesson_id: string }
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
      validate_referral_code: { Args: { p_code: string }; Returns: boolean }
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
      job_order_status: ["open", "closed", "filled", "cancelled"],
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
// Convenience aliases — hand-added (not regenerated).
// Re-add these if generate_typescript_types overwrites this file.
// =========================================================================
export type PipelineStage = Database["public"]["Enums"]["pipeline_stage"]
export type DocType = Database["public"]["Enums"]["doc_type"]
export type FormFieldType = Database["public"]["Enums"]["form_field_type"]
export type JobOrderStatus = Database["public"]["Enums"]["job_order_status"]
export type UserRole = Database["public"]["Enums"]["user_role"]
export type ApplicationFieldImportance = Database["public"]["Enums"]["application_field_importance"]
export type ApplicationFieldSection = Database["public"]["Enums"]["application_field_section"]

// Akademi Perantau (migration 0060). Regenerate via generate_typescript_types
// after the migration is applied to prod to confirm parity.
export type AcademyProgram = Database["public"]["Tables"]["academy_programs"]["Row"]
export type AcademyModule = Database["public"]["Tables"]["academy_modules"]["Row"]
export type AcademyLesson = Database["public"]["Tables"]["academy_lessons"]["Row"]
export type AcademyEnrollment = Database["public"]["Tables"]["academy_enrollments"]["Row"]
export type AcademyLessonProgress = Database["public"]["Tables"]["academy_lesson_progress"]["Row"]
export type ProgramRegistrationField = Database["public"]["Tables"]["program_registration_fields"]["Row"]
export type AcademyDeliveryMode = "in_app" | "webinar" | "offline" | "external"
export type AcademyCategory = "paspor" | "masterclass" | "sertifikasi" | "vokasi"
export type AcademyOutputType = "certificate" | "psikotes_result" | "completion" | "none"
export type AcademyEnrollmentStatus =
  | "registered"
  | "in_progress"
  | "completed"
  | "passed"
  | "failed"
  | "cancelled"

// Affiliate / referral system (migration 0067). Regenerate via
// generate_typescript_types after the migration is applied to prod.
export type AffiliateAgent = Database["public"]["Tables"]["affiliate_agents"]["Row"]
export type ReferralCode = Database["public"]["Tables"]["referral_codes"]["Row"]
export type AffiliateCommissionEvent =
  Database["public"]["Tables"]["affiliate_commission_events"]["Row"]
export type AffiliateAgentStatus = "active" | "inactive" | "suspended"
export type ReferralCodeStatus = "active" | "inactive"
export type CommissionEventType = "registration" | "departure"
export type CommissionEventStatus = "pending" | "approved" | "paid" | "void"

// CV grader (migration 0071).
export type CvAssessmentRow = Database["public"]["Tables"]["cv_assessments"]["Row"]
export type ApplicationCvFitRow = Database["public"]["Tables"]["application_cv_fit"]["Row"]
