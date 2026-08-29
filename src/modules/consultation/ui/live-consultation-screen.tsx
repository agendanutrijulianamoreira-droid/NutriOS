"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Apple,
  ChevronRight,
  ClipboardList,
  FileText,
  Home,
  Library,
  Mic,
  MoreHorizontal,
  Play,
  Search,
  Settings,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
import {
  CONSULTATION_STAGES,
  DEMO_COPILOT_SUGGESTIONS,
  DEMO_TRANSCRIPT,
  INITIAL_ANAMNESIS_FIELDS,
  type ConsultationStageId,
} from "../domain/consultation-workflow";
import { formatClock, getTimerSeverity } from "../domain/consultation-timer";
import { ConsultationStagePanel } from "./consultation-stage-panel";
import { useConsultationRecorder } from "./use-consultation-recorder";
import { useConsultationTimer } from "./use-consultation-timer";

const TARGET_MINUTES = 15;

const navItems = [
  [Home, "Dashboard"],
  [Users, "Pacientes"],
  [Stethoscope, "Consultas"],
  [ClipboardList, "Protocolos"],
  [Apple, "Banco de Alimentos"],
  [Library, "Receitas"],
  [Activity, "Relatórios"],
  [Settings, "Configurações"],
] as const;

function badgeClass(category: "finding" | "pending" | "suggestion") {
  if (category === "finding") return "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30";
  if (category === "pending") return "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30";
  return "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30";
}

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
  const [activeStage, setActiveStage] = useState<ConsultationStageId>("anamnesis");
  const [fields, setFields] = useState(INITIAL_ANAMNESIS_FIELDS);
  const [resolvedSuggestions, setResolvedSuggestions] = useState<string[]>([]);
  const alertedRef = useRef(false);

  const remainingSeconds = TARGET_MINUTES * 60 - elapsedSeconds;
  const severity = getTimerSeverity(elapsedSeconds, TARGET_MINUTES);
  const stageIndex = CONSULTATION_STAGES.findIndex((stage) => stage.id === activeStage);
  const activeStageData = CONSULTATION_STAGES[stageIndex];

  const completion = useMemo(() => {
    const reviewed = fields.filter((field) => field.status === "confirmed").length;
    return Math.round((reviewed / fields.length) * 100);
  }, [fields]);

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
      // O alerta visual continua disponível quando o navegador bloquear áudio.
    }
  }, [elapsedSeconds]);

  const timerClass =
    severity === "critical" || severity === "elapsed"
      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
      : severity === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300"
        : "border-zinc-200 bg-white text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50";

  function updateField(id: string, value: string) {
    setFields((current) => current.map((field) => (field.id === id ? { ...field, value } : field)));
  }

  function nextStage() {
    const next = CONSULTATION_STAGES[stageIndex + 1];
    if (next) setActiveStage(next.id);
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="grid min-h-screen lg:grid-cols-[210px_1fr]">
        <aside className="hidden border-r border-zinc-200 bg-white lg:flex lg:flex-col dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex h-16 items-center gap-2 border-b border-zinc-200 px-5 dark:border-zinc-800">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">N</div>
            <span className="text-lg font-bold tracking-tight">NutriOS</span>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            {navItems.map(([Icon, label]) => (
              <button
                key={label}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  label === "Consultas"
                    ? "bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </nav>

          <div className="border-t border-zinc-200 p-4 text-xs text-zinc-500 dark:border-zinc-800">
            <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-emerald-500" /> Autosave local ativo</div>
            <div className="mt-2 flex items-center gap-2"><span className="size-2 rounded-full bg-amber-400" /> Integrações pendentes</div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-zinc-200 bg-white/95 px-4 backdrop-blur md:px-6 dark:border-zinc-800 dark:bg-zinc-950/95">
            <div className="relative hidden max-w-xl flex-1 md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input placeholder="Buscar pacientes, consultas, protocolos..." className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900" />
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 sm:block dark:bg-amber-950/30 dark:text-amber-300">Modo demonstração local</span>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">Nutricionista</p>
                <p className="text-xs text-zinc-500">NutriOS Clínica</p>
              </div>
              <div className="flex size-9 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold dark:bg-zinc-800">ND</div>
            </div>
          </header>

          <div className="grid xl:grid-cols-[210px_minmax(0,1fr)_340px]">
            <aside className="hidden min-h-[calc(100vh-64px)] border-r border-zinc-200 bg-white p-4 xl:block dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Etapas</p>
                <span className="text-xs text-zinc-400">{completion}%</span>
              </div>
              <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${completion}%` }} />
              </div>
              <div className="space-y-2">
                {CONSULTATION_STAGES.map((stage, index) => {
                  const active = stage.id === activeStage;
                  const done = index < stageIndex;
                  return (
                    <button key={stage.id} onClick={() => setActiveStage(stage.id)} className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${active ? "bg-zinc-100 dark:bg-zinc-900" : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"}`}>
                      <span className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${done ? "border-emerald-600 bg-emerald-600 text-white" : active ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950" : "border-zinc-200 text-zinc-500 dark:border-zinc-700"}`}>
                        {done ? "✓" : index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{stage.shortLabel}</p>
                        <p className="text-[11px] text-zinc-400">{done ? "Concluída" : active ? "Em andamento" : "Pendente"}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="min-w-0 p-4 md:p-6">
              <div className="mb-5 flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">{patientName}</h1>
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-500 dark:bg-zinc-900">37 anos</span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">Consulta inicial · Emagrecimento saudável · ID {consultationId.slice(0, 8)}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className={`rounded-xl border px-4 py-2 ${timerClass}`}>
                    <p className="font-mono text-lg font-bold tabular-nums">Consulta: {formatClock(elapsedSeconds)}</p>
                    <p className="text-xs opacity-70">{remainingSeconds > 0 ? `${formatClock(remainingSeconds)} restantes` : "tempo alvo excedido"}</p>
                  </div>
                  <button
                    onClick={() => (recorder.recording ? recorder.stop() : recorder.start())}
                    className={recorder.recording ? "inline-flex h-11 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300" : "inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"}
                  >
                    {recorder.recording ? <Mic size={16} /> : <Play size={16} />}
                    {recorder.recording ? "Gravando" : "Iniciar Consulta"}
                  </button>
                  <button className="inline-flex size-11 items-center justify-center rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"><MoreHorizontal size={18} /></button>
                </div>
              </div>

              {notice && (
                <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                  <span><strong>{notice}</strong> A gravação continua normalmente.</span>
                  <button onClick={() => setNotice(null)}>×</button>
                </div>
              )}

              <div className="mb-4 overflow-x-auto xl:hidden">
                <div className="flex min-w-max gap-2">
                  {CONSULTATION_STAGES.map((stage, index) => (
                    <button key={stage.id} onClick={() => setActiveStage(stage.id)} className={`rounded-full px-3 py-2 text-xs font-medium ${stage.id === activeStage ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950" : "border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"}`}>{index + 1}. {stage.shortLabel}</button>
                  ))}
                </div>
              </div>

              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">{activeStageData.label}</h2>
                    {activeStage === "anamnesis" && <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-1 text-[11px] font-medium text-violet-700 dark:bg-violet-950/30 dark:text-violet-300"><Sparkles size={12} /> Demo IA</span>}
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">{activeStageData.description}</p>
                </div>
                <span className="hidden text-xs text-zinc-400 sm:block">Alterações locais salvas automaticamente</span>
              </div>

              <ConsultationStagePanel stage={activeStage} anamnesisFields={fields} onAnamnesisChange={updateField} />

              <div className="mt-5 flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <button disabled={stageIndex === 0} onClick={() => setActiveStage(CONSULTATION_STAGES[Math.max(0, stageIndex - 1)].id)} className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 disabled:opacity-30">Voltar</button>
                {stageIndex < CONSULTATION_STAGES.length - 1 ? (
                  <button onClick={nextStage} className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950">Concluir etapa <ChevronRight size={16} /></button>
                ) : (
                  <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white"><FileText size={16} /> Preparar prontuário</button>
                )}
              </div>

              <div className="mt-6 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2"><Mic size={15} /><span className="text-sm font-semibold">Transcrição ao vivo</span></div>
                  <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] text-zinc-500 dark:bg-zinc-800">demonstração</span>
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {DEMO_TRANSCRIPT.map((segment) => (
                    <div key={segment.id} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[110px_1fr_50px]">
                      <span className={segment.speaker === "Nutricionista" ? "font-semibold text-emerald-700 dark:text-emerald-300" : "font-semibold"}>{segment.speaker}:</span>
                      <span className="text-zinc-600 dark:text-zinc-300">{segment.text}</span>
                      <span className="text-right text-xs text-zinc-400">{segment.time}</span>
                    </div>
                  ))}
                  {recorder.recording && <div className="px-4 py-3 text-xs text-zinc-500">Microfone ativo. Os chunks de áudio reais continuam sendo persistidos localmente; a transcrição exibida acima ainda é demonstrativa.</div>}
                </div>
              </div>
            </section>

            <aside className="border-l border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Sparkles className="text-violet-500" size={17} /><h2 className="text-sm font-bold">Copiloto</h2></div>
                <span className="text-[11px] text-zinc-400">demo local</span>
              </div>
              <p className="mt-1 text-xs leading-5 text-zinc-500">Sugestões ilustrativas para validar a experiência antes de conectar a IA.</p>

              <div className="mt-5 space-y-3">
                {DEMO_COPILOT_SUGGESTIONS.filter((item) => !resolvedSuggestions.includes(item.id)).map((item) => (
                  <div key={item.id} className={`rounded-xl border p-3 ${badgeClass(item.category)}`}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{item.category === "finding" ? "Achado" : item.category === "pending" ? "Pendência" : "Sugestão"}</p>
                    <p className="mt-1 text-sm font-medium leading-5">{item.text}</p>
                    <button onClick={() => setResolvedSuggestions((current) => [...current, item.id])} className="mt-3 rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold shadow-sm dark:bg-zinc-900">{item.actionLabel}</button>
                  </div>
                ))}
                {DEMO_COPILOT_SUGGESTIONS.every((item) => resolvedSuggestions.includes(item.id)) && (
                  <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500 dark:border-zinc-700">Sem pendências no modo demonstração.</div>
                )}
              </div>

              <div className="mt-6 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                <p className="text-xs font-semibold">Segurança clínica</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">O copiloto sugere. O profissional aceita, edita ou recusa. Nenhuma sugestão vira conduta automaticamente.</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
