-- One way in for suppliers: uploaded lists and suppliers added by hand go
-- through the same review, then into the supplier tables when invited.
-- Only adds (two columns and rows); changes and removes nothing, so it is
-- safe to run before the code that uses it. Safe to run more than once.

BEGIN;

-- 1. A supplier added by hand is kept as its own small upload, marked manual.
ALTER TABLE public.list_uploads
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'file'
    CHECK (source IN ('file', 'manual'));

-- 2. Product category, carried to the invitation.
ALTER TABLE public.list_upload_suppliers
  ADD COLUMN IF NOT EXISTS category TEXT;

-- 3. Invitations made by hand before this change show on the hotel's page
--    (or No hotel), as invited. Invitations already linked are skipped.
WITH todo AS MATERIALIZED (
  SELECT i.*, gen_random_uuid() AS new_upload_id, gen_random_uuid() AS new_row_id
  FROM public.partner_invitations i
  WHERE NOT EXISTS (SELECT 1 FROM public.list_upload_suppliers s WHERE s.invitation_id = i.id)
),
new_uploads AS (
  INSERT INTO public.list_uploads (id, client_id, source, status, created_by, created_at, updated_at, finished_at)
  SELECT new_upload_id, client_id, 'manual', 'done', created_by, created_at, created_at, created_at
  FROM todo
  RETURNING id
)
INSERT INTO public.list_upload_suppliers (
  id, upload_id, position, company_name, brand_name, contact_name, email, phone, state, category,
  check_status, issues, extracted, decision, decided_by, decided_at,
  partner_supplier_id, invitation_id, created_at, updated_at
)
SELECT
  t.new_row_id, t.new_upload_id, 1, t.enterprise_name, t.brand_name, t.contact_person,
  lower(t.contact_email), t.phone, t.state, t.category,
  CASE WHEN t.contact_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN 'ready' ELSE 'missing_contact' END,
  '[]'::jsonb,
  jsonb_build_object(
    'manual', cells.typed,
    'evidence', jsonb_build_object('fileName', 'Added by hand', 'readFromImage', false, 'cells', cells.list)
  ),
  'approved', t.created_by, t.created_at,
  t.supplier_id, t.id, t.created_at, t.created_at
FROM todo t
CROSS JOIN LATERAL (
  SELECT
    COALESCE(jsonb_object_agg(f.label, f.value), '{}'::jsonb) AS typed,
    COALESCE(jsonb_agg(jsonb_build_object('cell', f.label, 'text', f.value) ORDER BY f.n), '[]'::jsonb) AS list
  FROM (VALUES
    (1, 'Company', t.enterprise_name), (2, 'Brand', t.brand_name), (3, 'Contact name', t.contact_person),
    (4, 'Email', t.contact_email), (5, 'Phone', t.phone), (6, 'State', t.state), (7, 'Category', t.category)
  ) AS f(n, label, value)
  WHERE f.value IS NOT NULL AND btrim(f.value) <> ''
) AS cells;

COMMIT;

NOTIFY pgrst, 'reload schema';
