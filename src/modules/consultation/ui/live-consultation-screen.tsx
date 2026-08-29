"use client";

import { useEffect, useRef, useState } from "react";
import { formatClock, getTimerSeverity } from "../domain/consultation-timer";
import { useConsultationRecorder } from "./use-consultation-recorder";
import { useConsultationTimer } from "./use-consultation-timer";

const TARGET_MINUTES = 15;

export function LiveConsultationScreen({
  consultationId,
  patientName,
}: {
  consultationId: string;
  patientName: string;
}) {
  const recorder = useConsultationRecorder(consultationId);
  const { elapsedSeconds } = useConsultationTimer(recorder.recording);
  const [notice, setNotice] = useState<string | null>(null);
  const alertedRef = useRef(false);

  const remainingSeconds = TARGET_MINUTES * 60 - elapsedSeconds;
  const severity = getTimerSeverity(elapsedSeconds, TARGET_MINUTES);

  useEffect(() => {
    if (elapsedSeconds < TARGET_MINUTES * 60 || alertedRef.current) return;
    alertedRef.current = true;
    setNotice("Consulta atingiu 15 minutos.");

    if ("vibrate" in navigator) navigator.vibrate(180);
    try {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.035;
      oscillator.frequency.value = 660;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.18);
    } catch {
      // O alerta visual continua disponível caso áudio seja bloqueado pelo navegador.
    }
  }, [elapsedSeconds]);

  const timerClass =
    severity === "critical"
      ? "text-red-600 dark:text-red-400"
      : severity === "warning"
        ? "text-amber-600 dark:text-amber-400"
        : severity === "elapsed"
          ? "text-red-600 dark:text-red-400"
          : "text-zinc-950 dark:text-zinc-50";

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 px-5 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
          <div>
            <p className="text-xs text-zinc-500">Consulta</p>
            <h1 className="text-sm font-semibold">{patientName}</h1>
          </div>

          <div className="text-center">
            <p className={`font-mono text-xl font-semibold tabular-nums ${timerClass}`}>
              {formatClock(elapsedSeconds)}
            </p>
            <p className={`text-xs ${timerClass}`}>
              {remainingSeconds > 0 ? `${formatClock(remainingSeconds)} restantes` : "tempo alvo excedido"}
            </p>
          </div>

          <button
            onClick={() => (recorder.recording ? recorder.stop() : recorder.start())}
            className={
              recorder.recording
                ? "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                : "rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-950"
            }
          >
            {recorder.recording ? "Encerrar gravação" : "Iniciar consulta"}
          </button>
        </div>
      </header>

      {notice && (
        <div className="mx-auto mt-4 max-w-[1500px] px-5">
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {notice} A gravação continua normalmente.
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-[1500px] grid-cols-12 gap-4 p-5">
        <aside className="col-span-2 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">Etapas</p>
          {[
            "Anamnese",
            "Antropometria",
            "Recordatório",
            "Diagnóstico",
            "Conduta",
          ].map((label, index) => (
            <div key={label} className="rounded px-2 py-2 text-sm text-zinc-700 dark:text-zinc-300">
              {index + 1}. {label}
            </div>
          ))}
        </aside>

        <section className="col-span-7 min-h-[72vh] rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500">Etapa 1</p>
              <h2 className="text-lg font-semibold">Anamnese</h2>
            </div>
            <span className="text-xs text-zinc-500">Autosave preparado</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            {["Queixa principal", "Sintomas", "Medicamentos", "Suplementos", "Sono", "Água", "Evacuação", "Objetivos"].map((field) => (
              <label key={field} className="space-y-1">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{field}</span>
                <textarea
                  className="min-h-24 w-full resize-none rounded-md border border-zinc-200 bg-transparent p-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700"
                  placeholder="A IA preencherá este campo para revisão."
                />
              </label>
            ))}
          </div>
        </section>

        <aside className="col-span-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Copiloto</p>
          <h3 className="mt-2 text-sm font-semibold">Pendências da consulta</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            A extração clínica será conectada aos segmentos de transcrição. Sugestões sempre terão aceitar, editar ou recusar.
          </p>

          <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Transcrição ao vivo</span>
              <span className="text-xs text-zinc-500">offline-first</span>
            </div>
            <div className="mt-3 rounded-md bg-zinc-50 p-3 text-sm text-zinc-500 dark:bg-zinc-950">
              {recorder.recording
                ? "Microfone ativo. Chunks de áudio são persistidos localmente a cada 5 segundos."
                : "Inicie a consulta para ativar gravação e armazenamento local."}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
