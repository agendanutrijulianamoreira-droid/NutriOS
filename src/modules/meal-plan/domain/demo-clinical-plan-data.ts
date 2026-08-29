import { DEMO_ENGINE_FOODS } from "@/modules/nutrition-engine/domain/demo-v2-data";
import { calculateRecipe, type HouseholdMeasureOption } from "./clinical-plan";

const food = (id: string) => {
  const found = DEMO_ENGINE_FOODS.find((item) => item.id === id);
  if (!found) throw new Error(`Demo food ${id} not found`);
  return found;
};

export const DEMO_HOUSEHOLD_MEASURES: HouseholdMeasureOption[] = [
  { foodId: "egg", name: "unidade média", grams: 50 },
  { foodId: "chicken", name: "filé médio", grams: 100 },
  { foodId: "rice", name: "colher de sopa cheia", grams: 25 },
  { foodId: "oats", name: "colher de sopa", grams: 15 },
  { foodId: "banana", name: "unidade média", grams: 90 },
  { foodId: "apple", name: "unidade média", grams: 130 },
  { foodId: "beans", name: "concha média", grams: 80 },
  { foodId: "salad", name: "prato de sobremesa", grams: 90 },
  { foodId: "broccoli", name: "xícara cozida", grams: 90 },
  { foodId: "olive-oil", name: "colher de chá", grams: 4.5 },
  { foodId: "yogurt", name: "pote", grams: 170 },
];

export const DEMO_PRICE_PER_KG: Record<string, number> = {
  egg: 18,
  chicken: 24,
  yogurt: 20,
  rice: 9,
  oats: 16,
  banana: 7,
  apple: 12,
  beans: 10,
  salad: 9,
  broccoli: 18,
  "olive-oil": 55,
  nuts: 75,
};

export const DEMO_CALCULATED_RECIPES = [
  calculateRecipe({
    id: "banana-oat-pancake",
    name: "Panqueca de banana e aveia",
    yieldServings: 1,
    ingredients: [
      { food: food("egg"), grams: 50 },
      { food: food("banana"), grams: 90 },
      { food: food("oats"), grams: 25 },
    ],
  }),
  calculateRecipe({
    id: "chicken-rice-bowl",
    name: "Bowl de frango, arroz e vegetais",
    yieldServings: 2,
    ingredients: [
      { food: food("chicken"), grams: 240 },
      { food: food("rice"), grams: 220 },
      { food: food("broccoli"), grams: 180 },
      { food: food("olive-oil"), grams: 10 },
    ],
  }),
];
