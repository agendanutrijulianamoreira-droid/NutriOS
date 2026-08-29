"use client";

import { useMemo, useState } from "react";
import { DEMO_ENGINE_FOODS, DEMO_MEAL_TEMPLATES, DEMO_PATIENT_CRITERIA, DEMO_ACTIVE_PHASE } from "@/modules/nutrition-engine/domain/demo-v2-data";
import { buildMealVariants, findSubstitutions, optimizePortions } from "@/modules/nutrition-engine/domain/optimizer";
import {
  applySubstitutionAndReoptimize,
  approvePlan,
  buildSevenDayPlan,
  estimatePlanCost,
  formatHouseholdMeasure,
  type ClinicalMealPlanVersion,
} from "../domain/clinical-plan";
import { DEMO_CALCULATED_RECIPES, DEMO_HOUSEHOLD_MEASURES, DEMO_PRICE_PER_KG } from "../domain/demo-clinical-plan-data";

export function ClinicalMealPlanScreen() {
  const initialMeals = useMemo(
    () => DEMO_MEAL_TEMPLATES.map((template) => buildMealVariants(template, DEMO_ENGINE_FOODS, DEMO_PATIENT_CRITERIA, DEMO_ACTIVE_PHASE, 3)[0].meal),
    [],
  );
  const [plan, setPlan] = useState(() => optimizePortions(initialMeals, DEMO_PATIENT_CRITERIA));
  const [selectedMeal, setSelectedMeal] = useState(0);
  const [selectedItem, setSelectedItem] = useState(0);
  const [versions, setVersions] = useState<ClinicalMealPlanVersion[]>([]);
  const [note, setNote] = useState("Plano inicial aprovado após revisão clínica.");

  const activeMeal = plan.meals[selectedMeal];
  const activeItem = activeMeal?.items[selectedItem];
  const substitutions = useMemo(
    () => activeItem ? findSubstitutions(activeItem, DEMO_ENGINE_FOODS, DEMO_PATIENT_CRITERIA, DEMO_ACTIVE_PHASE, 4) : [],
    [activeItem],
  );
  const weekly = useMemo(() => buildSevenDayPlan(plan.meals, DEMO_ENGINE_FOODS, DEMO_PATIENT_CRITERIA, DEMO_ACTIVE_PHASE), [plan.meals]);
  const cost = useMemo(() => estimatePlanCost(plan.meals, DEMO_PRICE_PER_KG), [plan.meals]);

  function applySubstitution(index: number) {
    const substitution = substitutions[index];
    if (!substitution) return;
    setPlan(applySubstitutionAndReoptimize({
      meals: plan.meals,
      mealIndex: selectedMeal,
      itemIndex: selectedItem,
      substitution,
      criteria: DEMO_PATIENT_CRITERIA,
    }));
  }

  function approveCurrentPlan() {
    setVersions((current) => approvePlan({
      previousVersions: current,
      patientId: "demo-patient",
      consultationId: "demo-consultation",
      protocolId: DEMO_ACTIVE_PHASE.protocolId,
      protocolPhaseId: DEMO_ACTIVE_PHASE.phaseId,
      criteria: DEMO_PATIENT_CRITERIA,
      meals: plan.meals,
      costEstimate: cost.total,
      varietyScore: weekly.variety.score,
      changeNote: note,
    }));
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-[1550px] flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">NutriOS · Edição 6</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Plano Alimentar Clínico</h1>
            <p className="mt-1 text-sm text-zinc-500">Do candidato matemático à revisão, substituição, medidas caseiras e aprovação versionada.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-zinc-100 px-3 py-2 text-xs font-medium dark:bg-zinc-800">{DEMO_ACTIVE_PHASE.protocolName} · {DEMO_ACTIVE_PHASE.phaseName}</span>
            <button onClick={approveCurrentPlan} className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950">Aprovar plano</button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1550px] gap-5 p-5 xl:grid-cols-[270px_minmax(0,1fr)_350px]">
        <aside className="space-y-4">
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-semibold">Resumo do plano</h2>
            <div className="mt-4 grid gap-2 text-sm">
              {plan.checks.map((check) => (
                <div key={check.key} className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">
                  <span>{check.label}</span>
                  <span className={check.ok ? "text-emerald-600" : "text-amber-600"}>{check.actual} / {check.target}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">Status do motor: {plan.status}</div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-semibold">Custo estimado</h2>
            <div className="mt-2 text-3xl font-semibold">R$ {cost.total.toFixed(2)}</div>
            <p className="mt-1 text-xs text-zinc-500">Estimativa do dia com preços demonstrativos por kg.</p>
            <div className="mt-3 max-h-48 space-y-2 overflow-auto text-xs">
              {cost.lines.map((line) => <div key={line.foodId} className="flex justify-between"><span>{line.foodName}</span><span>R$ {line.estimatedCost.toFixed(2)}</span></div>)}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Variedade semanal</h2><span className="text-xl font-semibold">{weekly.variety.score}</span></div>
            <p className="mt-1 text-xs text-zinc-500">Score anti-repetição em 7 dias.</p>
            {weekly.variety.warning ? <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">{weekly.variety.warning}</p> : <p className="mt-3 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-800">Variedade adequada na simulação.</p>}
          </section>
        </aside>

        <section className="space-y-4">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="font-semibold">Plano candidato</h2><p className="text-xs text-zinc-500">Clique em um alimento para revisar medidas e substituições.</p></div>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs dark:bg-zinc-800">{plan.iterations} ajustes matemáticos</span>
            </div>
            <div className="mt-4 space-y-4">
              {plan.meals.map((meal, mealIndex) => (
                <article key={meal.templateId} className={`rounded-xl border p-4 ${selectedMeal === mealIndex ? "border-zinc-900 dark:border-zinc-100" : "border-zinc-200 dark:border-zinc-700"}`}>
                  <div className="flex items-center justify-between"><div><h3 className="font-semibold">{meal.templateName}</h3><p className="text-xs text-zinc-500">{meal.totals.kcal} kcal · P {meal.totals.protein} · C {meal.totals.carbohydrate} · G {meal.totals.fat}</p></div></div>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {meal.items.map((item, itemIndex) => {
                      const measures = DEMO_HOUSEHOLD_MEASURES.filter((measure) => measure.foodId === item.food.id);
                      return <button key={`${meal.templateId}-${item.food.id}-${itemIndex}`} onClick={() => { setSelectedMeal(mealIndex); setSelectedItem(itemIndex); }} className={`rounded-xl p-3 text-left ${selectedMeal === mealIndex && selectedItem === itemIndex ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950" : "bg-zinc-50 dark:bg-zinc-950"}`}>
                        <b className="text-sm">{item.food.name}</b>
                        <div className="mt-1 text-xs opacity-65">{formatHouseholdMeasure(item.grams, measures)}</div>
                        <div className="mt-1 text-[11px] opacity-50">{item.kcal} kcal · P {item.protein} · C {item.carbohydrate} · G {item.fat}</div>
                      </button>;
                    })}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="font-semibold">Receitas calculadas pelo catálogo</h2>
            <p className="mt-1 text-xs text-zinc-500">A composição é soma determinística dos alimentos cadastrados, dividida pelo rendimento.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {DEMO_CALCULATED_RECIPES.map((recipe) => (
                <div key={recipe.id} className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950">
                  <b>{recipe.name}</b>
                  <div className="mt-2 text-xs text-zinc-500">1 porção: {recipe.perServing.grams} g · {recipe.perServing.kcal} kcal</div>
                  <div className="mt-1 text-xs text-zinc-500">P {recipe.perServing.protein} · C {recipe.perServing.carbohydrate} · G {recipe.perServing.fat} · Fibra {recipe.perServing.fiber}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="font-semibold">Histórico de versões</h2>
            <div className="mt-3 flex gap-2">
              <input value={note} onChange={(event) => setNote(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm dark:border-zinc-700" />
              <button onClick={approveCurrentPlan} className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700">Criar versão</button>
            </div>
            <div className="mt-4 space-y-2">
              {versions.length === 0 ? <p className="text-sm text-zinc-500">Nenhuma versão aprovada ainda.</p> : versions.slice().reverse().map((version) => (
                <div key={version.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-950">
                  <div><b>Versão {version.version}</b><div className="text-xs text-zinc-500">{version.changeNote}</div></div>
                  <span className={`rounded-full px-2 py-1 text-[11px] ${version.status === "APPROVED" ? "bg-emerald-100 text-emerald-800" : "bg-zinc-200 text-zinc-600"}`}>{version.status}</span>
                </div>
              ))}
            </div>
          </section>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Revisão do alimento</p>
            {activeItem ? <>
              <h2 className="mt-2 font-semibold">{activeItem.food.name}</h2>
              <p className="mt-1 text-xs text-zinc-500">{activeItem.grams} g · {activeItem.kcal} kcal</p>
              <div className="mt-4 space-y-2">
                {substitutions.map((substitution, index) => (
                  <div key={substitution.substituteFood.id} className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
                    <b className="text-sm">{substitution.substituteFood.name}</b>
                    <div className="mt-1 text-xs text-zinc-500">{substitution.substituteGrams} g · Δ kcal {substitution.kcalDelta} · Δ P {substitution.proteinDelta}</div>
                    <button onClick={() => applySubstitution(index)} className="mt-3 w-full rounded-lg bg-zinc-950 px-3 py-2 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-950">Aplicar e recalcular</button>
                  </div>
                ))}
                {substitutions.length === 0 ? <p className="text-sm text-zinc-500">Sem substituições elegíveis cadastradas.</p> : null}
              </div>
            </> : null}
          </section>

          <section className="rounded-2xl bg-zinc-950 p-4 text-white dark:bg-zinc-100 dark:text-zinc-950">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-60">Segurança clínica</p>
            <h2 className="mt-2 font-semibold">Aprovação é sempre humana</h2>
            <p className="mt-2 text-sm leading-6 opacity-70">Substituir recalcula o plano, mas não publica. Só o botão Aprovar plano cria uma versão clínica aprovada.</p>
          </section>
        </aside>
      </div>
    </main>
  );
}
