-- Fix Dilim-C / Q3 GUC drift: policies used app.current_business_id
-- while runtime (lib/security/tenant-db-context.ts) sets app.business_id.
-- Additive: drop + recreate asistan_app policies only.

do $$
begin
  if to_regclass('public."AppointmentDeposit"') is not null then
    drop policy if exists appointment_deposit_prisma_guc on "AppointmentDeposit";
    if exists (select 1 from pg_roles where rolname = 'asistan_app') then
      create policy appointment_deposit_prisma_guc on "AppointmentDeposit"
        for all
        to asistan_app
        using (
          nullif(current_setting('app.business_id', true), '') is not null
          and "businessId" = current_setting('app.business_id', true)
        )
        with check (
          nullif(current_setting('app.business_id', true), '') is not null
          and "businessId" = current_setting('app.business_id', true)
        );
    end if;
  end if;

  if to_regclass('public."ClinicInvoice"') is not null then
    drop policy if exists clinic_invoice_prisma_guc on "ClinicInvoice";
    if exists (select 1 from pg_roles where rolname = 'asistan_app') then
      create policy clinic_invoice_prisma_guc on "ClinicInvoice"
        for all
        to asistan_app
        using (
          nullif(current_setting('app.business_id', true), '') is not null
          and "businessId" = current_setting('app.business_id', true)
        )
        with check (
          nullif(current_setting('app.business_id', true), '') is not null
          and "businessId" = current_setting('app.business_id', true)
        );
    end if;
  end if;

  if to_regclass('public."FrontDeskSession"') is not null then
    drop policy if exists front_desk_session_prisma_guc on "FrontDeskSession";
    if exists (select 1 from pg_roles where rolname = 'asistan_app') then
      create policy front_desk_session_prisma_guc on "FrontDeskSession"
        for all
        to asistan_app
        using (
          nullif(current_setting('app.business_id', true), '') is not null
          and "businessId" = current_setting('app.business_id', true)
        )
        with check (
          nullif(current_setting('app.business_id', true), '') is not null
          and "businessId" = current_setting('app.business_id', true)
        );
    end if;
  end if;
exception
  when undefined_object then null;
  when insufficient_privilege then null;
end $$;
