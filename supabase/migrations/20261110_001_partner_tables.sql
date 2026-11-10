-- 1. Category master
CREATE TABLE IF NOT EXISTS category_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Partner clients (hotel clients managed by superadmin, NOT the client_credentials table)
CREATE TABLE IF NOT EXISTS partner_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  outreach_mode TEXT NOT NULL DEFAULT 'approve_once' CHECK (outreach_mode IN ('approve_once', 'standing_authorisation', 'client_sends_each_wave')),
  authorisation_doc_url TEXT,
  assessment_deadline DATE,
  reminder_max_count INT NOT NULL DEFAULT 6,
  reminder_window_days INT NOT NULL DEFAULT 28,
  reminder_min_gap_hours INT NOT NULL DEFAULT 48,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Partner suppliers (supplier directory)
CREATE TABLE IF NOT EXISTS partner_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_name TEXT NOT NULL,
  brand_name TEXT,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  state TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  raw_import_data JSONB,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'bulk_upload')),
  is_out_of_scope BOOLEAN NOT NULL DEFAULT FALSE,
  deactivation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Supplier categories (many-to-many)
CREATE TABLE IF NOT EXISTS partner_supplier_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES partner_suppliers(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES category_master(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(supplier_id, category_id)
);

-- 5. Client-supplier links
CREATE TABLE IF NOT EXISTS partner_client_supplier_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES partner_clients(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES partner_suppliers(id) ON DELETE CASCADE,
  assessment_status TEXT NOT NULL DEFAULT 'not_started' CHECK (assessment_status IN ('not_started','invited','registered','in_progress','submitted','processing','action_required','under_verification','verification_complete','scoring_in_progress','awaiting_approval','completed','published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, supplier_id)
);

-- 6. Partner invitations
CREATE TABLE IF NOT EXISTS partner_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  supplier_id UUID REFERENCES partner_suppliers(id) ON DELETE SET NULL,
  client_id UUID REFERENCES partner_clients(id) ON DELETE SET NULL,
  enterprise_name TEXT NOT NULL,
  brand_name TEXT,
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  phone TEXT,
  state TEXT,
  category TEXT,
  personal_note TEXT,
  validity_days INT NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','delivered','accepted','registration_completed','expired','declined','bounced')),
  invitation_url TEXT,
  created_by TEXT,
  sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  provider_message_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Partner form responses
CREATE TABLE IF NOT EXISTS partner_form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES partner_invitations(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  version INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Partner documents
CREATE TABLE IF NOT EXISTS partner_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES partner_invitations(id) ON DELETE CASCADE,
  question_ref TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  storage_bucket TEXT NOT NULL DEFAULT 'partner-documents',
  file_hash TEXT,
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded','flagged','verified','rejected','expired','missing_info','awaiting_verification','approved','re_upload_requested')),
  reviewer_id TEXT,
  review_notes TEXT,
  expiry_date DATE,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Invitation messages
CREATE TABLE IF NOT EXISTS invitation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES partner_invitations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('outbound','inbound')),
  subject TEXT,
  html_body TEXT,
  plain_body TEXT,
  sent_at TIMESTAMPTZ,
  provider_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','delivered','bounced','clicked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Assessment pipeline
CREATE TABLE IF NOT EXISTS assessment_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES partner_suppliers(id) ON DELETE SET NULL,
  client_id UUID REFERENCES partner_clients(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','invited','registered','in_progress','submitted','processing','action_required','under_verification','verification_complete','scoring_in_progress','awaiting_approval','completed','published')),
  assigned_to TEXT,
  days_in_status INT NOT NULL DEFAULT 0,
  total_days INT NOT NULL DEFAULT 0,
  manual_override_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Score versions
CREATE TABLE IF NOT EXISTS score_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES partner_suppliers(id) ON DELETE SET NULL,
  client_id UUID REFERENCES partner_clients(id) ON DELETE SET NULL,
  version INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','provisional','final')),
  scores JSONB NOT NULL DEFAULT '{}',
  reviewer_id TEXT,
  sign_off_reason TEXT,
  signed_off_at TIMESTAMPTZ,
  improvement_areas TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Review queue flags
CREATE TABLE IF NOT EXISTS review_queue_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  source_ref TEXT,
  source_id UUID,
  description TEXT,
  client_id UUID REFERENCES partner_clients(id) ON DELETE SET NULL,
  assigned_reviewer_id TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','accepted','corrected','escalated')),
  resolution_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 13. Partner certificate reviews
CREATE TABLE IF NOT EXISTS partner_certificate_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES partner_documents(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approved','rejected','re_upload_requested','flagged','clarification_requested')),
  reason TEXT,
  corrected_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  before_state JSONB,
  after_state JSONB,
  reason TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Admin users
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'assessment_team' CHECK (role IN ('varna_administrator','assessment_team','score_reviewer','project_lead','support')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Email templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  plain_body TEXT,
  version INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Notification settings
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_max_count INT NOT NULL DEFAULT 6,
  reminder_window_days INT NOT NULL DEFAULT 28,
  reminder_min_gap_hours INT NOT NULL DEFAULT 48,
  invitation_expiry_days INT NOT NULL DEFAULT 30,
  certificate_expiry_warning_days INT NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default notification settings
INSERT INTO notification_settings (reminder_max_count, reminder_window_days, reminder_min_gap_hours, invitation_expiry_days, certificate_expiry_warning_days)
VALUES (6, 28, 48, 30, 60)
ON CONFLICT DO NOTHING;

-- 18. In-app notifications
CREATE TABLE IF NOT EXISTS in_app_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  deep_link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. Mandatory document rules
CREATE TABLE IF NOT EXISTS mandatory_document_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT,
  document_type TEXT NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: Enable on all new tables
ALTER TABLE category_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_supplier_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_client_supplier_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_queue_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_certificate_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE in_app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandatory_document_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies: service role bypass only (no public access)
-- Using security definer functions for public invitation form access

-- Public read for invitations (by slug, via security definer RPC only)
-- No direct public policies; all access via service role (admin client)

-- Service role has full access via bypass RLS in createAdminClient()
-- Add explicit policy so anon/authenticated cannot read:
CREATE POLICY "No public access" ON category_master FOR ALL TO anon USING (false);
CREATE POLICY "No public access" ON partner_clients FOR ALL TO anon USING (false);
CREATE POLICY "No public access" ON partner_suppliers FOR ALL TO anon USING (false);
CREATE POLICY "No public access" ON partner_supplier_categories FOR ALL TO anon USING (false);
CREATE POLICY "No public access" ON partner_client_supplier_links FOR ALL TO anon USING (false);
CREATE POLICY "No public access" ON partner_invitations FOR ALL TO anon USING (false);
CREATE POLICY "No public access" ON partner_form_responses FOR ALL TO anon USING (false);
CREATE POLICY "No public access" ON partner_documents FOR ALL TO anon USING (false);
CREATE POLICY "No public access" ON invitation_messages FOR ALL TO anon USING (false);
CREATE POLICY "No public access" ON assessment_pipeline FOR ALL TO anon USING (false);
CREATE POLICY "No public access" ON score_versions FOR ALL TO anon USING (false);
CREATE POLICY "No public access" ON review_queue_flags FOR ALL TO anon USING (false);
CREATE POLICY "No public access" ON partner_certificate_reviews FOR ALL TO anon USING (false);
CREATE POLICY "No public access" ON audit_log FOR ALL TO anon USING (false);
CREATE POLICY "No public access" ON admin_users FOR ALL TO anon USING (false);
CREATE POLICY "No public access" ON email_templates FOR ALL TO anon USING (false);
CREATE POLICY "No public access" ON notification_settings FOR ALL TO anon USING (false);
CREATE POLICY "No public access" ON in_app_notifications FOR ALL TO anon USING (false);
CREATE POLICY "No public access" ON mandatory_document_rules FOR ALL TO anon USING (false);

-- Seed default categories
INSERT INTO category_master (name) VALUES
  ('Bathroom Amenities'),
  ('Spa & Wellness'),
  ('Disposables'),
  ('Textiles & Linen'),
  ('Food & Beverage'),
  ('Handicrafts & Decor'),
  ('Stationery'),
  ('Cleaning & Housekeeping'),
  ('Packaging'),
  ('Furniture & Furnishings')
ON CONFLICT (name) DO NOTHING;
