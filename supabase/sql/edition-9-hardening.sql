-- NutriOS Edição 9 — hardening complementar aplicado após os advisors do Supabase.
-- Objetivos:
-- 1) garantir RLS em todas as tabelas clínicas expostas no schema public;
-- 2) manter tabelas internas sem acesso pela Data API até existirem policies explícitas;
-- 3) cobrir FKs relevantes com índices para evitar scans desnecessários.

alter table public."TranscriptSegment" enable row level security;
alter table public."ClinicalSuggestion" enable row level security;
alter table public."Food" enable row level security;
alter table public."FoodSource" enable row level security;
alter table public."HouseholdMeasure" enable row level security;
alter table public."Recipe" enable row level security;
alter table public."RecipeIngredient" enable row level security;
alter table public."Protocol" enable row level security;
alter table public."ProtocolVersion" enable row level security;
alter table public."ProtocolPhase" enable row level security;
alter table public."ProtocolRule" enable row level security;
alter table public."ProtocolFoodPolicy" enable row level security;
alter table public."ProtocolRecipePolicy" enable row level security;
alter table public."ProtocolAISuggestion" enable row level security;

revoke all on table
  public."TranscriptSegment",
  public."ClinicalSuggestion",
  public."Food",
  public."FoodSource",
  public."HouseholdMeasure",
  public."Recipe",
  public."RecipeIngredient",
  public."Protocol",
  public."ProtocolVersion",
  public."ProtocolPhase",
  public."ProtocolRule",
  public."ProtocolFoodPolicy",
  public."ProtocolRecipePolicy",
  public."ProtocolAISuggestion"
from anon, authenticated;

create index if not exists "ClinicalMealPlan_consultationId_idx" on public."ClinicalMealPlan"("consultationId");
create index if not exists "ClinicalMealPlan_patientId_idx" on public."ClinicalMealPlan"("patientId");
create index if not exists "ClinicalMealPlan_protocolId_idx" on public."ClinicalMealPlan"("protocolId");
create index if not exists "ClinicalRecordVersion_sourcePlanVersionId_idx" on public."ClinicalRecordVersion"("sourcePlanVersionId");
create index if not exists "ClinicalSuggestion_consultationId_idx" on public."ClinicalSuggestion"("consultationId");
create index if not exists "Consultation_patientId_idx" on public."Consultation"("patientId");
create index if not exists "Consultation_professionalId_idx" on public."Consultation"("professionalId");
create index if not exists "ProtocolFoodPolicy_foodId_idx" on public."ProtocolFoodPolicy"("foodId");
create index if not exists "ProtocolRecipePolicy_recipeId_idx" on public."ProtocolRecipePolicy"("recipeId");
create index if not exists "RecipeIngredient_foodId_idx" on public."RecipeIngredient"("foodId");
create index if not exists "TranscriptSegment_consultationId_idx" on public."TranscriptSegment"("consultationId");
