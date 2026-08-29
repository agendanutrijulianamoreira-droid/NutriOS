import type { CandidateFood, EngineFood, MealCandidate, PatientCriteria } from "@/modules/nutrition-engine/domain/engine";
import { findSubstitutions, optimizePortions, type ActiveProtocolPhase, type SubstitutionOption } from "@/modules/nutrition-engine/domain/optimizer";

export interface HouseholdMeasureOption {
  foodId: string;
  name: string;
  grams: number;
}

export interface RecipeIngredientInput {
  food: EngineFood;
  grams: number;
}

export interface CalculatedRecipe {
  id: string;
  name: string;
  yieldServings: number;
  ingredients: RecipeIngredientInput[];
  perServing: {
    grams: number;
    kcal: number;
    protein: number;
    carbohydrate: number;
    fat: number;
    fiber: number;
  };
}

export interface PlanCostLine {
  foodId: string;
  foodName: string;
  grams: number;
  estimatedCost: number;
}

export interface WeeklyVarietyResult {
  score: number;
  repeatedFoods: Array<{ foodId: string; foodName: string; occurrences: number }>;
  warning: string | null;
}

export interface ClinicalMealPlanVersion {
  id: string;
  version: number;
  status: "DRAFT" | "APPROVED" | "SUPERSEDED";
  patientId: string;
  consultationId?: string;
  protocolId?: string;
  protocolPhaseId?: string;
  criteria: PatientCriteria;
  meals: MealCandidate[];
  costEstimate: number;
  varietyScore: number;
  changeNote?: string;
  approvedAt?: string;
  createdAt: string;
}

const round = (value: number) => Math.round(value * 100) / 100;

function nutrition(food: EngineFood, grams: number) {
  const f = grams / 100;
  return {
    kcal: round(food.kcalPer100 * f),
    protein: round(food.proteinPer100 * f),
    carbohydrate: round(food.carbohydratePer100 * f),
    fat: round(food.fatPer100 * f),
    fiber: round((food.fiberPer100 ?? 0) * f),
  };
}

function recalcMeal(meal: MealCandidate): MealCandidate {
  const totals = meal.items.reduce(
    (acc, item) => ({
      kcal: round(acc.kcal + item.kcal),
      protein: round(acc.protein + item.protein),
      carbohydrate: round(acc.carbohydrate + item.carbohydrate),
      fat: round(acc.fat + item.fat),
      fiber: round(acc.fiber + item.fiber),
    }),
    { kcal: 0, protein: 0, carbohydrate: 0, fat: 0, fiber: 0 },
  );
  return { ...meal, totals };
}

export function formatHouseholdMeasure(grams: number, measures: HouseholdMeasureOption[]) {
  if (!measures.length) return `${round(grams)} g`;
  const ranked = measures
    .map((measure) => ({ measure, units: grams / measure.grams }))
    .sort((a, b) => Math.abs(a.units - Math.round(a.units * 2) / 2) - Math.abs(b.units - Math.round(b.units * 2) / 2));
  const best = ranked[0];
  const units = Math.max(0.25, Math.round(best.units * 4) / 4);
  const label = units === 1 ? best.measure.name : `${units} × ${best.measure.name}`;
  return `${label} (${round(grams)} g)`;
}

export function calculateRecipe(input: { id: string; name: string; yieldServings: number; ingredients: RecipeIngredientInput[] }): CalculatedRecipe {
  const totals = input.ingredients.reduce(
    (acc, ingredient) => {
      const n = nutrition(ingredient.food, ingredient.grams);
      return {
        grams: acc.grams + ingredient.grams,
        kcal: acc.kcal + n.kcal,
        protein: acc.protein + n.protein,
        carbohydrate: acc.carbohydrate + n.carbohydrate,
        fat: acc.fat + n.fat,
        fiber: acc.fiber + n.fiber,
      };
    },
    { grams: 0, kcal: 0, protein: 0, carbohydrate: 0, fat: 0, fiber: 0 },
  );
  const divisor = Math.max(input.yieldServings, 1);
  return {
    ...input,
    perServing: {
      grams: round(totals.grams / divisor),
      kcal: round(totals.kcal / divisor),
      protein: round(totals.protein / divisor),
      carbohydrate: round(totals.carbohydrate / divisor),
      fat: round(totals.fat / divisor),
      fiber: round(totals.fiber / divisor),
    },
  };
}

export function applySubstitutionAndReoptimize({
  meals,
  mealIndex,
  itemIndex,
  substitution,
  criteria,
}: {
  meals: MealCandidate[];
  mealIndex: number;
  itemIndex: number;
  substitution: SubstitutionOption;
  criteria: PatientCriteria;
}) {
  const nextMeals = meals.map((meal, mi) => {
    if (mi !== mealIndex) return meal;
    const items = meal.items.map((item, ii) => {
      if (ii !== itemIndex) return item;
      const n = nutrition(substitution.substituteFood, substitution.substituteGrams);
      const replacement: CandidateFood = {
        food: substitution.substituteFood,
        grams: substitution.substituteGrams,
        ...n,
        score: substitution.score,
        reasons: [substitution.reason, "✓ Substituição aplicada pelo profissional"],
      };
      return replacement;
    });
    return recalcMeal({ ...meal, items });
  });
  return optimizePortions(nextMeals, criteria);
}

export function estimatePlanCost(meals: MealCandidate[], pricePerKg: Record<string, number>) {
  const grouped = new Map<string, { food: EngineFood; grams: number }>();
  meals.forEach((meal) => meal.items.forEach((item) => {
    const current = grouped.get(item.food.id);
    grouped.set(item.food.id, { food: item.food, grams: (current?.grams ?? 0) + item.grams });
  }));
  const lines: PlanCostLine[] = [...grouped.values()].map(({ food, grams }) => ({
    foodId: food.id,
    foodName: food.name,
    grams: round(grams),
    estimatedCost: round((grams / 1000) * (pricePerKg[food.id] ?? fallbackPrice(food.costLevel))),
  }));
  return { lines, total: round(lines.reduce((sum, line) => sum + line.estimatedCost, 0)) };
}

function fallbackPrice(costLevel: 1 | 2 | 3) {
  if (costLevel === 1) return 12;
  if (costLevel === 2) return 26;
  return 48;
}

export function evaluateWeeklyVariety(days: MealCandidate[][]): WeeklyVarietyResult {
  const counts = new Map<string, { name: string; occurrences: number }>();
  days.flat().forEach((meal) => meal.items.forEach((item) => {
    const current = counts.get(item.food.id) ?? { name: item.food.name, occurrences: 0 };
    current.occurrences += 1;
    counts.set(item.food.id, current);
  }));
  const repeatedFoods = [...counts.entries()]
    .filter(([, item]) => item.occurrences >= 4)
    .map(([foodId, item]) => ({ foodId, foodName: item.name, occurrences: item.occurrences }))
    .sort((a, b) => b.occurrences - a.occurrences);
  const totalOccurrences = [...counts.values()].reduce((sum, item) => sum + item.occurrences, 0);
  const repetitionBurden = repeatedFoods.reduce((sum, item) => sum + Math.max(0, item.occurrences - 3), 0);
  const score = Math.max(0, Math.round(100 - (repetitionBurden / Math.max(totalOccurrences, 1)) * 180));
  return {
    score,
    repeatedFoods,
    warning: repeatedFoods.length ? "Há alimentos repetidos com alta frequência na semana; revisar variedade." : null,
  };
}

export function buildSevenDayPlan(baseMeals: MealCandidate[], foods: EngineFood[], criteria: PatientCriteria, phase?: ActiveProtocolPhase) {
  const days: MealCandidate[][] = [];
  for (let day = 0; day < 7; day += 1) {
    const rotated = baseMeals.map((meal, mealIndex) => {
      const items = meal.items.map((item, itemIndex) => {
        const substitutions = findSubstitutions(item, foods, criteria, phase, 5);
        if (day === 0 || substitutions.length === 0) return item;
        const pick = substitutions[(day + mealIndex + itemIndex) % substitutions.length];
        if (!pick || day % 3 === 0) return item;
        const n = nutrition(pick.substituteFood, pick.substituteGrams);
        return { ...item, food: pick.substituteFood, grams: pick.substituteGrams, ...n, score: pick.score, reasons: [pick.reason] };
      });
      return recalcMeal({ ...meal, items });
    });
    days.push(optimizePortions(rotated, criteria).meals);
  }
  return { days, variety: evaluateWeeklyVariety(days) };
}

export function approvePlan({
  previousVersions,
  patientId,
  consultationId,
  protocolId,
  protocolPhaseId,
  criteria,
  meals,
  costEstimate,
  varietyScore,
  changeNote,
}: {
  previousVersions: ClinicalMealPlanVersion[];
  patientId: string;
  consultationId?: string;
  protocolId?: string;
  protocolPhaseId?: string;
  criteria: PatientCriteria;
  meals: MealCandidate[];
  costEstimate: number;
  varietyScore: number;
  changeNote?: string;
}): ClinicalMealPlanVersion[] {
  const nextVersion = Math.max(0, ...previousVersions.map((version) => version.version)) + 1;
  const superseded = previousVersions.map((version) => version.status === "APPROVED" ? { ...version, status: "SUPERSEDED" as const } : version);
  const now = new Date().toISOString();
  return [
    ...superseded,
    {
      id: `plan-v${nextVersion}`,
      version: nextVersion,
      status: "APPROVED",
      patientId,
      consultationId,
      protocolId,
      protocolPhaseId,
      criteria,
      meals,
      costEstimate,
      varietyScore,
      changeNote,
      approvedAt: now,
      createdAt: now,
    },
  ];
}
