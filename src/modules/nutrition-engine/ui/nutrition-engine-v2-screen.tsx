"use client";

import { useMemo, useState } from "react";
import { DEMO_ENGINE_FOODS, DEMO_MEAL_TEMPLATES, DEMO_PATIENT_CRITERIA, DEMO_PHASE_OPTIONS } from "../domain/demo-v2-data";
import type { PatientCriteria } from "../domain/engine";
import { buildMealVariants, findSubstitutions, optimizePortions, type ActiveProtocolPhase } from "../domain/optimizer";

const pct = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

export function NutritionEngineV2Screen() {
  const [criteria, setCriteria] = useState<PatientCriteria>(DEMO_PATIENT_CRITERIA);
  const [phase, setPhase] = useState<ActiveProtocolPhase>(DEMO_PHASE_OPTIONS[0]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>({});
  const [selectedMeal, setSelectedMeal] = useState(0);
  const [selectedItem, setSelectedItem] = useState(0);

  const variants = useMemo(
    () => DEMO_MEAL_TEMPLATES.map(template => buildMealVariants(template, DEMO_ENGINE_FOODS, criteria, phase, 3)),
    [criteria, phase],
  );

  const baseMeals = useMemo(
    () => variants.map(group => group[Math.min(selectedVariants[group[0].meal.templateId] ?? 0, group.length - 1)].meal),
    [variants, selectedVariants],
  );

  const optimized = useMemo(() => optimizePortions(baseMeals, criteria), [baseMeals, criteria]);
  const activeMeal = optimized.meals[Math.min(selectedMeal, optimized.meals.length - 1)];
  const activeItem = activeMeal?.items[Math.min(selectedItem, Math.max(activeMeal.items.length - 1, 0))];
  const substitutions = useMemo(
    () => activeItem ? findSubstitutions(activeItem, DEMO_ENGINE_FOODS, criteria, phase) : [],
    [activeItem, criteria, phase],
  );

  const updateNumber = (key: "calories" | "protein" | "carbohydrate" | "fat", value: string) =>
    setCriteria(current => ({ ...current, [key]: Number(value) || 0 }));

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">NutriOS · Edição 5</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Nutrition Engine v2</h1>
            <p className="mt-1 text-sm text-zinc-500">Otimização de porções, alternativas equivalentes e protocolo/fase como entrada do motor.</p>
          </div>
          <div className={`rounded-full px-4 py-2 text-xs font-semibold ${optimized.status === "VALIDATED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
            {optimized.status === "VALIDATED" ? "VALIDADO PELO MOTOR" : "REVISÃO PROFISSIONAL NECESSÁRIA"}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-5 p-5 lg:grid-cols-[300px_minmax(0,1fr)_330px]">
        <aside className="space-y-4">
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-semibold">Metas nutricionais</h2>
            <div className="mt-4 grid gap-3">
              {([['calories','Calorias','kcal'],['protein','Proteína','g'],['carbohydrate','Carboidrato','g'],['fat','Gordura','g']] as const).map(([key,label,unit]) => (
                <label key={key} className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">
                  <span className="text-xs text-zinc-500">{label}</span>
                  <div className="mt-1 flex items-end gap-2"><input value={criteria[key]} onChange={e => updateNumber(key,e.target.value)} className="w-full bg-transparent text-xl font-semibold outline-none" inputMode="decimal"/><span className="text-xs text-zinc-500">{unit}</span></div>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-semibold">Protocolo e fase ativa</h2>
            <select value={`${phase.protocolId}:${phase.phaseId}`} onChange={e => { const next=DEMO_PHASE_OPTIONS.find(p=>`${p.protocolId}:${p.phaseId}`===e.target.value); if(next) setPhase(next); }} className="mt-3 w-full rounded-lg border border-zinc-200 bg-transparent p-2 text-sm dark:border-zinc-700">
              {DEMO_PHASE_OPTIONS.map(p => <option key={`${p.protocolId}:${p.phaseId}`} value={`${p.protocolId}:${p.phaseId}`}>{p.protocolName} — {p.phaseName}</option>)}
            </select>
            <div className="mt-3 space-y-2 text-xs text-zinc-500">
              <p><b>Prioriza:</b> {phase.prioritizedTags.join(", ") || "nenhum"}</p>
              <p><b>Exclui:</b> {phase.excludedTags.join(", ") || "nenhum"}</p>
              <p><b>Exige no dia:</b> {phase.requiredTags.join(", ") || "nenhum"}</p>
            </div>
          </section>
        </aside>

        <section className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {optimized.checks.map(check => (
              <div key={check.key} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between"><span className="text-xs text-zinc-500">{check.label}</span><span className={`text-xs font-semibold ${check.ok ? "text-emerald-600" : "text-amber-600"}`}>{pct(check.deviation)}</span></div>
                <div className="mt-2 text-2xl font-semibold">{check.actual} <span className="text-xs font-normal text-zinc-500">/ {check.target}</span></div>
              </div>
            ))}
          </div>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">Plano candidato otimizado</h2><p className="text-xs text-zinc-500">{optimized.iterations} iterações · objetivo {optimized.objective}</p></div><span className="rounded-full bg-zinc-100 px-3 py-1 text-xs dark:bg-zinc-800">Nenhuma IA alterou gramagens</span></div>
            <div className="mt-5 space-y-4">
              {optimized.meals.map((meal, mealIndex) => (
                <div key={meal.templateId} className={`rounded-xl border p-4 ${selectedMeal === mealIndex ? "border-zinc-900 dark:border-zinc-100" : "border-zinc-200 dark:border-zinc-700"}`} onClick={() => { setSelectedMeal(mealIndex); setSelectedItem(0); }}>
                  <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">{meal.templateName}</h3><p className="text-xs text-zinc-500">{meal.totals.kcal} kcal · P {meal.totals.protein} g · C {meal.totals.carbohydrate} g · G {meal.totals.fat} g</p></div><div className="flex gap-1">{variants[mealIndex].map((variant, index)=><button key={variant.id} onClick={e=>{e.stopPropagation();setSelectedVariants(v=>({...v,[meal.templateId]:index}));}} className={`rounded-md px-2 py-1 text-[11px] ${(selectedVariants[meal.templateId]??0)===index?"bg-zinc-900 text-white dark:bg-white dark:text-zinc-900":"bg-zinc-100 dark:bg-zinc-800"}`}>Opção {index+1}</button>)}</div></div>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">{meal.items.map((item,itemIndex)=><button key={`${item.food.id}-${itemIndex}`} onClick={e=>{e.stopPropagation();setSelectedMeal(mealIndex);setSelectedItem(itemIndex);}} className="rounded-lg bg-zinc-50 p-3 text-left text-sm dark:bg-zinc-950"><b>{item.food.name}</b><span className="ml-2 text-zinc-500">{item.grams} g</span><div className="mt-1 text-xs text-zinc-500">{item.kcal} kcal · P {item.protein} · C {item.carbohydrate} · G {item.fat}</div></button>)}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="font-semibold">Trace do otimizador</h2>
            <p className="mt-1 text-xs text-zinc-500">Primeiras mudanças aceitas por melhorarem o objetivo matemático.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">{optimized.trace.map((line,index)=><div key={index} className="rounded-lg bg-zinc-50 p-3 text-xs dark:bg-zinc-950">{index+1}. {line}</div>)}</div>
          </section>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Substituições equivalentes</p>
            {activeItem ? <><h2 className="mt-2 font-semibold">{activeItem.food.name} · {activeItem.grams} g</h2><p className="mt-1 text-xs text-zinc-500">Mesma função alimentar, elegível pela fase e aproximada por energia.</p><div className="mt-4 space-y-2">{substitutions.length ? substitutions.map(option=><div key={option.substituteFood.id} className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-700"><div className="text-sm font-semibold">{option.substituteFood.name}</div><div className="mt-1 text-xs text-zinc-500">{option.substituteGrams} g · Δ kcal {option.kcalDelta} · Δ proteína {option.proteinDelta} g</div><div className="mt-2 text-[11px] text-zinc-400">score {option.score} · {option.reason}</div></div>) : <p className="text-sm text-zinc-500">Nenhuma alternativa elegível cadastrada.</p>}</div></> : null}
          </section>

          <section className="rounded-2xl bg-zinc-950 p-4 text-white dark:bg-zinc-100 dark:text-zinc-950">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-60">Guardrail clínico</p>
            <h2 className="mt-2 font-semibold">Otimizar ≠ prescrever automaticamente</h2>
            <p className="mt-2 text-sm leading-6 opacity-70">O algoritmo só reorganiza alimentos elegíveis e porções dentro de limites. O candidato continua aguardando aprovação profissional.</p>
          </section>
        </aside>
      </div>
    </main>
  );
}
