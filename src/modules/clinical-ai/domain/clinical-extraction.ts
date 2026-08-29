export type SuggestionStatus = "AI_SUGGESTED" | "ACCEPTED" | "EDITED" | "REJECTED";

export interface ExtractedValue<T> {
  value: T;
  confidence: number;
  sourceTranscriptSegmentIds: string[];
  status: SuggestionStatus;
}

export interface ClinicalExtraction {
  demographics: {
    name?: ExtractedValue<string>;
    age?: ExtractedValue<number>;
    profession?: ExtractedValue<string>;
  };
  chiefComplaint?: ExtractedValue<string>;
  symptoms: Array<ExtractedValue<string>>;
  diseases: Array<ExtractedValue<string>>;
  medications: Array<ExtractedValue<string>>;
  supplements: Array<ExtractedValue<string>>;
  allergies: Array<ExtractedValue<string>>;
  intolerances: Array<ExtractedValue<string>>;
  goals: Array<ExtractedValue<string>>;
  preferences: Array<ExtractedValue<string>>;
  restrictions: Array<ExtractedValue<string>>;
  pendingQuestions: string[];
}
