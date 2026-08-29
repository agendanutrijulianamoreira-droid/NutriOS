"use client";

import { useEffect, useRef, useState } from "react";

export function useConsultationTimer(active: boolean) {
  const startedAtRef = useRef<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (!startedAtRef.current) startedAtRef.current = Date.now() - elapsedSeconds * 1000;

    const timer = window.setInterval(() => {
      const startedAt = startedAtRef.current;
      if (!startedAt) return;
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);

    return () => window.clearInterval(timer);
  }, [active, elapsedSeconds]);

  return { elapsedSeconds };
}
