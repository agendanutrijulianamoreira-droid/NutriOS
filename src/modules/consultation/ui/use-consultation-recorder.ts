"use client";

import { useCallback, useRef, useState } from "react";
import { localDb } from "@/shared/offline/nutrios-local-db";

export function useConsultationRecorder(consultationId: string) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sequenceRef = useRef(0);
  const [recording, setRecording] = useState(false);

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    recorderRef.current = recorder;

    recorder.addEventListener("dataavailable", async (event) => {
      if (!event.data.size) return;
      const sequence = sequenceRef.current++;
      await localDb.audioChunks.put({
        id: crypto.randomUUID(),
        consultationId,
        sequence,
        blob: event.data,
        createdAt: Date.now(),
        syncStatus: navigator.onLine ? "SYNC_PENDING" : "LOCAL_ONLY",
      });
    });

    recorder.start(5_000);
    setRecording(true);
  }, [consultationId]);

  const stop = useCallback(() => {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    recorderRef.current = null;
    streamRef.current = null;
    setRecording(false);
  }, []);

  return { recording, start, stop };
}
