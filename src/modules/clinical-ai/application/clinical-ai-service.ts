import type { ClinicalExtraction } from "../domain/clinical-extraction";
import type { TranscriptSegment } from "@/modules/transcription/domain/transcription-provider";

export interface ClinicalAIService {
  extractClinicalData(input: {
    consultationId: string;
    transcript: TranscriptSegment[];
  }): Promise<ClinicalExtraction>;
}
