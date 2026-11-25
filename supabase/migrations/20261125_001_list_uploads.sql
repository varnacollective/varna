-- Supplier list uploads: a superadmin uploads a hotel's supplier list, the AI
-- reads it, a person reviews each supplier, and approved suppliers are invited.
--
-- Adds new tables and one private storage bucket only. Changes no existing
-- table. Safe to run more than once.
--
-- Only the server (service role) can read or write these tables: row level
-- security is on with no policies, and the browser roles have no grants.

BEGIN;

-- 1. One upload: one or more files sent together for one hotel.
CREATE TABLE IF NOT EXISTS list_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES partner_clients(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'reading'
    CHECK (status IN ('reading', 'review', 'done', 'failed', 'cancelled')),
  created_by TEXT,
  model TEXT,
  vision_model TEXT,
  prompt_version TEXT,
  input_tokens INT NOT NULL DEFAULT 0,
  output_tokens INT NOT NULL DEFAULT 0,
  thinking_tokens INT NOT NULL DEFAULT 0,
  duration_ms INT,
  -- Parts of the files the AI could not read, for a person to check:
  -- [{ "file_id", "part": "sheet \"Vendors\" rows 51–100", "error" }]
  failed_parts JSONB NOT NULL DEFAULT '[]'::jsonb,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- 2. The files in an upload. The original file is kept in the private
-- "list-uploads" bucket so the result can always be traced back to it.
CREATE TABLE IF NOT EXISTS list_upload_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID NOT NULL REFERENCES list_uploads(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INT NOT NULL CHECK (size_bytes >= 0),
  sha256 TEXT NOT NULL,
  storage_path TEXT,
  page_count INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS list_upload_files_upload_idx ON list_upload_files (upload_id);

-- 3. Each supplier the AI found, and what the reviewer decided.
-- The columns hold the current values (after any edits by the reviewer);
-- "extracted" keeps the AI's original answer, with where each value came
-- from (file, sheet, cell or page, and the exact text), and never changes.
CREATE TABLE IF NOT EXISTS list_upload_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID NOT NULL REFERENCES list_uploads(id) ON DELETE CASCADE,
  file_id UUID REFERENCES list_upload_files(id) ON DELETE SET NULL,
  position INT NOT NULL,
  company_name TEXT,
  brand_name TEXT,
  contact_name TEXT,
  email TEXT,
  other_emails TEXT[] NOT NULL DEFAULT '{}',
  phone TEXT,
  other_phones TEXT[] NOT NULL DEFAULT '{}',
  city TEXT,
  state TEXT,
  check_status TEXT NOT NULL
    CHECK (check_status IN ('ready', 'needs_attention', 'missing_contact')),
  -- Flags for the reviewer: [{ "code": "no_contact_name", "message": "..." }]
  issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  extracted JSONB NOT NULL,
  decision TEXT NOT NULL DEFAULT 'pending'
    CHECK (decision IN ('pending', 'approved', 'rejected')),
  decided_by TEXT,
  decided_at TIMESTAMPTZ,
  duplicate_of UUID REFERENCES partner_suppliers(id) ON DELETE SET NULL,
  partner_supplier_id UUID REFERENCES partner_suppliers(id) ON DELETE SET NULL,
  invitation_id UUID REFERENCES partner_invitations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (upload_id, position)
);

-- 4. Every AI call made for an upload, with the full answer, kept so any
-- result can be explained later.
CREATE TABLE IF NOT EXISTS list_upload_ai_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID NOT NULL REFERENCES list_uploads(id) ON DELETE CASCADE,
  file_id UUID REFERENCES list_upload_files(id) ON DELETE SET NULL,
  part TEXT NOT NULL,
  task TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  model TEXT NOT NULL,
  attempt INT NOT NULL CHECK (attempt >= 1),
  response JSONB,
  problems JSONB NOT NULL DEFAULT '[]'::jsonb,
  input_tokens INT NOT NULL DEFAULT 0,
  output_tokens INT NOT NULL DEFAULT 0,
  thinking_tokens INT NOT NULL DEFAULT 0,
  duration_ms INT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS list_upload_ai_calls_upload_idx ON list_upload_ai_calls (upload_id);

-- Server only.
ALTER TABLE list_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_upload_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_upload_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_upload_ai_calls ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON list_uploads, list_upload_files, list_upload_suppliers, list_upload_ai_calls
  FROM anon, authenticated;

-- Private bucket for the original files (20 MB each).
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('list-uploads', 'list-uploads', FALSE, 20971520)
ON CONFLICT (id) DO NOTHING;

COMMIT;
