"use client";

import { useMemo, useState } from "react";
import { DEMO_PATIENT_CRITERIA } from "@/modules/nutrition-engine/domain/demo-v2-data";
import { buildWeeklyShoppingList, evaluateWeeklyRepetition } from "../domain/weekly-plan";
import { DEMO_WEEKLY_DAYS } from "../domain/demo-weekly-plan-data";
import {
  DEFAULT_DAY_PROFILES,
  DEFAULT_MEAL_SCHEDULES,
  buildPatientExport,
  criteriaForDay,
  moveWeeklyItemById,
  roundShoppingToPackages,
  setDayProfile,
  setMealTime,
  type DayProfile,
  type Weekday,
} from "../domain/advanced-weekly-plan";
import { DEMO_ADVANCED_GOALS, DEMO_ADVANCED_ORIENTATIONS, DEMO_COMMERCIAL_PACKAGES } from "../domain/demo-advanced-weekly-data";

export function AdvancedWeeklyPrescriptionScreen() {
  const [days, setDays] = useState(DEMO_WEEKLY_DAYS);
  const [schedules, setSchedules] = useState(DEFAULT_MEAL_SCHEDULES);
  const [profiles, setProfiles] = useState(DEFAULT_DAY_PROFILES);
  const [activeDay, setActiveDay] = useState<Weekday>("MON");
  const [dragged, setDragged] = useState<{ day: Weekday; index: number } | null>(null);
  const [exported, setExported] = useState("");

  const shopping = useMemo(() => buildWeeklyShoppingList(days), [days]);
  const roundedShopping = useMemo(() => roundShoppingToPackages(shopping, DEMO_COMMERCIAL_PACKAGES), [shopping]);
  const repetition = useMemo(() => evaluateWeeklyRepetition(days), [days]);
  const active = days.find((day) => day.day === activeDay) ?? days[0];
  const activeProfile = profiles.find((profile) => profile.day === activeDay) ?? profiles[0];
  const activeCriteria = criteriaForDay(DEMO_PATIENT_CRITERIA, activeProfile);

  const dropOnDay = (day: Weekday) => {
    if (!dragged) return;
    const destination = days.find((item) => item.day === day);
    setDays(current => moveWeeklyItemById(current, { fromDay: dragged.day, fromIndex: dragged.index, toDay: day, toIndex: destination?.items.length ?? 0 }));
    setDragged(null);
  };

  const exportPlan = () => {
    setExported(buildPatientExport({
      patientName: "Paciente de demonstração",
      schedules,
      profiles,
      days,
      shopping: roundedShopping,
      goals: DEMO_ADVANCED_GOALS,
      orientations: DEMO_ADVANCED_ORIENTATIONS,
    }));
  };

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">NutriOS · Edição 8</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Prescrição Semanal Avançada</h1>
            <p className="mt-1 text-sm text-zinc-500">Treino/descanso, horários, drag-and-drop, compras comerciais e exportação.</p>
          </div>
          <button onClick={exportPlan} className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950">Exportar plano + compras</button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-5 p-5 xl:grid-cols-[300px_minmax(0,1fr)_350px]">
        <aside className="space-y-4">
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-semibold">Horários das refeições</h2>
            <div className="mt-3 space-y-2">
              {schedules.map((schedule) => (
                <label key={schedule.mealTemplateId} className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-950">
                  <span>{schedule.label}</span>
                  <input type="time" value={schedule.time} onChange={(event) => setSchedules(current => setMealTime(current, schedule.mealTemplateId, event.target.value))} className="rounded-md border border-zinc-200 bg-transparent px-2 py-1 dark:border-zinc-700" />
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Meta do dia ativo</h2><span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">{activeProfile.profile === "TRAINING" ? "TREINO" : "DESCANSO"}</span></div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950"><span className="text-zinc-500">Calorias</span><div className="mt-1 text-lg font-semibold">{activeCriteria.calories}</div></div>
              <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950"><span className="text-zinc-500">Carboidrato</span><div className="mt-1 text-lg font-semibold">{activeCriteria.carbohydrate} g</div></div>
              <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950"><span className="text-zinc-500">Proteína</span><div className="mt-1 text-lg font-semibold">{activeCriteria.protein} g</div></div>
              <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950"><span className="text-zinc-500">Gordura</span><div className="mt-1 text-lg font-semibold">{activeCriteria.fat} g</div></div>
            </div>
          </section>
        </aside>

        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {days.map((day) => {
              const profile = profiles.find((item) => item.day === day.day)!;
              return (
                <button key={day.day} onClick={() => setActiveDay(day.day)} onDragOver={(event) => event.preventDefault()} onDrop={() => dropOnDay(day.day)} className={`rounded-xl border p-3 text-left ${activeDay === day.day ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950" : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"}`}>
                  <div className="text-xs font-semibold">{day.label}</div>
                  <div className="mt-1 text-[11px] opacity-60">{profile.profile === "TRAINING" ? "Treino" : "Descanso"}</div>
                </button>
              );
            })}
          </div>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="font-semibold">{active.label}</h2><p className="text-xs text-zinc-500">Arraste uma refeição e solte em outro dia para mover.</p></div>
              <select value={activeProfile.profile} onChange={(event) => setProfiles(current => setDayProfile(current, active.day, event.target.value as DayProfile))} className="rounded-lg border border-zinc-200 bg-transparent p-2 text-sm dark:border-zinc-700">
                <option value="TRAINING">Dia de treino</option>
                <option value="REST">Dia de descanso</option>
              </select>
            </div>
            <div className="mt-4 space-y-3">
              {active.items.map((item, index) => (
                <div key={`${active.day}-${index}`} draggable onDragStart={() => setDragged({ day: active.day, index })} className="cursor-grab rounded-xl border border-zinc-200 bg-zinc-50 p-4 active:cursor-grabbing dark:border-zinc-700 dark:bg-zinc-950">
                  {item.type === "meal" ? (
                    <><div className="flex items-center justify-between"><b>{item.meal.templateName}</b><span className="text-xs text-zinc-400">arrastar</span></div><p className="mt-1 text-xs text-zinc-500">{item.meal.items.map((food) => `${food.food.name} ${food.grams} g`).join(" · ")}</p></>
                  ) : (
                    <><div className="flex items-center justify-between"><b>Receita · {item.recipe.name}</b><span className="text-xs text-zinc-400">arrastar</span></div><p className="mt-1 text-xs text-zinc-500">{item.servings} porção(ões) · {item.recipe.perServing.kcal} kcal/porção</p></>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between"><h2 className="font-semibold">Qualidade semanal</h2><span className={`rounded-full px-3 py-1 text-xs font-semibold ${repetition.score >= 80 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>variedade {repetition.score}/100</span></div>
            <p className="mt-2 text-sm text-zinc-500">O drag-and-drop reorganiza a prescrição, mas não altera cálculos nutricionais por IA nem publica uma nova versão automaticamente.</p>
          </section>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Lista de compras comercial</p>
            <div className="mt-3 max-h-[470px] space-y-2 overflow-auto pr-1">
              {roundedShopping.map((line) => (
                <div key={line.key} className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">
                  <div className="flex justify-between gap-3 text-sm"><b>{line.name}</b><span>{line.packages} un.</span></div>
                  <div className="mt-1 text-xs text-zinc-500">Necessário {line.grams} g · comprar {line.purchaseGrams} g</div>
                  <div className="mt-1 text-[11px] text-zinc-400">{line.commercialLabel} · sobra estimada {line.surplusGrams} g</div>
                </div>
              ))}
            </div>
          </section>

          {exported ? (
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
              <div className="flex items-center justify-between"><b className="text-sm">Exportação preparada</b><button onClick={() => navigator.clipboard?.writeText(exported)} className="rounded-md bg-emerald-700 px-2 py-1 text-xs font-semibold text-white">Copiar</button></div>
              <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-[11px] leading-5 text-emerald-950 dark:text-emerald-200">{exported}</pre>
            </section>
          ) : null}

          <section className="rounded-2xl bg-zinc-950 p-4 text-white dark:bg-zinc-100 dark:text-zinc-950">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-60">Guardrail</p>
            <h2 className="mt-2 font-semibold">Mudança visual não vira prescrição sem revisão</h2>
            <p className="mt-2 text-sm leading-6 opacity-70">Treino/descanso altera metas previstas; mover refeições altera organização. Aprovação clínica e persistência continuam etapas separadas.</p>
          </section>
        </aside>
      </div>
    </main>
  );
}
