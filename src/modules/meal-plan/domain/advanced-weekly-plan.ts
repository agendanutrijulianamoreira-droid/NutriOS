import type { PatientCriteria } from "@/modules/nutrition-engine/domain/engine";
import type { WeeklyDayPlan, Weekday, ShoppingListLine } from "./weekly-plan";
export type { Weekday } from "./weekly-plan";

export type DayProfile = "TRAINING" | "REST";

export interface MealSchedule {
  mealTemplateId: string;
  label: string;
  time: string;
}

export interface DayPrescriptionProfile {
  day: Weekday;
  profile: DayProfile;
  calorieMultiplier: number;
  carbohydrateMultiplier: number;
}

export interface CommercialPackage {
  foodId: string;
  label: string;
  gramsPerPackage: number;
  unitsPerPackage?: number;
}

export interface RoundedShoppingLine extends ShoppingListLine {
  commercialLabel: string;
  packages: number;
  purchaseGrams: number;
  surplusGrams: number;
}

export interface AdvancedWeeklySnapshot {
  generatedAt: string;
  criteria: PatientCriteria;
  schedules: MealSchedule[];
  dayProfiles: DayPrescriptionProfile[];
  days: WeeklyDayPlan[];
  roundedShoppingList: RoundedShoppingLine[];
}

const round = (value: number) => Math.round(value * 10) / 10;

export const DEFAULT_MEAL_SCHEDULES: MealSchedule[] = [
  { mealTemplateId: "breakfast", label: "Café da manhã", time: "07:30" },
  { mealTemplateId: "lunch", label: "Almoço", time: "12:30" },
  { mealTemplateId: "snack", label: "Lanche", time: "16:30" },
  { mealTemplateId: "dinner", label: "Jantar", time: "20:00" },
];

export const DEFAULT_DAY_PROFILES: DayPrescriptionProfile[] = [
  { day: "MON", profile: "TRAINING", calorieMultiplier: 1.05, carbohydrateMultiplier: 1.12 },
  { day: "TUE", profile: "REST", calorieMultiplier: 0.95, carbohydrateMultiplier: 0.9 },
  { day: "WED", profile: "TRAINING", calorieMultiplier: 1.05, carbohydrateMultiplier: 1.12 },
  { day: "THU", profile: "REST", calorieMultiplier: 0.95, carbohydrateMultiplier: 0.9 },
  { day: "FRI", profile: "TRAINING", calorieMultiplier: 1.05, carbohydrateMultiplier: 1.12 },
  { day: "SAT", profile: "REST", calorieMultiplier: 1, carbohydrateMultiplier: 1 },
  { day: "SUN", profile: "REST", calorieMultiplier: 1, carbohydrateMultiplier: 1 },
];

export function criteriaForDay(criteria: PatientCriteria, profile: DayPrescriptionProfile): PatientCriteria {
  return {
    ...criteria,
    calories: round(criteria.calories * profile.calorieMultiplier),
    carbohydrate: round(criteria.carbohydrate * profile.carbohydrateMultiplier),
  };
}

export function setMealTime(schedules: MealSchedule[], mealTemplateId: string, time: string) {
  return schedules.map((item) => item.mealTemplateId === mealTemplateId ? { ...item, time } : item);
}

export function setDayProfile(profiles: DayPrescriptionProfile[], day: Weekday, profile: DayProfile) {
  return profiles.map((item) => {
    if (item.day !== day) return item;
    return profile === "TRAINING"
      ? { ...item, profile, calorieMultiplier: 1.05, carbohydrateMultiplier: 1.12 }
      : { ...item, profile, calorieMultiplier: 0.95, carbohydrateMultiplier: 0.9 };
  });
}

export function moveWeeklyItemById(days: WeeklyDayPlan[], payload: { fromDay: Weekday; fromIndex: number; toDay: Weekday; toIndex: number }) {
  const clone = days.map((day) => ({ ...day, items: [...day.items] }));
  const from = clone.find((day) => day.day === payload.fromDay);
  const to = clone.find((day) => day.day === payload.toDay);
  if (!from || !to) return days;
  const [item] = from.items.splice(payload.fromIndex, 1);
  if (!item) return days;
  to.items.splice(Math.max(0, Math.min(payload.toIndex, to.items.length)), 0, item);
  return clone;
}

export function roundShoppingToPackages(
  shopping: ShoppingListLine[],
  packages: CommercialPackage[],
): RoundedShoppingLine[] {
  return shopping.map((line) => {
    const pack = packages.find((item) => item.foodId === line.key.replace("food:", ""));
    const gramsPerPackage = Math.max(pack?.gramsPerPackage ?? 1000, 1);
    const packageCount = Math.max(1, Math.ceil(line.grams / gramsPerPackage));
    const purchaseGrams = packageCount * gramsPerPackage;
    return {
      ...line,
      commercialLabel: pack?.label ?? `${gramsPerPackage} g`,
      packages: packageCount,
      purchaseGrams: round(purchaseGrams),
      surplusGrams: round(Math.max(0, purchaseGrams - line.grams)),
    };
  });
}

export function buildPatientExport(input: {
  patientName: string;
  schedules: MealSchedule[];
  profiles: DayPrescriptionProfile[];
  days: WeeklyDayPlan[];
  shopping: RoundedShoppingLine[];
  goals: string[];
  orientations: string[];
}) {
  const lines: string[] = [];
  lines.push(`PLANO ALIMENTAR SEMANAL — ${input.patientName}`);
  lines.push("");
  lines.push("HORÁRIOS");
  input.schedules.forEach((item) => lines.push(`${item.label}: ${item.time}`));
  lines.push("");
  lines.push("SEMANA");
  input.days.forEach((day) => {
    const profile = input.profiles.find((item) => item.day === day.day);
    lines.push(`${day.label} — ${profile?.profile === "TRAINING" ? "dia de treino" : "dia de descanso"}`);
    day.items.forEach((item) => {
      if (item.type === "meal") {
        lines.push(`• ${item.meal.templateName}: ${item.meal.items.map((food) => `${food.food.name} ${food.grams} g`).join(" + ")}`);
      } else {
        lines.push(`• Receita: ${item.recipe.name} — ${item.servings} porção(ões)`);
      }
    });
  });
  lines.push("");
  lines.push("LISTA DE COMPRAS");
  input.shopping.forEach((line) => lines.push(`• ${line.name}: ${line.packages} × ${line.commercialLabel}`));
  if (input.goals.length) {
    lines.push("");
    lines.push("METAS");
    input.goals.forEach((goal) => lines.push(`• ${goal}`));
  }
  if (input.orientations.length) {
    lines.push("");
    lines.push("ORIENTAÇÕES");
    input.orientations.forEach((orientation) => lines.push(`• ${orientation}`));
  }
  return lines.join("\n");
}

export function createAdvancedWeeklySnapshot(input: Omit<AdvancedWeeklySnapshot, "generatedAt">): AdvancedWeeklySnapshot {
  return { ...input, generatedAt: new Date().toISOString() };
}
