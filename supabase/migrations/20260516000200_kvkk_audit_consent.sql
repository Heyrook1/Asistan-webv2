-- ============================================================================
-- Migration: KVKK compliance — audit logs + consent tracking + soft-delete
-- Date: 2026-05-16
-- ============================================================================
-- KVKK (Türkiye Kişisel Verilerin Korunması Kanunu) requires:
--   * Açık rıza (explicit consent) tracked with timestamp + IP + version
--   * Audit trail of who accessed/modified personal data
--   * Right to deletion (soft-delete preferred, hard-delete on request)
--   * Data retention policy enforcement
-- ============================================================================

-- ----------------------------------------------------------------------------
-- USER_CONSENTS — record each consent action
-- ----------------------------------------------------------------------------
create table if not exists public.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  consent_type text not null check (consent_type in (
    'terms_of_service',
    'privacy_policy',
    'kvkk_explicit',
    'marketing_emails',
    'marketing_sms',
    'data_sharing_third_party',
    'health_data_processing'
  )),
  version text not null,
  granted boolean not null,
  ip_address inet null,
  user_agent text null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz null
);

create index if not exists user_consents_user_idx on public.user_consents(user_id);
create index if not exists user_consents_type_idx on public.user_consents(consent_type);

alter table public.user_consents enable row level security;

drop policy if exists user_consents_self on public.user_consents;
create policy user_consents_self on public.user_consents
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- ACTIVITY_LOGS — extend existing table with severity + table tracking
-- ----------------------------------------------------------------------------
alter table public.activity_logs
  add column if not exists severity text not null default 'info'
    check (severity in ('debug', 'info', 'warn', 'error', 'critical')),
  add column if not exists ip_address inet null,
  add column if not exists user_agent text null;

create index if not exists activity_logs_provider_created_idx
  on public.activity_logs(provider_id, created_at desc);
create index if not exists activity_logs_actor_idx
  on public.activity_logs(actor_id, created_at desc);

-- ----------------------------------------------------------------------------
-- Generic logger function (call from server actions)
-- ----------------------------------------------------------------------------
create or replace function public.log_activity(
  p_provider_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id uuid default null,
  p_details jsonb default null,
  p_severity text default 'info'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  log_id uuid;
begin
  insert into public.activity_logs (
    provider_id, actor_id, action, entity_type, entity_id, details, severity
  ) values (
    p_provider_id, auth.uid(), p_action, p_entity_type, p_entity_id, p_details, p_severity
  )
  returning id into log_id;
  return log_id;
end;
$$;

-- ----------------------------------------------------------------------------
-- Soft-delete columns on personal-data tables
-- ----------------------------------------------------------------------------
alter table public.customers     add column if not exists deleted_at timestamptz null;
alter table public.appointments  add column if not exists deleted_at timestamptz null;
alter table public.users         add column if not exists deleted_at timestamptz null;

create index if not exists customers_active_idx    on public.customers(id) where deleted_at is null;
create index if not exists appointments_active_idx on public.appointments(id) where deleted_at is null;

-- ----------------------------------------------------------------------------
-- Audit trigger: log every mutation on sensitive tables
-- ----------------------------------------------------------------------------
create or replace function public.audit_trigger_func()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_provider_id uuid;
  v_action text;
begin
  v_action := lower(tg_op);  -- insert / update / delete

  -- Resolve provider_id depending on table
  if tg_table_name = 'appointments' then
    v_provider_id := coalesce(new.provider_id, old.provider_id);
  elsif tg_table_name = 'services' then
    v_provider_id := coalesce(new.provider_id, old.provider_id);
  elsif tg_table_name = 'customers' then
    -- Pick first appointment's provider as best-effort
    select a.provider_id into v_provider_id
    from public.appointments a
    where a.customer_id = coalesce(new.id, old.id)
    limit 1;
  end if;

  if v_provider_id is null then
    return coalesce(new, old);
  end if;

  insert into public.activity_logs (provider_id, actor_id, action, entity_type, entity_id, details, severity)
  values (
    v_provider_id,
    auth.uid(),
    v_action || '_' || tg_table_name,
    tg_table_name,
    coalesce(new.id, old.id),
    jsonb_build_object(
      'old', case when tg_op = 'INSERT' then null else to_jsonb(old) end,
      'new', case when tg_op = 'DELETE' then null else to_jsonb(new) end
    ),
    case when tg_op = 'DELETE' then 'warn' else 'info' end
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_audit_appointments on public.appointments;
create trigger trg_audit_appointments
  after insert or update or delete on public.appointments
  for each row execute function public.audit_trigger_func();

drop trigger if exists trg_audit_customers on public.customers;
create trigger trg_audit_customers
  after insert or update or delete on public.customers
  for each row execute function public.audit_trigger_func();

drop trigger if exists trg_audit_services on public.services;
create trigger trg_audit_services
  after insert or update or delete on public.services
  for each row execute function public.audit_trigger_func();

-- ----------------------------------------------------------------------------
-- DATA_DELETION_REQUESTS — KVKK "right to be forgotten"
-- ----------------------------------------------------------------------------
create table if not exists public.data_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'in_review', 'completed', 'rejected')),
  reason text null,
  requested_at timestamptz not null default now(),
  processed_at timestamptz null,
  processed_by uuid null references public.users(id)
);

alter table public.data_deletion_requests enable row level security;

drop policy if exists ddr_self on public.data_deletion_requests;
create policy ddr_self on public.data_deletion_requests
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Admins can read all (for processing)
drop policy if exists ddr_admin_read on public.data_deletion_requests;
create policy ddr_admin_read on public.data_deletion_requests
  for select using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );
