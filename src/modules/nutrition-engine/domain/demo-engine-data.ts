import type { EngineFood, MealTemplate, PatientCriteria } from "./engine";

export const DEMO_ENGINE_FOODS: EngineFood[] = [
  { id: "egg", name: "Ovo inteiro", role: "protein", kcalPer100: 143, proteinPer100: 12.6, carbohydratePer100: 0.7, fatPer100: 9.5, prepMinutes: 8, costLevel: 1, tags: ["pratico", "tradicional"] },
  { id: "chicken", name: "Peito de frango grelhado", role: "protein", kcalPer100: 165, proteinPer100: 31, carbohydratePer100: 0, fatPer100: 3.6, prepMinutes: 20, costLevel: 2, tags: ["alta-proteina", "marmita"] },
  { id: "yogurt", name: "Iogurte natural sem açúcar", role: "dairy", kcalPer100: 63, proteinPer100: 5.2, carbohydratePer100: 7, fatPer100: 1.6, prepMinutes: 0, costLevel: 2, tags: ["pratico", "lanche"], allergens: ["leite"] },
  { id: "rice", name: "Arroz integral cozido", role: "carbohydrate", kcalPer100: 124, proteinPer100: 2.6, carbohydratePer100: 25.8, fatPer100: 1, fiberPer100: 2.7, prepMinutes: 25, costLevel: 1, tags: ["marmita", "tradicional"] },
  { id: "oats", name: "Aveia em flocos", role: "carbohydrate", kcalPer100: 394, proteinPer100: 13.9, carbohydratePer100: 66.6, fatPer100: 8.5, fiberPer100: 9.1, prepMinutes: 2, costLevel: 1, tags: ["pratico", "fibra"] },
  { id: "banana", name: "Banana prata", role: "fruit", kcalPer100: 98, proteinPer100: 1.3, carbohydratePer100: 26, fatPer100: 0.1, fiberPer100: 2, prepMinutes: 0, costLevel: 1, tags: ["pratico", "fruta"] },
  { id: "apple", name: "Maçã", role: "fruit", kcalPer100: 56, proteinPer100: 0.3, carbohydratePer100: 15.2, fatPer100: 0, fiberPer100: 1.3, prepMinutes: 0, costLevel: 2, tags: ["pratico", "fruta"] },
  { id: "beans", name: "Feijão carioca cozido", role: "legume", kcalPer100: 76, proteinPer100: 4.8, carbohydratePer100: 13.6, fatPer100: 0.5, fiberPer100: 8.5, prepMinutes: 35, costLevel: 1, tags: ["tradicional", "fibra"] },
  { id: "salad", name: "Salada de folhas e tomate", role: "vegetable", kcalPer100: 24, proteinPer100: 1.2, carbohydratePer100: 4.5, fatPer100: 0.2, fiberPer100: 2.1, prepMinutes: 7, costLevel: 1, tags: ["vegetais", "rapido"] },
  { id: "broccoli", name: "Brócolis cozido", role: "vegetable", kcalPer100: 35, proteinPer100: 2.4, carbohydratePer100: 7.2, fatPer100: 0.4, fiberPer100: 3.3, prepMinutes: 12, costLevel: 2, tags: ["vegetais", "fibra"] },
  { id: "olive-oil", name: "Azeite de oliva", role: "fat", kcalPer100: 884, proteinPer100: 0, carbohydratePer100: 0, fatPer100: 100, prepMinutes: 0, costLevel: 3, tags: ["gordura", "pratico"] },
  { id: "nuts", name: "Castanhas", role: "fat", kcalPer100: 607, proteinPer100: 20.6, carbohydratePer100: 21.5, fatPer100: 54.6, fiberPer100: 7.9, prepMinutes: 0, costLevel: 3, tags: ["lanche", "pratico"], allergens: ["oleaginosas"] },
];

export const DEMO_PATIENT_CRITERIA: PatientCriteria = {
  calories: 1600,
  protein: 115,
  carbohydrate: 170,
  fat: 52,
  meals: 5,
  preferredTags: ["pratico", "tradicional", "fibra"],
  excludedTags: [],
  allergens: [],
  maxPrepMinutes: 25,
  maxCostLevel: 2,
};

export const DEMO_MEAL_TEMPLATES: MealTemplate[] = [
  {
    id: "breakfast",
    name: "Café da manhã",
    slots: [
      { id: "b1", role: "protein", label: "Proteína", targetGrams: 100, required: true },
      { id: "b2", role: "carbohydrate", label: "Carboidrato", targetGrams: 35, required: true },
      { id: "b3", role: "fruit", label: "Fruta", targetGrams: 100, required: true },
    ],
  },
  {
    id: "lunch",
    name: "Almoço",
    slots: [
      { id: "l1", role: "protein", label: "Proteína", targetGrams: 120, required: true },
      { id: "l2", role: "carbohydrate", label: "Carboidrato", targetGrams: 100, required: true },
      { id: "l3", role: "legume", label: "Leguminosa", targetGrams: 80, required: true },
      { id: "l4", role: "vegetable", label: "Vegetais", targetGrams: 120, required: true },
      { id: "l5", role: "fat", label: "Gordura", targetGrams: 8, required: false },
    ],
  },
  {
    id: "snack",
    name: "Lanche",
    slots: [
      { id: "s1", role: "dairy", label: "Lácteo/proteína", targetGrams: 170, required: false },
      { id: "s2", role: "fruit", label: "Fruta", targetGrams: 120, required: true },
      { id: "s3", role: "carbohydrate", label: "Complemento", targetGrams: 20, required: false },
    ],
  },
  {
    id: "dinner",
    name: "Jantar",
    slots: [
      { id: "d1", role: "protein", label: "Proteína", targetGrams: 100, required: true },
      { id: "d2", role: "vegetable", label: "Vegetais", targetGrams: 150, required: true },
      { id: "d3", role: "carbohydrate", label: "Carboidrato", targetGrams: 80, required: false },
    ],
  },
];
