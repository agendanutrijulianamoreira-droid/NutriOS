import { DEMO_ENGINE_FOODS, DEMO_MEAL_TEMPLATES, DEMO_PATIENT_CRITERIA } from "./demo-engine-data";
import type { ActiveProtocolPhase } from "./optimizer";

export { DEMO_ENGINE_FOODS, DEMO_MEAL_TEMPLATES, DEMO_PATIENT_CRITERIA };

export const DEMO_ACTIVE_PHASE: ActiveProtocolPhase = {
  protocolId: "metabolic-balance",
  protocolName: "Equilíbrio Metabólico",
  phaseId: "phase-2",
  phaseName: "Fase 2 · Consolidação",
  excludedFoodIds: [],
  excludedTags: ["ultraprocessado"],
  prioritizedTags: ["fibra", "alta-proteina", "vegetais", "tradicional"],
  requiredTags: ["fibra", "vegetais"],
};

export const DEMO_PHASE_OPTIONS: ActiveProtocolPhase[] = [
  DEMO_ACTIVE_PHASE,
  {
    protocolId: "digestive-reset",
    protocolName: "Reequilíbrio Intestinal",
    phaseId: "phase-1",
    phaseName: "Fase 1 · Organização",
    excludedFoodIds: [],
    excludedTags: ["ultraprocessado", "fritura"],
    prioritizedTags: ["vegetais", "fibra", "fruta"],
    requiredTags: ["vegetais"],
  },
  {
    protocolId: "free-plan",
    protocolName: "Sem protocolo ativo",
    phaseId: "none",
    phaseName: "Critérios individuais",
    excludedFoodIds: [],
    excludedTags: [],
    prioritizedTags: [],
    requiredTags: [],
  },
];
