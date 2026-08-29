-- NutriOS Edição 9 — RLS baseline for Supabase Data API.
-- Apply only after the Prisma schema migration has created these tables.
-- Server-side Prisma writes remain authorization-checked in the application layer.

alter table public."Tenant" enable row level security;
alter table public."Professional" enable row level security;
alter table public."Patient" enable row level security;
alter table public."Consultation" enable row level security;
alter table public."ClinicalMealPlan" enable row level security;
alter table public."ClinicalMealPlanVersion" enable row level security;
alter table public."ClinicalRecordVersion" enable row level security;
alter table public."AuditLog" enable row level security;

revoke all on table public."Tenant" from anon;
revoke all on table public."Professional" from anon;
revoke all on table public."Patient" from anon;
revoke all on table public."Consultation" from anon;
revoke all on table public."ClinicalMealPlan" from anon;
revoke all on table public."ClinicalMealPlanVersion" from anon;
revoke all on table public."ClinicalRecordVersion" from anon;
revoke all on table public."AuditLog" from anon;

grant select on table public."Tenant" to authenticated;
grant select on table public."Professional" to authenticated;
grant select on table public."Patient" to authenticated;
grant select on table public."Consultation" to authenticated;
grant select on table public."ClinicalMealPlan" to authenticated;
grant select on table public."ClinicalMealPlanVersion" to authenticated;
grant select on table public."ClinicalRecordVersion" to authenticated;
grant select on table public."AuditLog" to authenticated;

create policy "professional_select_self"
on public."Professional"
for select to authenticated
using ("authUserId" = (select auth.uid())::text);

create policy "tenant_select_member"
on public."Tenant"
for select to authenticated
using (
  exists (
    select 1 from public."Professional" p
    where p."tenantId" = "Tenant".id
      and p."authUserId" = (select auth.uid())::text
  )
);

create policy "patient_select_tenant"
on public."Patient"
for select to authenticated
using (
  exists (
    select 1 from public."Professional" p
    where p."tenantId" = "Patient"."tenantId"
      and p."authUserId" = (select auth.uid())::text
  )
);

create policy "consultation_select_tenant"
on public."Consultation"
for select to authenticated
using (
  exists (
    select 1 from public."Professional" p
    where p."tenantId" = "Consultation"."tenantId"
      and p."authUserId" = (select auth.uid())::text
  )
);

create policy "meal_plan_select_tenant"
on public."ClinicalMealPlan"
for select to authenticated
using (
  exists (
    select 1 from public."Professional" p
    where p."tenantId" = "ClinicalMealPlan"."tenantId"
      and p."authUserId" = (select auth.uid())::text
  )
);

create policy "meal_plan_version_select_tenant"
on public."ClinicalMealPlanVersion"
for select to authenticated
using (
  exists (
    select 1
    from public."ClinicalMealPlan" plan
    join public."Professional" p on p."tenantId" = plan."tenantId"
    where plan.id = "ClinicalMealPlanVersion"."planId"
      and p."authUserId" = (select auth.uid())::text
  )
);

create policy "clinical_record_select_tenant"
on public."ClinicalRecordVersion"
for select to authenticated
using (
  exists (
    select 1 from public."Professional" p
    where p."tenantId" = "ClinicalRecordVersion"."tenantId"
      and p."authUserId" = (select auth.uid())::text
  )
);

create policy "audit_select_tenant"
on public."AuditLog"
for select to authenticated
using (
  exists (
    select 1 from public."Professional" p
    where p."tenantId" = "AuditLog"."tenantId"
      and p."authUserId" = (select auth.uid())::text
  )
);

-- No INSERT/UPDATE/DELETE grants are exposed to authenticated in this baseline.
-- Mutations go through authenticated server actions + Prisma authorization checks.
