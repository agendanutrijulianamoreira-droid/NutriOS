export type TimerSeverity = "neutral" | "warning" | "critical" | "elapsed";

export function getTimerSeverity(elapsedSeconds: number, targetMinutes = 15): TimerSeverity {
  const remaining = targetMinutes * 60 - elapsedSeconds;
  if (remaining <= 0) return "elapsed";
  if (remaining <= 5 * 60) return "critical";
  if (remaining <= 10 * 60) return "warning";
  return "neutral";
}

export function formatClock(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60).toString().padStart(2, "0");
  const seconds = Math.floor(safe % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}
