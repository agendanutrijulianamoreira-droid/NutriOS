import Dexie, { type Table } from "dexie";

export interface LocalAudioChunk {
  id: string;
  consultationId: string;
  sequence: number;
  blob: Blob;
  createdAt: number;
  syncStatus: "LOCAL_ONLY" | "SYNC_PENDING" | "SYNCING" | "SYNCED" | "CONFLICT";
}

export interface LocalEvent {
  id: string;
  consultationId: string;
  type: string;
  payload: unknown;
  createdAt: number;
  syncStatus: "LOCAL_ONLY" | "SYNC_PENDING" | "SYNCING" | "SYNCED" | "CONFLICT";
}

class NutriOSLocalDatabase extends Dexie {
  audioChunks!: Table<LocalAudioChunk, string>;
  events!: Table<LocalEvent, string>;

  constructor() {
    super("nutrios-local");
    this.version(1).stores({
      audioChunks: "id, consultationId, sequence, createdAt, syncStatus",
      events: "id, consultationId, type, createdAt, syncStatus",
    });
  }
}

export const localDb = new NutriOSLocalDatabase();
