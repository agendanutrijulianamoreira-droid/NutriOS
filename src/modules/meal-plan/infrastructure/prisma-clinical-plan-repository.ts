import "server-only";

import { MealPlanStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSupabaseUser } from "@/lib/supabase/server";

export interface PersistApprovedClinicalPlanInput {
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

export interface PersistedPlanResult {
  planId: string;
  planVersionId: string;
  version: number;
  clinicalRecordVersion: number;
}

async function resolveProfessional() {
  const { user } = await requireSupabaseUser();
  const professional = await prisma.professional.findUnique({ where: { authUserId: user.id } });
  if (!professional) throw new Error("PROFESSIONAL_NOT_PROVISIONED");
  return { user, professional };
}

export async function persistApprovedClinicalPlan(
  input: PersistApprovedClinicalPlanInput,
): Promise<PersistedPlanResult> {
  const { user, professional } = await resolveProfessional();

  const [patient, consultation] = await Promise.all([
    prisma.patient.findFirst({ where: { id: input.patientId, tenantId: professional.tenantId }, select: { id: true } }),
    prisma.consultation.findFirst({
      where: {
        id: input.consultationId,
        tenantId: professional.tenantId,
        patientId: input.patientId,
      },
      select: { id: true },
    }),
  ]);

  if (!patient || !consultation) throw new Error("RESOURCE_NOT_FOUND_OR_FORBIDDEN");

  if (input.protocolId) {
    const protocol = await prisma.protocol.findFirst({
      where: { id: input.protocolId, tenantId: professional.tenantId },
      select: { id: true },
    });
    if (!protocol) throw new Error("PROTOCOL_NOT_FOUND_OR_FORBIDDEN");
  }

  return prisma.$transaction(async (tx) => {
    let plan = await tx.clinicalMealPlan.findFirst({
      where: {
        tenantId: professional.tenantId,
        patientId: input.patientId,
        consultationId: input.consultationId,
      },
    });

    if (!plan) {
      plan = await tx.clinicalMealPlan.create({
        data: {
          tenantId: professional.tenantId,
          patientId: input.patientId,
          consultationId: input.consultationId,
          protocolId: input.protocolId,
          protocolPhaseId: input.protocolPhaseId,
        },
      });
    }

    const nextVersion = plan.currentVersion + 1;

    await tx.clinicalMealPlanVersion.updateMany({
      where: { planId: plan.id, status: MealPlanStatus.APPROVED },
      data: { status: MealPlanStatus.SUPERSEDED },
    });

    const version = await tx.clinicalMealPlanVersion.create({
      data: {
        planId: plan.id,
        version: nextVersion,
        status: MealPlanStatus.APPROVED,
        criteria: input.criteria,
        weeklySnapshot: input.weeklySnapshot,
        shoppingList: input.shoppingList,
        goals: input.goals,
        orientations: input.orientations,
        costEstimate: input.costEstimate,
        varietyScore: input.varietyScore,
        changeNote: input.changeNote,
        approvedByProfessionalId: professional.id,
        approvedAt: new Date(),
      },
    });

    await tx.clinicalMealPlan.update({
      where: { id: plan.id },
      data: {
        currentVersion: nextVersion,
        protocolId: input.protocolId,
        protocolPhaseId: input.protocolPhaseId,
      },
    });

    const latestRecord = await tx.clinicalRecordVersion.findFirst({
      where: { consultationId: input.consultationId },
      orderBy: { version: "desc" },
      select: { version: true },
    });
    const clinicalRecordVersion = (latestRecord?.version ?? 0) + 1;

    await tx.clinicalRecordVersion.create({
      data: {
        tenantId: professional.tenantId,
        consultationId: input.consultationId,
        sourcePlanVersionId: version.id,
        version: clinicalRecordVersion,
        content: {
          type: "APPROVED_MEAL_PLAN_SNAPSHOT",
          planId: plan.id,
          planVersionId: version.id,
          planVersion: nextVersion,
          criteria: input.criteria,
          weeklySnapshot: input.weeklySnapshot,
          shoppingList: input.shoppingList,
          goals: input.goals,
          orientations: input.orientations,
          approvedAt: version.approvedAt?.toISOString(),
          approvedByProfessionalId: professional.id,
        },
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId: professional.tenantId,
        actorUserId: user.id,
        entityType: "ClinicalMealPlanVersion",
        entityId: version.id,
        action: "APPROVE",
        source: "NUTRIOS_WEB",
        after: {
          planId: plan.id,
          version: nextVersion,
          patientId: input.patientId,
          consultationId: input.consultationId,
          approvedByProfessionalId: professional.id,
        },
      },
    });

    return {
      planId: plan.id,
      planVersionId: version.id,
      version: nextVersion,
      clinicalRecordVersion,
    };
  });
}

export async function listPatientMealPlanVersions(patientId: string) {
  const { professional } = await resolveProfessional();
  return prisma.clinicalMealPlanVersion.findMany({
    where: {
      plan: { tenantId: professional.tenantId, patientId },
    },
    orderBy: [{ plan: { createdAt: "desc" } }, { version: "desc" }],
    include: {
      plan: { select: { id: true, patientId: true, consultationId: true, protocolId: true, protocolPhaseId: true } },
      approvedBy: { select: { id: true, name: true } },
    },
  });
}
