-- =========================================================================
-- MIGRATION 0010: Supabase Storage bucket for candidate documents
-- =========================================================================
-- Creates the `candidate-documents` bucket + RLS policies.
-- Files are uploaded under path: <candidate_id>/<doc_type>/<filename>
-- Storage cost analysis (per SPEC.md §): ~3-5MB/candidate realistic
-- → 50,000 candidates ≈ 250GB ≈ $5/month. Affordable.
-- =========================================================================

-- Create bucket (private — public=false; access only via signed URLs or
-- direct authenticated access via RLS)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'candidate-documents',
  'candidate-documents',
  false,
  5242880,  -- 5MB cap per file
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/heic',
    'image/heif',
    'image/webp',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =========================================================================
-- Storage RLS — path convention: <candidate_id_uuid>/<doc_type>/<filename>
-- =========================================================================

-- Helper: extract candidate_id from path (first path segment)
-- Storage policies receive `name` (full path) — split first `/`.

-- INSERT: candidate can upload their own files
CREATE POLICY "docs_storage_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'candidate-documents'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM candidates WHERE auth_user_id = auth.uid()
    )
  );

-- SELECT: candidate sees own + admin sees all
CREATE POLICY "docs_storage_select_own_or_admin"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'candidate-documents'
    AND (
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM candidates WHERE auth_user_id = auth.uid()
      )
      OR is_admin()
    )
  );

-- UPDATE: only admin (e.g. for verification metadata; usually unused)
CREATE POLICY "docs_storage_update_admin"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'candidate-documents' AND is_admin());

-- DELETE: candidate can delete own (only if not yet verified) + admin always
CREATE POLICY "docs_storage_delete_own_unverified_or_admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'candidate-documents'
    AND (
      is_admin()
      OR (
        (storage.foldername(name))[1] IN (
          SELECT id::text FROM candidates WHERE auth_user_id = auth.uid()
        )
        AND NOT EXISTS (
          SELECT 1 FROM candidate_documents cd
          WHERE cd.file_path = name AND cd.verified = true
        )
      )
    )
  );

-- =========================================================================
-- Add rejected_reason to candidate_documents (per SPEC §3.6)
-- =========================================================================

ALTER TABLE candidate_documents
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rejected_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_docs_rejected ON candidate_documents (candidate_id) WHERE rejected_at IS NOT NULL;

-- =========================================================================
-- DONE — migration 0010
-- =========================================================================
