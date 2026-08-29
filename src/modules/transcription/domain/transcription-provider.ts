export type TranscriptSpeaker = "NUTRITIONIST" | "PATIENT" | "UNKNOWN";

export interface TranscriptSegment {
  id: string;
  consultationId: string;
  speaker: TranscriptSpeaker;
  text: string;
  startedAtMs: number;
  endedAtMs?: number;
  confidence?: number;
  final: boolean;
  source: "openai" | "google" | "local";
}

export interface TranscriptionProvider {
  start(input: { consultationId: string }): Promise<void>;
  stop(): Promise<void>;
  sendAudio(chunk: Blob): Promise<void>;
  onPartial(listener: (segment: TranscriptSegment) => void): () => void;
  onFinal(listener: (segment: TranscriptSegment) => void): () => void;
}
