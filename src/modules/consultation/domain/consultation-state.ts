export const CONSULTATION_STATUSES = [
  "CREATED",
  "READY",
  "RECORDING",
  "PAUSED",
  "OFFLINE",
  "SYNCING",
  "PROCESSING",
  "REVIEWING",
  "FINALIZED",
  "FAILED",
] as const;

export type ConsultationStatus = (typeof CONSULTATION_STATUSES)[number];

const transitions: Record<ConsultationStatus, ConsultationStatus[]> = {
  CREATED: ["READY", "FAILED"],
  READY: ["RECORDING", "FAILED"],
  RECORDING: ["PAUSED", "OFFLINE", "PROCESSING", "FAILED"],
  PAUSED: ["RECORDING", "PROCESSING", "FAILED"],
  OFFLINE: ["RECORDING", "SYNCING", "FAILED"],
  SYNCING: ["RECORDING", "PROCESSING", "FAILED"],
  PROCESSING: ["REVIEWING", "FAILED"],
  REVIEWING: ["FINALIZED", "RECORDING", "FAILED"],
  FINALIZED: [],
  FAILED: ["READY", "RECORDING"],
};

export function canTransition(from: ConsultationStatus, to: ConsultationStatus) {
  return transitions[from].includes(to);
}
