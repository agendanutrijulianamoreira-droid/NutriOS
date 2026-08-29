export type ConsultationStageId =
  | "anamnesis"
  | "anthropometry"
  | "dietary-recall"
  | "diagnosis"
  | "conduct";

export type ReviewStatus = "confirmed" | "review" | "pending";

export interface ConsultationStage {
  id: ConsultationStageId;
  label: string;
  shortLabel: string;
  description: string;
}

export interface ClinicalField {
  id: string;
  label: string;
  value: string;
  status: ReviewStatus;
}

export interface CopilotSuggestion {
  id: string;
  category: "finding" | "pending" | "suggestion";
  text: string;
  actionLabel?: string;
}

export interface TranscriptDemoSegment {
  id: string;
  speaker: "Nutricionista" | "Paciente";
  text: string;
  time: string;
}

export const CONSULTATION_STAGES: ConsultationStage[] = [
  {
    id: "anamnesis",
    label: "Anamnese",
    shortLabel: "Anamnese",
    description: "História clínica, sintomas, rotina, medicamentos e objetivos.",
  },
  {
    id: "anthropometry",
    label: "Antropometria",
    shortLabel: "Antropometria",
    description: "Peso, medidas, composição corporal e evolução.",
  },
  {
    id: "dietary-recall",
    label: "Recordatório Alimentar",
    shortLabel: "Recordatório",
    description: "Refeições, horários, quantidades e padrões alimentares.",
  },
  {
    id: "diagnosis",
    label: "Diagnóstico Nutricional",
    shortLabel: "Diagnóstico",
    description: "Sugestões para revisão profissional, nunca diagnóstico automático.",
  },
  {
    id: "conduct",
    label: "Conduta",
    shortLabel: "Conduta",
    description: "Critérios clínicos que posteriormente alimentarão o motor nutricional.",
  },
];

export const INITIAL_ANAMNESIS_FIELDS: ClinicalField[] = [
  {
    id: "main-complaint",
    label: "Queixa principal",
    value: "Dificuldade para emagrecer e inchaço abdominal.",
    status: "confirmed",
  },
  {
    id: "symptoms",
    label: "Sintomas",
    value: "Inchaço abdominal, gases e fadiga ao fim do dia.",
    status: "confirmed",
  },
  {
    id: "medications",
    label: "Medicamentos",
    value: "Metformina 500 mg à noite.",
    status: "review",
  },
  {
    id: "supplements",
    label: "Suplementos",
    value: "Não informado.",
    status: "pending",
  },
  {
    id: "sleep",
    label: "Sono",
    value: "6 a 7 horas por noite. Sono não reparador.",
    status: "review",
  },
  {
    id: "stress",
    label: "Estresse",
    value: "Moderado. Rotina corrida e trabalho intenso.",
    status: "confirmed",
  },
  {
    id: "water",
    label: "Água",
    value: "Cerca de 1 litro por dia.",
    status: "review",
  },
  {
    id: "bowel",
    label: "Evacuação",
    value: "Frequência ainda não informada.",
    status: "pending",
  },
  {
    id: "exercise",
    label: "Exercício",
    value: "Caminhada 2x por semana, cerca de 30 minutos.",
    status: "review",
  },
  {
    id: "objectives",
    label: "Objetivos",
    value: "Emagrecer 8 kg e melhorar disposição.",
    status: "confirmed",
  },
];

export const DEMO_COPILOT_SUGGESTIONS: CopilotSuggestion[] = [
  { id: "c1", category: "finding", text: "Uso de metformina identificado.", actionLabel: "Aceitar" },
  { id: "c2", category: "finding", text: "Baixa ingestão hídrica relatada.", actionLabel: "Aceitar" },
  { id: "c3", category: "pending", text: "Perguntar frequência evacuatória.", actionLabel: "Resolver" },
  { id: "c4", category: "pending", text: "Confirmar histórico familiar de DM2.", actionLabel: "Resolver" },
  { id: "c5", category: "suggestion", text: "Explorar relação com doces no período noturno.", actionLabel: "Adicionar" },
];

export const DEMO_TRANSCRIPT: TranscriptDemoSegment[] = [
  {
    id: "t1",
    speaker: "Nutricionista",
    text: "Você utiliza algum medicamento atualmente?",
    time: "09:30",
  },
  {
    id: "t2",
    speaker: "Paciente",
    text: "Sim, metformina 500 mg à noite.",
    time: "09:31",
  },
  {
    id: "t3",
    speaker: "Nutricionista",
    text: "E como tem sido sua ingestão de água durante o dia?",
    time: "09:31",
  },
  {
    id: "t4",
    speaker: "Paciente",
    text: "Acho que tomo mais ou menos um litro.",
    time: "09:32",
  },
];
