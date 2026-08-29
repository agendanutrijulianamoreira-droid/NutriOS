"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { persistApprovedClinicalPlan } from "@/modules/meal-plan/infrastructure/prisma-clinical-plan-repository";

export interface ApproveClinicalPlanActionInput {
  patientId: string;
  consultationId: string;
  protocolId?: string;
  protocolPhaseId?: string;
  criteria: Prisma.InputJsonValue;
  weeklySnapshot: Prisma.InputJsonValue;
  shoppingList: Prisma.InputJsonValue;
  goals: string[];
  orientations: string[];
  costEstimate?: number;
  varietyScore?: number;
  changeNote?: string;
}

export async function approveClinicalPlanAction(input: ApproveClinicalPlanActionInput) {
  if (!input.patientId || !input.consultationId) throw new Error("INVALID_PLAN_CONTEXT");
  const result = await persistApprovedClinicalPlan(input);
  revalidatePath("/meal-plan");
  revalidatePath("/weekly-plan");
  revalidatePath("/advanced-weekly-plan");
  return result;
}
