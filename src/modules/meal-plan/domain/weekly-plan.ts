import type { MealCandidate, PatientCriteria } from "@/modules/nutrition-engine/domain/engine";
import type { CalculatedRecipe, ClinicalMealPlanVersion } from "./clinical-plan";

export type Weekday = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

export interface MealMacroDistribution {
  mealTemplateId: string;
  label: string;
  caloriePct: number;
  proteinPct: number;
  carbohydratePct: number;
  fatPct: number;
}

export interface WeeklyRecipeItem {
  type: "recipe";
  recipe: CalculatedRecipe;
  servings: number;
}

export interface WeeklyMealItem {
  type: "meal";
  meal: MealCandidate;
}

export type WeeklyDayItem = WeeklyRecipeItem | WeeklyMealItem;

export interface WeeklyDayPlan {
  day: Weekday;
  label: string;
  items: WeeklyDayItem[];
}

export interface ShoppingListLine {
  key: string;
  name: string;
  category: string;
  grams: number;
  source: "food" | "recipe";
}

export interface WeeklyPlanSnapshot {
  id: string;
  generatedAt: string;
  criteria: PatientCriteria;
  macroDistribution: MealMacroDistribution[];
  days: WeeklyDayPlan[];
  shoppingList: ShoppingListLine[];
  goals: string[];
  orientations: string[];
  approvedPlanVersion?: ClinicalMealPlanVersion;
}

const round = (value: number) => Math.round(value * 10) / 10;

export const DEFAULT_MEAL_DISTRIBUTION: MealMacroDistribution[] = [
  { mealTemplateId: "breakfast", label: "Café da manhã", caloriePct: 20, proteinPct: 20, carbohydratePct: 25, fatPct: 20 },
  { mealTemplateId: "lunch", label: "Almoço", caloriePct: 35, proteinPct: 35, carbohydratePct: 35, fatPct: 35 },
  { mealTemplateId: "snack", label: "Lanche", caloriePct: 15, proteinPct: 15, carbohydratePct: 15, fatPct: 15 },
  { mealTemplateId: "dinner", label: "Jantar", caloriePct: 30, proteinPct: 30, carbohydratePct: 25, fatPct: 30 },
];

export function distributeDailyTargets(criteria: PatientCriteria, distribution = DEFAULT_MEAL_DISTRIBUTION) {
  return distribution.map((entry) => ({
    ...entry,
    target: {
      kcal: round(criteria.calories * entry.caloriePct / 100),
      protein: round(criteria.protein * entry.proteinPct / 100),
      carbohydrate: round(criteria.carbohydrate * entry.carbohydratePct / 100),
      fat: round(criteria.fat * entry.fatPct / 100),
    },
  }));
}

export function normalizeDistribution(distribution: MealMacroDistribution[]): MealMacroDistribution[] {
  const fields: Array<keyof Pick<MealMacroDistribution, "caloriePct" | "proteinPct" | "carbohydratePct" | "fatPct">> = ["caloriePct", "proteinPct", "carbohydratePct", "fatPct"];
  const next = distribution.map((item) => ({ ...item }));
  for (const field of fields) {
    const total = next.reduce((sum, item) => sum + item[field], 0) || 1;
    next.forEach((item) => { item[field] = round((item[field] / total) * 100); });
  }
  return next;
}

export function replaceDayItem(days: WeeklyDayPlan[], dayIndex: number, itemIndex: number, item: WeeklyDayItem) {
  return days.map((day, di) => di === dayIndex ? { ...day, items: day.items.map((current, ii) => ii === itemIndex ? item : current) } : day);
}

export function moveDayItem(days: WeeklyDayPlan[], fromDay: number, fromIndex: number, toDay: number, toIndex: number) {
  const clone = days.map((day) => ({ ...day, items: [...day.items] }));
  const [item] = clone[fromDay].items.splice(fromIndex, 1);
  if (!item) return days;
  clone[toDay].items.splice(Math.max(0, Math.min(toIndex, clone[toDay].items.length)), 0, item);
  return clone;
}

function roleCategory(role: string) {
  if (role === "protein") return "Proteínas";
  if (role === "carbohydrate" || role === "legume") return "Cereais e leguminosas";
  if (role === "fruit") return "Frutas";
  if (role === "vegetable") return "Hortaliças";
  if (role === "fat") return "Gorduras e temperos";
  if (role === "dairy") return "Lácteos";
  return "Outros";
}

export function buildWeeklyShoppingList(days: WeeklyDayPlan[]): ShoppingListLine[] {
  const grouped = new Map<string, ShoppingListLine>();
  for (const day of days) for (const item of day.items) {
    if (item.type === "meal") {
      for (const food of item.meal.items) {
        const key = `food:${food.food.id}`;
        const current = grouped.get(key);
        grouped.set(key, {
          key,
          name: food.food.name,
          category: roleCategory(food.food.role),
          grams: round((current?.grams ?? 0) + food.grams),
          source: "food",
        });
      }
    } else {
      for (const ingredient of item.recipe.ingredients) {
        const grams = ingredient.grams * item.servings;
        const key = `food:${ingredient.food.id}`;
        const current = grouped.get(key);
        grouped.set(key, {
          key,
          name: ingredient.food.name,
          category: roleCategory(ingredient.food.role),
          grams: round((current?.grams ?? 0) + grams),
          source: "recipe",
        });
      }
    }
  }
  return [...grouped.values()].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}

export function evaluateWeeklyRepetition(days: WeeklyDayPlan[]) {
  const counts = new Map<string, number>();
  for (const day of days) for (const item of day.items) {
    if (item.type !== "meal") continue;
    const seen = new Set(item.meal.items.map((food) => food.food.id));
    seen.forEach((foodId) => counts.set(foodId, (counts.get(foodId) ?? 0) + 1));
  }
  const excessive = [...counts.entries()].filter(([, count]) => count >= 5).sort((a, b) => b[1] - a[1]);
  const burden = excessive.reduce((sum, [, count]) => sum + (count - 4), 0);
  return { score: Math.max(0, 100 - burden * 8), excessive };
}

export function createWeeklySnapshot(input: Omit<WeeklyPlanSnapshot, "id" | "generatedAt" | "shoppingList">): WeeklyPlanSnapshot {
  return {
    ...input,
    id: `weekly-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    shoppingList: buildWeeklyShoppingList(input.days),
  };
}
