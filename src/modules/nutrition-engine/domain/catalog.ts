export type FoodSourceType =
  | "manual"
  | "manufacturer_label"
  | "licensed_database"
  | "tbca_reference"
  | "tucunduva_reference"
  | "other";

export type FoodKind =
  | "in_natura"
  | "culinary_ingredient"
  | "preparation"
  | "industrialized"
  | "supplement";

export interface NutrientProfile100g {
  energyKcal: number;
  proteinG: number;
  carbohydrateG: number;
  fatG: number;
  fiberG?: number;
  saturatedFatG?: number;
  totalSugarG?: number;
  addedSugarG?: number;
  sodiumMg?: number;
}

export interface CatalogFood {
  id: string;
  name: string;
  displayName: string;
  kind: FoodKind;
  brand?: string;
  gtin?: string;
  foodGroup?: string;
  nutrients: NutrientProfile100g;
  ingredients?: string;
  allergens: string[];
  claims: string[];
  source: {
    type: FoodSourceType;
    name: string;
    version?: string;
    externalCode?: string;
    url?: string;
    licenseNote?: string;
    capturedAt?: string;
  };
}

export interface RecipeIngredientDraft {
  id: string;
  foodId: string;
  foodName: string;
  grams: number;
}

export interface RecipeDraft {
  id: string;
  name: string;
  description: string;
  prepTimeMinutes: number;
  yieldServings: number;
  instructions: string;
  tags: string[];
  ingredients: RecipeIngredientDraft[];
}

export type RuleEffect = "allow" | "prioritize" | "limit" | "exclude" | "require";

export interface ProtocolPhaseDraft {
  id: string;
  name: string;
  order: number;
  durationDays?: number;
  description: string;
  goals: string[];
}

export interface ProtocolRuleDraft {
  id: string;
  name: string;
  phaseId?: string;
  effect: RuleEffect;
  target: string;
  rationale: string;
  priority: number;
  enabled: boolean;
}

export interface ProtocolDraft {
  id: string;
  name: string;
  description: string;
  version: number;
  phases: ProtocolPhaseDraft[];
  rules: ProtocolRuleDraft[];
}

export interface ProtocolAISuggestionDraft {
  id: string;
  title: string;
  rationale: string;
  proposedChange: string;
  status: "ai_suggested" | "accepted" | "edited" | "rejected";
}

export const CATALOG_SOURCE_RULES = {
  tbca: "Referência externa. Não copiar conteúdo protegido para o catálogo comercial sem licença/autorização.",
  tucunduva: "Referência bibliográfica. Importação de dados depende de licença da obra/editora.",
  manufacturer: "Cadastrar dados públicos do rótulo com data de captura e identificação da versão do produto.",
  manual: "Dados inseridos pelo profissional devem manter autoria, data e histórico de edição.",
} as const;
