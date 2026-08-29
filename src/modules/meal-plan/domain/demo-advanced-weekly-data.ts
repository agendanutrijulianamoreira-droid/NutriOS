import type { CommercialPackage } from "./advanced-weekly-plan";

export const DEMO_COMMERCIAL_PACKAGES: CommercialPackage[] = [
  { foodId: "egg", label: "cartela com 12 unidades (~600 g)", gramsPerPackage: 600, unitsPerPackage: 12 },
  { foodId: "chicken", label: "bandeja de 1 kg", gramsPerPackage: 1000 },
  { foodId: "yogurt", label: "pote 170 g", gramsPerPackage: 170, unitsPerPackage: 1 },
  { foodId: "rice", label: "pacote 1 kg", gramsPerPackage: 1000 },
  { foodId: "oats", label: "pacote 500 g", gramsPerPackage: 500 },
  { foodId: "banana", label: "quilo", gramsPerPackage: 1000 },
  { foodId: "apple", label: "bandeja 1 kg", gramsPerPackage: 1000 },
  { foodId: "beans", label: "pacote 1 kg", gramsPerPackage: 1000 },
  { foodId: "salad", label: "maço/pacote 300 g", gramsPerPackage: 300 },
  { foodId: "broccoli", label: "unidade/maço 350 g", gramsPerPackage: 350 },
  { foodId: "olive-oil", label: "garrafa 500 ml (~455 g)", gramsPerPackage: 455 },
  { foodId: "nuts", label: "pacote 150 g", gramsPerPackage: 150 },
];

export const DEMO_ADVANCED_GOALS = [
  "Manter proteína distribuída ao longo do dia.",
  "Cumprir vegetais no almoço e jantar.",
  "Planejar as compras uma vez por semana.",
];

export const DEMO_ADVANCED_ORIENTATIONS = [
  "Nos dias de treino, priorizar o plano indicado sem compensações adicionais.",
  "Nos dias de descanso, manter os mesmos horários e seguir as porções ajustadas.",
  "Substituições devem respeitar as opções equivalentes liberadas no plano.",
];
