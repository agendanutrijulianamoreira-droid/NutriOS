"use client";

import { useMemo, useState } from "react";
import {
  buildMealCandidate,
  validateDailyTargets,
  type MealCandidate,
  type PatientCriteria,
} from "../domain/engine";
import {
  DEMO_ENGINE_FOODS,
  DEMO_MEAL_TEMPLATES,
  DEMO_PATIENT_CRITERIA,
} from "../domain/demo-engine-data";

function NumberInput({
  label,
  value,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      <div className="mt-2 flex items-end gap-2">
        <input
          type="number"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full bg-transparent text-2xl font-semibold outline-none"
        />
        <span className="pb-1 text-xs text-zinc-400">{unit}</span>
      </div>
    </label>
  );
}

function Metric({ label, value, target, unit }: { label: string; value: number; target: number; unit: string }) {
  const variance = target > 0 ? Math.round(((value - target) / target) * 100) : 0;
  const ok = Math.abs(variance) <= 15;
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-zinc-500">{label}</span>
        <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
          {variance > 0 ? "+" : ""}{variance}%
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold">{value} <span className="text-sm font-normal text-zinc-400">{unit}</span></p>
      <p className="mt-1 text-xs text-zinc-400">Meta: {target} {unit}</p>
    </div>
  );
}

function MealCard({ meal, expanded, onToggle }: { meal: MealCandidate; expanded: boolean; onToggle: () => void }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <button onClick={onToggle} className="flex w-full items-center justify-between gap-4 p-5 text-left">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{meal.templateName}</h3>
            <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${meal.valid ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
              {meal.valid ? "válida" : "revisar"}
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            {meal.totals.kcal} kcal · {meal.totals.protein} g P · {meal.totals.carbohydrate} g C · {meal.totals.fat} g G
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">{meal.score}</p>
          <p className="text-[11px] uppercase tracking-wide text-zinc-400">score</p>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-zinc-100 px-5 pb-5 pt-4 dark:border-zinc-800">
          <div className="space-y-3">
            {meal.items.map((item) => (
              <div key={`${meal.templateId}-${item.food.id}`} className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.food.name}</p>
                    <p className="mt-1 text-sm text-zinc-500">{item.grams} g · {item.kcal} kcal · score {item.score}</p>
                  </div>
                  <span className="rounded-full border border-zinc-200 px-2 py-1 text-[11px] text-zinc-500 dark:border-zinc-700">{item.food.role}</span>
                </div>
                <div className="mt-3 grid gap-1 text-xs text-zinc-500 sm:grid-cols-2">
                  {item.reasons.map((reason) => <span key={reason}>{reason}</span>)}
                </div>
              </div>
            ))}
          </div>
          {meal.warnings.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {meal.warnings.join(" ")}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export function NutritionEngineScreen() {
  const [criteria, setCriteria] = useState<PatientCriteria>(DEMO_PATIENT_CRITERIA);
  const [expandedMeal, setExpandedMeal] = useState<string | null>("breakfast");

  const meals = useMemo(() => {
    const templates = [
      DEMO_MEAL_TEMPLATES[0],
      DEMO_MEAL_TEMPLATES[1],
      DEMO_MEAL_TEMPLATES[2],
      DEMO_MEAL_TEMPLATES[3],
    ];
    return templates.map((template) => buildMealCandidate({ template, foods: DEMO_ENGINE_FOODS, criteria }));
  }, [criteria]);

  const validation = useMemo(() => validateDailyTargets(meals, criteria), [meals, criteria]);

  const updateCriterion = (key: keyof PatientCriteria, value: number) => {
    setCriteria((current) => ({ ...current, [key]: value }));
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">NutriOS · Nutrition Engine v1</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Motor nutricional determinístico</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
              A IA não escolhe alimentos ou quantidades. O motor aplica restrições, pontua candidatos, calcula nutrientes e deixa cada decisão rastreável para revisão profissional.
            </p>
          </div>
          <div className="flex gap-2">
            <a href="/nutrition-library" className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium dark:border-zinc-700 dark:bg-zinc-900">Biblioteca</a>
            <a href="/consultations/demo" className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-950">Consulta demo</a>
          </div>
        </header>

        <div className="mt-6 grid gap-6 xl:grid-cols-[340px_1fr]">
          <aside className="space-y-4">
            <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Entrada clínica</p>
                  <h2 className="mt-1 font-semibold">Critérios do paciente</h2>
                </div>
                <span className="rounded-full bg-violet-50 px-2 py-1 text-[11px] font-medium text-violet-700">editável</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-1">
                <NumberInput label="Meta calórica" value={criteria.calories} unit="kcal" onChange={(value) => updateCriterion("calories", value)} />
                <NumberInput label="Proteína" value={criteria.protein} unit="g" onChange={(value) => updateCriterion("protein", value)} />
                <NumberInput label="Carboidrato" value={criteria.carbohydrate} unit="g" onChange={(value) => updateCriterion("carbohydrate", value)} />
                <NumberInput label="Gordura" value={criteria.fat} unit="g" onChange={(value) => updateCriterion("fat", value)} />
                <NumberInput label="Preparo máximo" value={criteria.maxPrepMinutes} unit="min" onChange={(value) => updateCriterion("maxPrepMinutes", value)} />
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-zinc-950 p-5 text-white dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Guardrails</p>
              <h2 className="mt-1 font-semibold">Regras ativas</h2>
              <div className="mt-4 space-y-3 text-sm text-zinc-300">
                <div className="rounded-xl bg-white/5 p-3"><strong className="text-white">Hard:</strong> alergênicos nunca passam.</div>
                <div className="rounded-xl bg-white/5 p-3"><strong className="text-white">Hard:</strong> tags excluídas bloqueiam o alimento.</div>
                <div className="rounded-xl bg-white/5 p-3"><strong className="text-white">Soft:</strong> praticidade, custo e preferência alteram ranking.</div>
                <div className="rounded-xl bg-white/5 p-3"><strong className="text-white">Validação:</strong> alvo diário usa tolerância inicial de ±15%.</div>
              </div>
            </section>
          </aside>

          <section className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Energia" value={validation.totals.kcal} target={criteria.calories} unit="kcal" />
              <Metric label="Proteína" value={validation.totals.protein} target={criteria.protein} unit="g" />
              <Metric label="Carboidrato" value={validation.totals.carbohydrate} target={criteria.carbohydrate} unit="g" />
              <Metric label="Gordura" value={validation.totals.fat} target={criteria.fat} unit="g" />
            </div>

            <section className={`rounded-2xl border p-5 ${validation.valid ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className={`text-sm font-semibold ${validation.valid ? "text-emerald-900" : "text-amber-900"}`}>
                    {validation.valid ? "Plano dentro dos critérios iniciais" : "Candidato precisa de ajuste antes de aprovação"}
                  </p>
                  <p className={`mt-1 text-sm ${validation.valid ? "text-emerald-700" : "text-amber-700"}`}>
                    O sistema nunca envia automaticamente. O nutricionista revisa o candidato e pode modificar qualquer decisão.
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${validation.valid ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"}`}>
                  {validation.valid ? "VALIDADO" : "REVISAR"}
                </span>
              </div>
            </section>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Candidatos gerados</p>
                  <h2 className="mt-1 text-xl font-semibold">Refeições e explicabilidade</h2>
                </div>
                <span className="text-xs text-zinc-400">clique para ver o rule trace</span>
              </div>
              <div className="space-y-3">
                {meals.map((meal) => (
                  <MealCard
                    key={meal.templateId}
                    meal={meal}
                    expanded={expandedMeal === meal.templateId}
                    onToggle={() => setExpandedMeal((current) => current === meal.templateId ? null : meal.templateId)}
                  />
                ))}
              </div>
            </div>

            <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Próxima camada</p>
              <h2 className="mt-1 font-semibold">O que entra depois do v1</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Otimização das gramagens para fechar kcal/macros automaticamente, substituições equivalentes, protocolos ativos do paciente, variedade semanal e geração de múltiplos candidatos ranqueados. A IA continuará apenas explicando ou sugerindo mudanças nas regras.
              </p>
            </section>
          </section>
        </div>
      </div>
    </main>
  );
}
