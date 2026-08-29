import { DEMO_ENGINE_FOODS, DEMO_MEAL_TEMPLATES, DEMO_PATIENT_CRITERIA, DEMO_ACTIVE_PHASE } from "@/modules/nutrition-engine/domain/demo-v2-data";
import { buildMealVariants, optimizePortions } from "@/modules/nutrition-engine/domain/optimizer";
import { DEMO_CALCULATED_RECIPES } from "./demo-clinical-plan-data";
import type { WeeklyDayPlan } from "./weekly-plan";

const baseMeals = DEMO_MEAL_TEMPLATES.map((template) => buildMealVariants(template, DEMO_ENGINE_FOODS, DEMO_PATIENT_CRITERIA, DEMO_ACTIVE_PHASE, 3)[0].meal);
const optimized = optimizePortions(baseMeals, DEMO_PATIENT_CRITERIA).meals;

const labels = [
  ["MON", "Segunda"], ["TUE", "Terça"], ["WED", "Quarta"], ["THU", "Quinta"], ["FRI", "Sexta"], ["SAT", "Sábado"], ["SUN", "Domingo"],
] as const;

export const DEMO_WEEKLY_DAYS: WeeklyDayPlan[] = labels.map(([day, label], index) => ({
  day,
  label,
  items: optimized.map((meal, mealIndex) => {
    if ((index === 1 || index === 4) && mealIndex === 0) {
      return { type: "recipe" as const, recipe: DEMO_CALCULATED_RECIPES[0], servings: 1 };
    }
    if ((index === 2 || index === 5) && mealIndex === 1) {
      return { type: "recipe" as const, recipe: DEMO_CALCULATED_RECIPES[1], servings: 1 };
    }
    return { type: "meal" as const, meal };
  }),
}));

export const DEMO_GOALS = [
  "Manter proteína distribuída ao longo do dia.",
  "Atingir pelo menos 2 porções de vegetais nas refeições principais.",
  "Planejar compras e pré-preparo para reduzir decisões de última hora.",
];

export const DEMO_ORIENTATIONS = [
  "As substituições devem permanecer dentro das opções validadas pelo plano.",
  "Receitas contam para a lista de compras pelos ingredientes cadastrados.",
  "A semana pode ser reorganizada sem alterar automaticamente a versão clínica aprovada.",
];
