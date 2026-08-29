import type { MealCandidate } from "./engine";
import type { ActiveProtocolPhase } from "./optimizer";

export interface ProtocolCoverageCheck {
  tag: string;
  ok: boolean;
  matchedFoods: string[];
}

export function validateProtocolCoverage(meals: MealCandidate[], phase?: ActiveProtocolPhase) {
  if (!phase || phase.requiredTags.length === 0) {
    return { valid: true, checks: [] as ProtocolCoverageCheck[] };
  }

  const foods = meals.flatMap(meal => meal.items.map(item => item.food));
  const checks = phase.requiredTags.map(tag => {
    const matchedFoods = foods.filter(food => food.tags.includes(tag)).map(food => food.name);
    return { tag, ok: matchedFoods.length > 0, matchedFoods };
  });

  return { valid: checks.every(check => check.ok), checks };
}
