"use client";

import { useMemo, useState } from "react";
import { DEMO_PATIENT_CRITERIA } from "@/modules/nutrition-engine/domain/demo-v2-data";
import { DEMO_GOALS, DEMO_ORIENTATIONS, DEMO_WEEKLY_DAYS } from "../domain/demo-weekly-plan-data";
import { DEFAULT_MEAL_DISTRIBUTION, buildWeeklyShoppingList, createWeeklySnapshot, distributeDailyTargets, evaluateWeeklyRepetition, normalizeDistribution, type MealMacroDistribution, type WeeklyDayPlan } from "../domain/weekly-plan";

export function WeeklyMealPlanScreen() {
  const [days, setDays] = useState<WeeklyDayPlan[]>(DEMO_WEEKLY_DAYS);
  const [activeDay, setActiveDay] = useState(0);
  const [distribution, setDistribution] = useState<MealMacroDistribution[]>(DEFAULT_MEAL_DISTRIBUTION);
  const [snapshotCreated, setSnapshotCreated] = useState(false);

  const targets = useMemo(() => distributeDailyTargets(DEMO_PATIENT_CRITERIA, distribution), [distribution]);
  const shopping = useMemo(() => buildWeeklyShoppingList(days), [days]);
  const repetition = useMemo(() => evaluateWeeklyRepetition(days), [days]);
  const active = days[activeDay];

  const updatePct = (index: number, key: "caloriePct" | "proteinPct" | "carbohydratePct" | "fatPct", value: number) => {
    setDistribution((current) => current.map((item, i) => i === index ? { ...item, [key]: Math.max(0, value) } : item));
  };

  const normalize = () => setDistribution((current) => normalizeDistribution(current));

  const swapMeals = (a: number, b: number) => {
    setDays((current) => current.map((day, di) => di === activeDay ? {
      ...day,
      items: day.items.map((item, index, items) => index === a ? items[b] : index === b ? items[a] : item),
    } : day));
  };

  const createSnapshot = () => {
    createWeeklySnapshot({
      criteria: DEMO_PATIENT_CRITERIA,
      macroDistribution: distribution,
      days,
      goals: DEMO_GOALS,
      orientations: DEMO_ORIENTATIONS,
    });
    setSnapshotCreated(true);
  };

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-5 py-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">NutriOS · Edição 7</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Editor Semanal Inteligente</h1>
            <p className="mt-1 text-sm text-zinc-500">7 dias, distribuição por refeição, receitas, compras e snapshot para prontuário.</p>
          </div>
          <button onClick={createSnapshot} className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950">
            {snapshotCreated ? "Snapshot criado" : "Gerar snapshot do prontuário"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] p-5">
        <div className="grid gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {days.map((day, index) => (
            <button key={day.day} onClick={() => setActiveDay(index)} className={`rounded-xl border p-3 text-left ${activeDay === index ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950" : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"}`}>
              <div className="text-xs opacity-60">Dia {index + 1}</div><div className="mt-1 font-semibold">{day.label}</div><div className="mt-1 text-[11px] opacity-60">{day.items.length} refeições</div>
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)_350px]">
          <aside className="space-y-4">
            <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Distribuição diária</h2><button onClick={normalize} className="text-xs font-semibold text-emerald-600">Normalizar 100%</button></div>
              <div className="mt-4 space-y-3">
                {distribution.map((row, index) => (
                  <div key={row.mealTemplateId} className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">
                    <div className="text-sm font-medium">{row.label}</div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      {[['caloriePct','Kcal'],['proteinPct','Prot.'],['carbohydratePct','Carb.'],['fatPct','Gord.']].map(([key,label]) => (
                        <label key={key} className="rounded-lg border border-zinc-200 px-2 py-1.5 dark:border-zinc-800"><span className="text-zinc-500">{label}</span><input value={row[key as keyof MealMacroDistribution] as number} onChange={(e)=>updatePct(index,key as any,Number(e.target.value)||0)} className="ml-2 w-12 bg-transparent text-right font-semibold outline-none"/>%</label>
                      ))}
                    </div>
                    <div className="mt-2 text-[11px] text-zinc-500">Meta: {targets[index]?.target.kcal ?? 0} kcal · P {targets[index]?.target.protein ?? 0} g</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Anti-repetição</h2><span className={`text-lg font-semibold ${repetition.score >= 80 ? "text-emerald-600" : "text-amber-600"}`}>{repetition.score}</span></div>
              <p className="mt-2 text-xs text-zinc-500">O sistema sinaliza alimentos presentes em 5 ou mais dias.</p>
              <div className="mt-3 space-y-2">{repetition.excessive.length ? repetition.excessive.map(([id,count]) => <div key={id} className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800">{id}: {count} dias</div>) : <div className="rounded-lg bg-emerald-50 p-2 text-xs text-emerald-800">Boa variedade semanal.</div>}</div>
            </section>
          </aside>

          <section className="space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">{active.label}</h2><p className="text-xs text-zinc-500">Reordene refeições localmente; receitas entram como itens reais.</p></div><span className="rounded-full bg-zinc-100 px-3 py-1 text-xs dark:bg-zinc-800">Editor semanal local</span></div>
              <div className="mt-4 space-y-3">
                {active.items.map((item, index) => (
                  <div key={index} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{item.type === "recipe" ? "Receita" : "Refeição"}</div>
                        <div className="mt-1 font-semibold">{item.type === "recipe" ? item.recipe.name : item.meal.templateName}</div>
                        <div className="mt-1 text-xs text-zinc-500">{item.type === "recipe" ? `${item.recipe.perServing.kcal} kcal · ${item.recipe.perServing.grams} g` : `${item.meal.totals.kcal} kcal · P ${item.meal.totals.protein} g · C ${item.meal.totals.carbohydrate} g`}</div>
                      </div>
                      <div className="flex gap-1"><button disabled={index===0} onClick={()=>swapMeals(index,index-1)} className="rounded-md bg-zinc-100 px-2 py-1 text-xs disabled:opacity-30 dark:bg-zinc-800">↑</button><button disabled={index===active.items.length-1} onClick={()=>swapMeals(index,index+1)} className="rounded-md bg-zinc-100 px-2 py-1 text-xs disabled:opacity-30 dark:bg-zinc-800">↓</button></div>
                    </div>
                    {item.type === "meal" ? <div className="mt-3 flex flex-wrap gap-2">{item.meal.items.map((food)=><span key={food.food.id} className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] dark:bg-zinc-800">{food.food.name} · {food.grams} g</span>)}</div> : <div className="mt-3 text-xs text-zinc-500">Ingredientes cadastrados: {item.recipe.ingredients.map(i=>i.food.name).join(", ")}</div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><h2 className="font-semibold">Metas vinculadas ao plano</h2><ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">{DEMO_GOALS.map((goal)=><li key={goal} className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950">{goal}</li>)}</ul></section>
              <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><h2 className="font-semibold">Orientações</h2><ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">{DEMO_ORIENTATIONS.map((text)=><li key={text} className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950">{text}</li>)}</ul></section>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Lista de compras</h2><span className="text-xs text-zinc-500">{shopping.length} itens</span></div>
              <p className="mt-2 text-xs text-zinc-500">Agregada deterministicamente dos 7 dias, incluindo ingredientes das receitas.</p>
              <div className="mt-4 max-h-[620px] space-y-2 overflow-auto">{shopping.map((line)=><div key={line.key} className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950"><div className="text-[11px] uppercase tracking-wide text-zinc-400">{line.category}</div><div className="mt-1 flex justify-between gap-3 text-sm"><b>{line.name}</b><span>{line.grams} g</span></div>{line.source === "recipe" ? <div className="mt-1 text-[10px] text-emerald-600">inclui receita</div> : null}</div>)}</div>
            </section>

            <section className="rounded-2xl bg-zinc-950 p-4 text-white dark:bg-zinc-100 dark:text-zinc-950"><p className="text-xs font-semibold uppercase tracking-wide opacity-60">Snapshot clínico</p><h2 className="mt-2 font-semibold">Pronto para o prontuário</h2><p className="mt-2 text-sm leading-6 opacity-70">O snapshot congela critérios, distribuição, os 7 dias, compras, metas e orientações. A persistência real entra quando conectarmos o backend.</p></section>
          </aside>
        </div>
      </div>
    </main>
  );
}
