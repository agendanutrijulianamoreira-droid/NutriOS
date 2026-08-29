"use client";

import { useMemo, useState } from "react";
import type { CatalogFood, ProtocolAISuggestionDraft, ProtocolDraft, RecipeDraft } from "../domain/catalog";

type Tab = "foods" | "recipes" | "protocols";

const demoFoods: CatalogFood[] = [
  {
    id: "food-1",
    name: "Iogurte natural integral",
    displayName: "Iogurte natural integral",
    kind: "industrialized",
    brand: "Exemplo",
    foodGroup: "Lácteos",
    nutrients: { energyKcal: 61, proteinG: 3.5, carbohydrateG: 4.7, fatG: 3.3, sodiumMg: 46 },
    allergens: ["Leite"],
    claims: [],
    source: { type: "manufacturer_label", name: "Rótulo do fabricante", capturedAt: "2026-08-29" },
  },
  {
    id: "food-2",
    name: "Aveia em flocos",
    displayName: "Aveia em flocos",
    kind: "in_natura",
    foodGroup: "Cereais",
    nutrients: { energyKcal: 394, proteinG: 13.9, carbohydrateG: 66.6, fatG: 8.5, fiberG: 9.1 },
    allergens: [],
    claims: [],
    source: { type: "manual", name: "Cadastro profissional" },
  },
];

const demoRecipe: RecipeDraft = {
  id: "recipe-1",
  name: "Bowl proteico de iogurte",
  description: "Receita rápida para café da manhã ou lanche.",
  prepTimeMinutes: 5,
  yieldServings: 1,
  instructions: "Misture os ingredientes e sirva imediatamente.",
  tags: ["rápida", "proteica"],
  ingredients: [
    { id: "ri-1", foodId: "food-1", foodName: "Iogurte natural integral", grams: 170 },
    { id: "ri-2", foodId: "food-2", foodName: "Aveia em flocos", grams: 25 },
  ],
};

const demoProtocol: ProtocolDraft = {
  id: "protocol-1",
  name: "Reprogramação Hormonal — Base",
  description: "Estrutura inicial totalmente editável. Nenhuma regra é fixa no código.",
  version: 1,
  phases: [
    { id: "phase-1", name: "Organizando a casa", order: 1, durationDays: 30, description: "Organização alimentar e rotina.", goals: ["Hidratação", "Distribuição proteica", "Regularidade alimentar"] },
    { id: "phase-2", name: "Corrigindo a rota", order: 2, durationDays: 30, description: "Ajustes guiados pela evolução.", goals: ["Fibra", "Qualidade alimentar", "Sintomas"] },
  ],
  rules: [
    { id: "rule-1", name: "Priorizar proteína nas principais refeições", phaseId: "phase-1", effect: "prioritize", target: "grupo:proteinas", rationale: "Apoiar saciedade e distribuição proteica.", priority: 20, enabled: true },
  ],
};

const demoAiSuggestions: ProtocolAISuggestionDraft[] = [
  {
    id: "ai-1",
    title: "Revisar meta de fibras na fase 2",
    rationale: "Sugestão demonstrativa: a IA poderá analisar o protocolo e propor alterações, mas nunca publicá-las automaticamente.",
    proposedChange: "Adicionar regra de progressão de fibras conforme tolerância e sintomas gastrointestinais.",
    status: "ai_suggested",
  },
];

function Field({ label, value, onChange, type = "text" }: { label: string; value: string | number; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900" />
    </label>
  );
}

export function NutritionLibraryScreen() {
  const [tab, setTab] = useState<Tab>("foods");
  const [foods, setFoods] = useState(demoFoods);
  const [recipe, setRecipe] = useState(demoRecipe);
  const [protocol, setProtocol] = useState(demoProtocol);
  const [suggestions, setSuggestions] = useState(demoAiSuggestions);
  const [selectedFoodId, setSelectedFoodId] = useState(foods[0].id);

  const selectedFood = useMemo(() => foods.find((food) => food.id === selectedFoodId) ?? foods[0], [foods, selectedFoodId]);

  function updateFood(patch: Partial<CatalogFood>) {
    setFoods((current) => current.map((food) => food.id === selectedFood.id ? { ...food, ...patch } : food));
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">NutriOS</p>
            <h1 className="mt-1 text-xl font-semibold">Biblioteca & Nutrition Engine</h1>
            <p className="mt-1 text-sm text-zinc-500">Alimentos, receitas e protocolos editáveis com proveniência e versionamento.</p>
          </div>
          <a href="/consultations/demo" className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">Voltar à consulta</a>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] p-6">
        <div className="mb-5 flex gap-2 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
          {(["foods", "recipes", "protocols"] as Tab[]).map((item) => (
            <button key={item} onClick={() => setTab(item)} className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === item ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950" : "text-zinc-500"}`}>
              {item === "foods" ? "Banco de alimentos" : item === "recipes" ? "Receitas" : "Protocolos"}
            </button>
          ))}
        </div>

        {tab === "foods" && (
          <div className="grid gap-4 lg:grid-cols-[330px_1fr]">
            <aside className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Alimentos</h2>
                <button onClick={() => {
                  const id = `food-${Date.now()}`;
                  setFoods((current) => [...current, { id, name: "Novo alimento", displayName: "Novo alimento", kind: "in_natura", nutrients: { energyKcal: 0, proteinG: 0, carbohydrateG: 0, fatG: 0 }, allergens: [], claims: [], source: { type: "manual", name: "Cadastro profissional" } }]);
                  setSelectedFoodId(id);
                }} className="rounded-md bg-zinc-950 px-2.5 py-1.5 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-950">+ Cadastrar</button>
              </div>
              <div className="space-y-1">
                {foods.map((food) => (
                  <button key={food.id} onClick={() => setSelectedFoodId(food.id)} className={`w-full rounded-lg px-3 py-3 text-left ${selectedFoodId === food.id ? "bg-emerald-50 ring-1 ring-emerald-200 dark:bg-emerald-950/30 dark:ring-emerald-900" : "hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}>
                    <span className="block text-sm font-medium">{food.displayName}</span>
                    <span className="mt-1 block text-xs text-zinc-500">{food.brand ?? "Sem marca"} · {food.source.name}</span>
                  </button>
                ))}
              </div>
            </aside>

            <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start justify-between gap-4">
                <div><h2 className="text-lg font-semibold">Editar alimento</h2><p className="text-sm text-zinc-500">Valores nutricionais normalizados por 100 g/ml.</p></div>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">Fonte: {selectedFood.source.name}</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <Field label="Nome" value={selectedFood.displayName} onChange={(value) => updateFood({ displayName: value, name: value })} />
                <Field label="Marca" value={selectedFood.brand ?? ""} onChange={(value) => updateFood({ brand: value })} />
                <Field label="GTIN / EAN" value={selectedFood.gtin ?? ""} onChange={(value) => updateFood({ gtin: value })} />
                <Field label="Energia (kcal)" type="number" value={selectedFood.nutrients.energyKcal} onChange={(value) => updateFood({ nutrients: { ...selectedFood.nutrients, energyKcal: Number(value) } })} />
                <Field label="Proteína (g)" type="number" value={selectedFood.nutrients.proteinG} onChange={(value) => updateFood({ nutrients: { ...selectedFood.nutrients, proteinG: Number(value) } })} />
                <Field label="Carboidrato (g)" type="number" value={selectedFood.nutrients.carbohydrateG} onChange={(value) => updateFood({ nutrients: { ...selectedFood.nutrients, carbohydrateG: Number(value) } })} />
                <Field label="Gorduras (g)" type="number" value={selectedFood.nutrients.fatG} onChange={(value) => updateFood({ nutrients: { ...selectedFood.nutrients, fatG: Number(value) } })} />
                <Field label="Fibras (g)" type="number" value={selectedFood.nutrients.fiberG ?? ""} onChange={(value) => updateFood({ nutrients: { ...selectedFood.nutrients, fiberG: Number(value) } })} />
                <Field label="Sódio (mg)" type="number" value={selectedFood.nutrients.sodiumMg ?? ""} onChange={(value) => updateFood({ nutrients: { ...selectedFood.nutrients, sodiumMg: Number(value) } })} />
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                TBCA e Tucunduva entram como referências/fontes licenciáveis. O protótipo não incorpora automaticamente conteúdo protegido. Produtos industrializados podem ser cadastrados a partir do rótulo do fabricante com data e fonte registradas.
              </div>
            </section>
          </div>
        )}

        {tab === "recipes" && (
          <section className="space-y-5 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between"><div><h2 className="text-lg font-semibold">Editor de receita</h2><p className="text-sm text-zinc-500">Ingredientes sempre referenciam alimentos cadastrados.</p></div><button className="rounded-lg bg-zinc-950 px-3 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-950">+ Nova receita</button></div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Field label="Nome" value={recipe.name} onChange={(value) => setRecipe((current) => ({ ...current, name: value }))} />
              <Field label="Tempo (min)" type="number" value={recipe.prepTimeMinutes} onChange={(value) => setRecipe((current) => ({ ...current, prepTimeMinutes: Number(value) }))} />
              <Field label="Rendimento" type="number" value={recipe.yieldServings} onChange={(value) => setRecipe((current) => ({ ...current, yieldServings: Number(value) }))} />
              <Field label="Tags" value={recipe.tags.join(", ")} onChange={(value) => setRecipe((current) => ({ ...current, tags: value.split(",").map((tag) => tag.trim()).filter(Boolean) }))} />
            </div>
            <div><h3 className="mb-2 text-sm font-semibold">Ingredientes</h3>{recipe.ingredients.map((ingredient, index) => <div key={ingredient.id} className="mb-2 grid grid-cols-[1fr_140px] gap-2"><input value={ingredient.foodName} readOnly className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"/><input type="number" value={ingredient.grams} onChange={(e) => setRecipe((current) => ({ ...current, ingredients: current.ingredients.map((item, i) => i === index ? { ...item, grams: Number(e.target.value) } : item) }))} className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"/></div>)}</div>
            <label className="block"><span className="text-xs font-medium text-zinc-500">Modo de preparo</span><textarea value={recipe.instructions} onChange={(e) => setRecipe((current) => ({ ...current, instructions: e.target.value }))} className="mt-1 min-h-32 w-full rounded-lg border border-zinc-200 p-3 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-900"/></label>
          </section>
        )}

        {tab === "protocols" && (
          <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
            <section className="space-y-5 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start justify-between"><div><h2 className="text-lg font-semibold">{protocol.name}</h2><p className="text-sm text-zinc-500">Versão {protocol.version} · tudo editável e versionado.</p></div><button className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium dark:border-zinc-700">Criar nova versão</button></div>
              <Field label="Nome do protocolo" value={protocol.name} onChange={(value) => setProtocol((current) => ({ ...current, name: value }))} />
              <div><h3 className="mb-2 text-sm font-semibold">Fases</h3><div className="space-y-2">{protocol.phases.map((phase, index) => <div key={phase.id} className="grid gap-2 rounded-xl border border-zinc-200 p-3 md:grid-cols-[60px_1fr_130px] dark:border-zinc-700"><span className="flex items-center justify-center rounded-lg bg-zinc-100 text-sm font-semibold dark:bg-zinc-800">{index + 1}</span><input value={phase.name} onChange={(e) => setProtocol((current) => ({ ...current, phases: current.phases.map((item) => item.id === phase.id ? { ...item, name: e.target.value } : item) }))} className="bg-transparent text-sm font-medium outline-none"/><input type="number" value={phase.durationDays ?? ""} onChange={(e) => setProtocol((current) => ({ ...current, phases: current.phases.map((item) => item.id === phase.id ? { ...item, durationDays: Number(e.target.value) } : item) }))} className="rounded-lg bg-zinc-50 px-3 py-2 text-sm outline-none dark:bg-zinc-800"/></div>)}</div></div>
              <div><div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-semibold">Regras do motor</h3><button onClick={() => setProtocol((current) => ({ ...current, rules: [...current.rules, { id: `rule-${Date.now()}`, name: "Nova regra", effect: "prioritize", target: "", rationale: "", priority: 100, enabled: true }] }))} className="text-xs font-semibold text-emerald-700">+ Adicionar regra</button></div><div className="space-y-2">{protocol.rules.map((rule) => <div key={rule.id} className="grid gap-2 rounded-xl border border-zinc-200 p-3 lg:grid-cols-[1fr_130px_1fr_90px] dark:border-zinc-700"><input value={rule.name} onChange={(e) => setProtocol((current) => ({ ...current, rules: current.rules.map((item) => item.id === rule.id ? { ...item, name: e.target.value } : item) }))} className="bg-transparent text-sm font-medium outline-none"/><select value={rule.effect} onChange={(e) => setProtocol((current) => ({ ...current, rules: current.rules.map((item) => item.id === rule.id ? { ...item, effect: e.target.value as typeof item.effect } : item) }))} className="rounded-lg bg-zinc-50 px-2 py-2 text-sm dark:bg-zinc-800"><option value="allow">Permitir</option><option value="prioritize">Priorizar</option><option value="limit">Limitar</option><option value="exclude">Excluir</option><option value="require">Exigir</option></select><input value={rule.target} onChange={(e) => setProtocol((current) => ({ ...current, rules: current.rules.map((item) => item.id === rule.id ? { ...item, target: e.target.value } : item) }))} className="rounded-lg bg-zinc-50 px-3 py-2 text-sm outline-none dark:bg-zinc-800"/><input type="number" value={rule.priority} onChange={(e) => setProtocol((current) => ({ ...current, rules: current.rules.map((item) => item.id === rule.id ? { ...item, priority: Number(e.target.value) } : item) }))} className="rounded-lg bg-zinc-50 px-3 py-2 text-sm outline-none dark:bg-zinc-800"/></div>)}</div></div>
            </section>

            <aside className="space-y-3 rounded-xl border border-violet-200 bg-violet-50/60 p-4 dark:border-violet-900 dark:bg-violet-950/20">
              <div><p className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">Assistente de protocolo</p><h3 className="mt-1 font-semibold">Sugestões da IA</h3><p className="mt-1 text-xs leading-5 text-zinc-500">A IA propõe patches. Você aceita, edita ou rejeita. Nada altera o protocolo automaticamente.</p></div>
              {suggestions.filter((item) => item.status === "ai_suggested").map((item) => <div key={item.id} className="rounded-xl border border-violet-200 bg-white p-3 dark:border-violet-900 dark:bg-zinc-900"><p className="text-sm font-semibold">{item.title}</p><p className="mt-2 text-xs leading-5 text-zinc-500">{item.rationale}</p><div className="mt-3 rounded-lg bg-zinc-50 p-2 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{item.proposedChange}</div><div className="mt-3 flex gap-2"><button onClick={() => setSuggestions((current) => current.map((suggestion) => suggestion.id === item.id ? { ...suggestion, status: "accepted" } : suggestion))} className="rounded-md bg-violet-700 px-2.5 py-1.5 text-xs font-medium text-white">Aceitar</button><button className="rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs dark:border-zinc-700">Editar</button><button onClick={() => setSuggestions((current) => current.map((suggestion) => suggestion.id === item.id ? { ...suggestion, status: "rejected" } : suggestion))} className="rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs dark:border-zinc-700">Recusar</button></div></div>)}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
