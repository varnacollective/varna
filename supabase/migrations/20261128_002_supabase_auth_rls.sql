-- Supabase Auth + row level security for the dashboard tables.
--
-- Users sign in with Supabase Auth. Each user's app_metadata (set only with
-- the service role) carries:
--   role         'superadmin' | 'client' | 'group'
--   client_id    'superadmin', 'CLT-001', 'GRP-001', ...
--   parent_group the group name (groups, and hotels that belong to one)
--
-- Rules:
--   • Hotel data (tables with client_id): a hotel sees its own rows, a group
--     sees its hotels' rows, a superadmin sees all. Only superadmins write.
--   • Supplier profile tables (no client_id): any signed-in Varna user reads,
--     only superadmins write.
--   • client_credentials: no access except the service role (kept as a
--     backup of the old logins; no longer used to sign in).
--   • The public (anon) key gets no access to any of these tables.
-- Server code that uses the service role is not affected (it bypasses RLS).

-- ── Helpers (private schema: not exposed through the API) ──────────────────

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.jwt_role() returns text
language sql stable set search_path = '' as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')
$$;

create or replace function private.jwt_client_id() returns text
language sql stable set search_path = '' as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'client_id', '')
$$;

create or replace function private.jwt_parent_group() returns text
language sql stable set search_path = '' as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'parent_group', '')
$$;

create or replace function private.is_superadmin() returns boolean
language sql stable set search_path = '' as $$
  select private.jwt_role() = 'superadmin'
$$;

create or replace function private.is_varna_user() returns boolean
language sql stable set search_path = '' as $$
  select private.jwt_role() in ('superadmin', 'client', 'group')
$$;

-- Security definer so it can read client_master without recursing into
-- client_master's own policy.
create or replace function private.can_see_client(target text) returns boolean
language sql stable security definer set search_path = '' as $$
  select case private.jwt_role()
    when 'superadmin' then true
    when 'client' then target = private.jwt_client_id()
    when 'group' then
      target = private.jwt_client_id()
      or (
        private.jwt_parent_group() <> ''
        and exists (
          select 1 from public.client_master cm
          where cm.client_id = target
            and cm.parent_group = private.jwt_parent_group()
        )
      )
    else false
  end
$$;

-- Group rows tagged with the group's name (tables that have parent_group).
create or replace function private.is_own_group(row_group text) returns boolean
language sql stable set search_path = '' as $$
  select private.jwt_role() = 'group'
    and private.jwt_parent_group() <> ''
    and row_group = private.jwt_parent_group()
$$;

revoke all on all functions in schema private from public;
grant execute on all functions in schema private to authenticated;

-- ── Turn RLS on and close the public key ───────────────────────────────────

do $$
declare
  t text;
  tables text[] := array[
    'client_credentials',
    'client_master', 'client_summary', 'order_register',
    'supplier_detail_by_client', 'category_spend_by_client',
    'enterprise_master', 'scores_summary', 'assessment_inputs',
    'product_catalogue', 'supplier_assessments', 'supplier_craft',
    'supplier_sdgs', 'supplier_social', 'supplier_sustainability',
    'confidence_scoring', 'confidence_summary'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('revoke truncate on public.%I from authenticated', t);
  end loop;
end $$;

-- client_credentials: service role only.
revoke all on public.client_credentials from authenticated;

-- ── Hotel data: read by client, write by superadmin ───────────────────────

do $$
declare
  t text;
  with_group text[] := array['client_master', 'client_summary', 'order_register', 'supplier_detail_by_client'];
  without_group text[] := array['category_spend_by_client'];
begin
  foreach t in array with_group loop
    execute format('drop policy if exists "Varna users read their clients" on public.%I', t);
    execute format(
      'create policy "Varna users read their clients" on public.%I for select to authenticated
         using (private.can_see_client(client_id) or private.is_own_group(parent_group))', t);
  end loop;

  foreach t in array without_group loop
    execute format('drop policy if exists "Varna users read their clients" on public.%I', t);
    execute format(
      'create policy "Varna users read their clients" on public.%I for select to authenticated
         using (private.can_see_client(client_id))', t);
  end loop;
end $$;

-- ── Supplier profile data: read by any Varna user ─────────────────────────

do $$
declare
  t text;
  tables text[] := array[
    'enterprise_master', 'scores_summary', 'assessment_inputs',
    'product_catalogue', 'supplier_assessments', 'supplier_craft',
    'supplier_sdgs', 'supplier_social', 'supplier_sustainability',
    'confidence_scoring', 'confidence_summary'
  ];
begin
  foreach t in array tables loop
    execute format('drop policy if exists "Varna users read suppliers" on public.%I', t);
    execute format(
      'create policy "Varna users read suppliers" on public.%I for select to authenticated
         using (private.is_varna_user())', t);
  end loop;
end $$;

-- ── Superadmins write (insert, update, delete) ────────────────────────────

do $$
declare
  t text;
  tables text[] := array[
    'client_master', 'client_summary', 'order_register',
    'supplier_detail_by_client', 'category_spend_by_client',
    'enterprise_master', 'scores_summary', 'assessment_inputs',
    'product_catalogue', 'supplier_assessments', 'supplier_craft',
    'supplier_sdgs', 'supplier_social', 'supplier_sustainability',
    'confidence_scoring', 'confidence_summary'
  ];
begin
  foreach t in array tables loop
    execute format('drop policy if exists "Superadmins insert" on public.%I', t);
    execute format('drop policy if exists "Superadmins update" on public.%I', t);
    execute format('drop policy if exists "Superadmins delete" on public.%I', t);
    execute format(
      'create policy "Superadmins insert" on public.%I for insert to authenticated
         with check (private.is_superadmin())', t);
    execute format(
      'create policy "Superadmins update" on public.%I for update to authenticated
         using (private.is_superadmin()) with check (private.is_superadmin())', t);
    execute format(
      'create policy "Superadmins delete" on public.%I for delete to authenticated
         using (private.is_superadmin())', t);
  end loop;
end $$;
