import { evaluateFood, type CandidateFood, type EngineFood, type FoodRole, type MealCandidate, type MealTemplate, type PatientCriteria } from "./engine";

export interface ActiveProtocolPhase {
  protocolId: string;
  protocolName: string;
  phaseId: string;
  phaseName: string;
  excludedFoodIds: string[];
  excludedTags: string[];
  prioritizedTags: string[];
  requiredTags: string[];
}

export interface PortionBounds {
  min: number;
  max: number;
  step: number;
}

export interface OptimizerSettings {
  tolerance: number;
  maxIterations: number;
  weights: { kcal: number; protein: number; carbohydrate: number; fat: number };
  portionPenalty: number;
}

export interface OptimizedPlan {
  meals: MealCandidate[];
  objective: number;
  iterations: number;
  status: "VALIDATED" | "REVIEW";
  checks: Array<{ key: string; label: string; actual: number; target: number; deviation: number; ok: boolean }>;
  trace: string[];
}

export interface SubstitutionOption {
  sourceFoodId: string;
  substituteFood: EngineFood;
  sourceGrams: number;
  substituteGrams: number;
  kcalDelta: number;
  proteinDelta: number;
  score: number;
  reason: string;
}

export interface MealVariant {
  id: string;
  meal: MealCandidate;
  rank: number;
  explanation: string;
}

const round = (v: number) => Math.round(v * 10) / 10;

const boundsByRole: Record<FoodRole, PortionBounds> = {
  protein: { min: 40, max: 240, step: 5 },
  carbohydrate: { min: 15, max: 220, step: 5 },
  fruit: { min: 60, max: 250, step: 10 },
  vegetable: { min: 60, max: 350, step: 10 },
  legume: { min: 40, max: 180, step: 5 },
  fat: { min: 3, max: 30, step: 1 },
  dairy: { min: 80, max: 300, step: 10 },
  beverage: { min: 100, max: 500, step: 25 },
};

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
  const totals = meal.items.reduce((a, item) => ({
    kcal: round(a.kcal + item.kcal), protein: round(a.protein + item.protein),
    carbohydrate: round(a.carbohydrate + item.carbohydrate), fat: round(a.fat + item.fat), fiber: round(a.fiber + item.fiber),
  }), { kcal: 0, protein: 0, carbohydrate: 0, fat: 0, fiber: 0 });
  return { ...meal, totals };
}

function totals(meals: MealCandidate[]) {
  return meals.reduce((a, meal) => ({
    kcal: round(a.kcal + meal.totals.kcal), protein: round(a.protein + meal.totals.protein),
    carbohydrate: round(a.carbohydrate + meal.totals.carbohydrate), fat: round(a.fat + meal.totals.fat), fiber: round(a.fiber + meal.totals.fiber),
  }), { kcal: 0, protein: 0, carbohydrate: 0, fat: 0, fiber: 0 });
}

function protocolAllows(food: EngineFood, phase?: ActiveProtocolPhase) {
  if (!phase) return true;
  if (phase.excludedFoodIds.includes(food.id)) return false;
  return !food.tags.some(tag => phase.excludedTags.includes(tag));
}

function protocolBonus(food: EngineFood, phase?: ActiveProtocolPhase) {
  if (!phase) return 0;
  return food.tags.reduce((sum, tag) => sum + (phase.prioritizedTags.includes(tag) ? 8 : 0), 0);
}

function objective(meals: MealCandidate[], criteria: PatientCriteria, initial: Map<string, number>, settings: OptimizerSettings) {
  const t = totals(meals);
  const rel = (actual: number, target: number) => target > 0 ? (actual - target) / target : 0;
  let score = Math.abs(rel(t.kcal, criteria.calories)) * settings.weights.kcal
    + Math.abs(rel(t.protein, criteria.protein)) * settings.weights.protein
    + Math.abs(rel(t.carbohydrate, criteria.carbohydrate)) * settings.weights.carbohydrate
    + Math.abs(rel(t.fat, criteria.fat)) * settings.weights.fat;
  for (const meal of meals) for (const item of meal.items) {
    const start = initial.get(`${meal.templateId}:${item.food.id}`) ?? item.grams;
    score += Math.abs(item.grams - start) / Math.max(start, 1) * settings.portionPenalty;
  }
  return score;
}

function replaceGrams(meals: MealCandidate[], mealIndex: number, itemIndex: number, grams: number) {
  return meals.map((meal, mi) => {
    if (mi !== mealIndex) return meal;
    const items = meal.items.map((item, ii) => {
      if (ii !== itemIndex) return item;
      return { ...item, grams, ...nutrition(item.food, grams) };
    });
    return recalcMeal({ ...meal, items });
  });
}

export const DEFAULT_OPTIMIZER_SETTINGS: OptimizerSettings = {
  tolerance: 0.1,
  maxIterations: 180,
  weights: { kcal: 1.2, protein: 1.5, carbohydrate: 1, fat: 1 },
  portionPenalty: 0.025,
};

export function optimizePortions(baseMeals: MealCandidate[], criteria: PatientCriteria, settings = DEFAULT_OPTIMIZER_SETTINGS): OptimizedPlan {
  let current = baseMeals.map(meal => ({ ...meal, items: meal.items.map(item => ({ ...item })) }));
  const initial = new Map<string, number>();
  current.forEach(meal => meal.items.forEach(item => initial.set(`${meal.templateId}:${item.food.id}`, item.grams)));
  let currentObjective = objective(current, criteria, initial, settings);
  let iterations = 0;
  const trace: string[] = [];

  for (; iterations < settings.maxIterations; iterations++) {
    let best = current;
    let bestObjective = currentObjective;
    let bestChange = "";
    current.forEach((meal, mi) => meal.items.forEach((item, ii) => {
      const b = boundsByRole[item.food.role];
      for (const delta of [-b.step, b.step]) {
        const nextGrams = Math.max(b.min, Math.min(b.max, item.grams + delta));
        if (nextGrams === item.grams) continue;
        const candidate = replaceGrams(current, mi, ii, nextGrams);
        const candidateObjective = objective(candidate, criteria, initial, settings);
        if (candidateObjective + 0.00001 < bestObjective) {
          best = candidate; bestObjective = candidateObjective;
          bestChange = `${item.food.name}: ${item.grams} g → ${nextGrams} g`;
        }
      }
    }));
    if (bestObjective >= currentObjective - 0.00001) break;
    current = best; currentObjective = bestObjective;
    if (trace.length < 12 && bestChange) trace.push(bestChange);
  }

  const t = totals(current);
  const defs = [
    ["kcal", "Calorias", t.kcal, criteria.calories], ["protein", "Proteína", t.protein, criteria.protein],
    ["carbohydrate", "Carboidrato", t.carbohydrate, criteria.carbohydrate], ["fat", "Gordura", t.fat, criteria.fat],
  ] as const;
  const checks = defs.map(([key, label, actual, target]) => {
    const deviation = target > 0 ? (actual - target) / target : 0;
    return { key, label, actual, target, deviation: round(deviation * 100), ok: Math.abs(deviation) <= settings.tolerance };
  });
  return { meals: current, objective: round(currentObjective), iterations, status: checks.every(c => c.ok) ? "VALIDATED" : "REVIEW", checks, trace };
}

export function rankedFoodsForRole(foodRole: FoodRole, foods: EngineFood[], criteria: PatientCriteria, phase?: ActiveProtocolPhase) {
  return foods.filter(food => food.role === foodRole && protocolAllows(food, phase))
    .map(food => ({ food, evaluation: evaluateFood(food, { ...criteria, excludedTags: [...criteria.excludedTags, ...(phase?.excludedTags ?? [])] }), bonus: protocolBonus(food, phase) }))
    .filter(x => x.evaluation.eligible)
    .sort((a, b) => (b.evaluation.score + b.bonus) - (a.evaluation.score + a.bonus));
}

export function buildMealVariants(template: MealTemplate, foods: EngineFood[], criteria: PatientCriteria, phase?: ActiveProtocolPhase, count = 3): MealVariant[] {
  const variants: MealVariant[] = [];
  for (let rank = 0; rank < count; rank++) {
    const items: CandidateFood[] = [];
    const warnings: string[] = [];
    for (const slot of template.slots) {
      const ranked = rankedFoodsForRole(slot.role, foods, criteria, phase);
      const picked = ranked[rank % Math.max(ranked.length, 1)];
      if (!picked) { if (slot.required) warnings.push(`Sem opção elegível para ${slot.label}`); continue; }
      const n = nutrition(picked.food, slot.targetGrams);
      items.push({ food: picked.food, grams: slot.targetGrams, ...n, score: Math.min(100, picked.evaluation.score + picked.bonus), reasons: [...picked.evaluation.reasons, ...(picked.bonus ? [`✓ Priorizado por ${phase?.phaseName}`] : [])] });
    }
    const meal = recalcMeal({ templateId: template.id, templateName: template.name, items, totals: { kcal: 0, protein: 0, carbohydrate: 0, fat: 0, fiber: 0 }, score: items.length ? round(items.reduce((s, i) => s + i.score, 0) / items.length) : 0, valid: warnings.length === 0, warnings });
    variants.push({ id: `${template.id}-v${rank + 1}`, meal, rank: rank + 1, explanation: rank === 0 ? "Melhor aderência global" : `Alternativa ${rank + 1} preservando regras clínicas` });
  }
  return variants;
}

export function findSubstitutions(item: CandidateFood, foods: EngineFood[], criteria: PatientCriteria, phase?: ActiveProtocolPhase, limit = 4): SubstitutionOption[] {
  const sourceKcal = item.kcal;
  return rankedFoodsForRole(item.food.role, foods, criteria, phase)
    .filter(x => x.food.id !== item.food.id)
    .map(x => {
      const grams = Math.max(1, Math.round((sourceKcal / Math.max(x.food.kcalPer100, 1)) * 100 / 5) * 5);
      const n = nutrition(x.food, grams);
      return { sourceFoodId: item.food.id, substituteFood: x.food, sourceGrams: item.grams, substituteGrams: grams, kcalDelta: round(n.kcal - item.kcal), proteinDelta: round(n.protein - item.protein), score: Math.min(100, x.evaluation.score + x.bonus), reason: `Equivalência energética aproximada; mesma função: ${item.food.role}` };
    }).sort((a, b) => Math.abs(a.kcalDelta) - Math.abs(b.kcalDelta) || b.score - a.score).slice(0, limit);
}
