export type ConstraintKind = "hard" | "soft";
export type FoodRole = "protein" | "carbohydrate" | "fruit" | "vegetable" | "legume" | "fat" | "dairy" | "beverage";

export interface EngineFood {
  id: string;
  name: string;
  role: FoodRole;
  kcalPer100: number;
  proteinPer100: number;
  carbohydratePer100: number;
  fatPer100: number;
  fiberPer100?: number;
  prepMinutes: number;
  costLevel: 1 | 2 | 3;
  tags: string[];
  allergens?: string[];
}

export interface PatientCriteria {
  calories: number;
  protein: number;
  carbohydrate: number;
  fat: number;
  meals: number;
  preferredTags: string[];
  excludedTags: string[];
  allergens: string[];
  maxPrepMinutes: number;
  maxCostLevel: 1 | 2 | 3;
}

export interface EngineConstraint {
  id: string;
  kind: ConstraintKind;
  label: string;
  test: (food: EngineFood, criteria: PatientCriteria) => boolean;
  score?: number;
}

export interface MealTemplateSlot {
  id: string;
  role: FoodRole;
  label: string;
  targetGrams: number;
  required: boolean;
}

export interface MealTemplate {
  id: string;
  name: string;
  slots: MealTemplateSlot[];
}

export interface CandidateFood {
  food: EngineFood;
  grams: number;
  kcal: number;
  protein: number;
  carbohydrate: number;
  fat: number;
  fiber: number;
  score: number;
  reasons: string[];
}

export interface MealCandidate {
  templateId: string;
  templateName: string;
  items: CandidateFood[];
  totals: {
    kcal: number;
    protein: number;
    carbohydrate: number;
    fat: number;
    fiber: number;
  };
  score: number;
  valid: boolean;
  warnings: string[];
}

const round = (value: number) => Math.round(value * 10) / 10;

function nutrientsFor(food: EngineFood, grams: number) {
  const factor = grams / 100;
  return {
    kcal: round(food.kcalPer100 * factor),
    protein: round(food.proteinPer100 * factor),
    carbohydrate: round(food.carbohydratePer100 * factor),
    fat: round(food.fatPer100 * factor),
    fiber: round((food.fiberPer100 ?? 0) * factor),
  };
}

export const DEFAULT_CONSTRAINTS: EngineConstraint[] = [
  {
    id: "allergens",
    kind: "hard",
    label: "Sem alergênicos incompatíveis",
    test: (food, criteria) => !(food.allergens ?? []).some((allergen) => criteria.allergens.includes(allergen)),
  },
  {
    id: "excluded-tags",
    kind: "hard",
    label: "Compatível com exclusões do protocolo",
    test: (food, criteria) => !food.tags.some((tag) => criteria.excludedTags.includes(tag)),
  },
  {
    id: "prep-time",
    kind: "soft",
    label: "Tempo de preparo compatível",
    score: 18,
    test: (food, criteria) => food.prepMinutes <= criteria.maxPrepMinutes,
  },
  {
    id: "budget",
    kind: "soft",
    label: "Custo compatível",
    score: 14,
    test: (food, criteria) => food.costLevel <= criteria.maxCostLevel,
  },
  {
    id: "preference",
    kind: "soft",
    label: "Alinhado às preferências",
    score: 20,
    test: (food, criteria) => criteria.preferredTags.length === 0 || food.tags.some((tag) => criteria.preferredTags.includes(tag)),
  },
];

export function evaluateFood(
  food: EngineFood,
  criteria: PatientCriteria,
  constraints: EngineConstraint[] = DEFAULT_CONSTRAINTS,
) {
  const reasons: string[] = [];

  for (const constraint of constraints.filter((item) => item.kind === "hard")) {
    if (!constraint.test(food, criteria)) {
      return { eligible: false, score: 0, reasons: [`Bloqueado: ${constraint.label}`] };
    }
    reasons.push(`✓ ${constraint.label}`);
  }

  let score = 48;
  for (const constraint of constraints.filter((item) => item.kind === "soft")) {
    if (constraint.test(food, criteria)) {
      score += constraint.score ?? 0;
      reasons.push(`✓ ${constraint.label}`);
    } else {
      reasons.push(`~ ${constraint.label}`);
    }
  }

  return { eligible: true, score: Math.min(score, 100), reasons };
}

export function buildMealCandidate({
  template,
  foods,
  criteria,
}: {
  template: MealTemplate;
  foods: EngineFood[];
  criteria: PatientCriteria;
}): MealCandidate {
  const items: CandidateFood[] = [];
  const warnings: string[] = [];

  for (const slot of template.slots) {
    const ranked = foods
      .filter((food) => food.role === slot.role)
      .map((food) => ({ food, evaluation: evaluateFood(food, criteria) }))
      .filter((candidate) => candidate.evaluation.eligible)
      .sort((a, b) => b.evaluation.score - a.evaluation.score);

    const best = ranked[0];
    if (!best) {
      if (slot.required) warnings.push(`Nenhum alimento elegível para ${slot.label}.`);
      continue;
    }

    const nutrients = nutrientsFor(best.food, slot.targetGrams);
    items.push({
      food: best.food,
      grams: slot.targetGrams,
      ...nutrients,
      score: best.evaluation.score,
      reasons: best.evaluation.reasons,
    });
  }

  const totals = items.reduce(
    (acc, item) => ({
      kcal: round(acc.kcal + item.kcal),
      protein: round(acc.protein + item.protein),
      carbohydrate: round(acc.carbohydrate + item.carbohydrate),
      fat: round(acc.fat + item.fat),
      fiber: round(acc.fiber + item.fiber),
    }),
    { kcal: 0, protein: 0, carbohydrate: 0, fat: 0, fiber: 0 },
  );

  const requiredSlots = template.slots.filter((slot) => slot.required).length;
  const completeness = requiredSlots === 0 ? 1 : Math.min(items.length / requiredSlots, 1);
  const averageFoodScore = items.length ? items.reduce((sum, item) => sum + item.score, 0) / items.length : 0;
  const score = round(averageFoodScore * 0.8 + completeness * 20);

  if (totals.kcal === 0) warnings.push("Refeição sem energia calculada.");

  return {
    templateId: template.id,
    templateName: template.name,
    items,
    totals,
    score,
    valid: warnings.length === 0 && items.length >= requiredSlots,
    warnings,
  };
}

export function validateDailyTargets(
  meals: MealCandidate[],
  criteria: PatientCriteria,
  tolerance = 0.15,
) {
  const totals = meals.reduce(
    (acc, meal) => ({
      kcal: round(acc.kcal + meal.totals.kcal),
      protein: round(acc.protein + meal.totals.protein),
      carbohydrate: round(acc.carbohydrate + meal.totals.carbohydrate),
      fat: round(acc.fat + meal.totals.fat),
      fiber: round(acc.fiber + meal.totals.fiber),
    }),
    { kcal: 0, protein: 0, carbohydrate: 0, fat: 0, fiber: 0 },
  );

  const within = (actual: number, target: number) =>
    target <= 0 ? true : Math.abs(actual - target) / target <= tolerance;

  const checks = [
    { key: "kcal", label: "Calorias", actual: totals.kcal, target: criteria.calories },
    { key: "protein", label: "Proteína", actual: totals.protein, target: criteria.protein },
    { key: "carbohydrate", label: "Carboidrato", actual: totals.carbohydrate, target: criteria.carbohydrate },
    { key: "fat", label: "Gordura", actual: totals.fat, target: criteria.fat },
  ].map((item) => ({ ...item, ok: within(item.actual, item.target) }));

  return {
    valid: meals.every((meal) => meal.valid) && checks.every((check) => check.ok),
    totals,
    checks,
  };
}
