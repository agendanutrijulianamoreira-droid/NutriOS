"use client";

import { useMemo, useState } from "react";
import type { ClinicalField, ConsultationStageId, ReviewStatus } from "../domain/consultation-workflow";

const statusLabel: Record<ReviewStatus, string> = {
  confirmed: "Confirmado",
  review: "Revisar",
  pending: "Pendente",
};

const statusClass: Record<ReviewStatus, string> = {
  confirmed: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  review: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  pending: "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

export function AnamnesisPanel({
  fields,
  onChange,
}: {
  fields: ClinicalField[];
  onChange: (id: string, value: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {fields.map((field) => (
        <div key={field.id} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor={field.id} className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {field.label}
            </label>
            <span className={`rounded-full border px-2 py-1 text-[11px] font-medium ${statusClass[field.status]}`}>
              {statusLabel[field.status]}
            </span>
          </div>
          <textarea
            id={field.id}
            value={field.value}
            onChange={(event) => onChange(field.id, event.target.value)}
            className="min-h-20 w-full resize-none bg-transparent text-sm leading-6 text-zinc-700 outline-none placeholder:text-zinc-400 dark:text-zinc-300"
          />
        </div>
      ))}
    </div>
  );
}

function NumberField({ label, value, unit }: { label: string; value: string; unit: string }) {
  const [current, setCurrent] = useState(value);
  return (
    <label className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <span className="block text-xs font-medium text-zinc-500">{label}</span>
      <div className="mt-2 flex items-end gap-2">
        <input
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
          inputMode="decimal"
          className="w-full bg-transparent text-2xl font-semibold outline-none"
        />
        <span className="pb-1 text-xs text-zinc-500">{unit}</span>
      </div>
    </label>
  );
}

function AnthropometryPanel() {
  const [weight, setWeight] = useState("78.4");
  const [height, setHeight] = useState("1.64");
  const bmi = useMemo(() => {
    const weightNumber = Number(weight.replace(",", "."));
    const heightNumber = Number(height.replace(",", "."));
    if (!weightNumber || !heightNumber) return "—";
    return (weightNumber / heightNumber ** 2).toFixed(1);
  }, [height, weight]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <span className="block text-xs font-medium text-zinc-500">Peso</span>
          <div className="mt-2 flex items-end gap-2">
            <input value={weight} onChange={(event) => setWeight(event.target.value)} className="w-full bg-transparent text-2xl font-semibold outline-none" />
            <span className="pb-1 text-xs text-zinc-500">kg</span>
          </div>
        </label>
        <label className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <span className="block text-xs font-medium text-zinc-500">Altura</span>
          <div className="mt-2 flex items-end gap-2">
            <input value={height} onChange={(event) => setHeight(event.target.value)} className="w-full bg-transparent text-2xl font-semibold outline-none" />
            <span className="pb-1 text-xs text-zinc-500">m</span>
          </div>
        </label>
        <div className="rounded-xl border border-zinc-200 bg-zinc-950 p-4 text-white shadow-sm dark:border-zinc-700 dark:bg-zinc-100 dark:text-zinc-950">
          <span className="block text-xs font-medium opacity-60">IMC calculado</span>
          <div className="mt-2 text-2xl font-semibold">{bmi}</div>
          <span className="mt-1 block text-xs opacity-60">kg/m²</span>
        </div>
        <NumberField label="Cintura" value="88" unit="cm" />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <NumberField label="Gordura corporal" value="36.8" unit="%" />
        <NumberField label="Massa muscular" value="28.4" unit="kg" />
        <NumberField label="Água corporal" value="45.2" unit="%" />
      </div>

      <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700">
        A interpretação automática ficará conectada ao motor clínico posteriormente. Os cálculos antropométricos básicos permanecem determinísticos.
      </div>
    </div>
  );
}

function DietaryRecallPanel() {
  const [rows, setRows] = useState([
    { id: "r1", time: "07:00", meal: "Café da manhã", foods: "Café com leite + pão francês com manteiga", notes: "Come com pressa" },
    { id: "r2", time: "12:30", meal: "Almoço", foods: "Arroz, feijão, frango e salada", notes: "Restaurante por quilo" },
    { id: "r3", time: "20:30", meal: "Jantar", foods: "Sanduíche ou delivery", notes: "Maior fome do dia" },
  ]);

  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div key={row.id} className="grid gap-2 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm md:grid-cols-[100px_170px_1fr_1fr] dark:border-zinc-800 dark:bg-zinc-900">
          <input value={row.time} onChange={(e) => setRows((current) => current.map((item, i) => i === index ? { ...item, time: e.target.value } : item))} className="rounded-md bg-zinc-50 px-3 py-2 text-sm outline-none dark:bg-zinc-800" />
          <input value={row.meal} onChange={(e) => setRows((current) => current.map((item, i) => i === index ? { ...item, meal: e.target.value } : item))} className="rounded-md bg-zinc-50 px-3 py-2 text-sm outline-none dark:bg-zinc-800" />
          <input value={row.foods} onChange={(e) => setRows((current) => current.map((item, i) => i === index ? { ...item, foods: e.target.value } : item))} className="rounded-md bg-zinc-50 px-3 py-2 text-sm outline-none dark:bg-zinc-800" />
          <input value={row.notes} onChange={(e) => setRows((current) => current.map((item, i) => i === index ? { ...item, notes: e.target.value } : item))} className="rounded-md bg-zinc-50 px-3 py-2 text-sm outline-none dark:bg-zinc-800" />
        </div>
      ))}
      <button
        onClick={() => setRows((current) => [...current, { id: crypto.randomUUID(), time: "", meal: "", foods: "", notes: "" }])}
        className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        + Adicionar refeição
      </button>
    </div>
  );
}

function DiagnosisPanel() {
  const suggestions = [
    ["Distribuição proteica possivelmente inadequada", "Café da manhã e lanche sem fonte proteica consistente."],
    ["Baixa ingestão hídrica relatada", "Ingestão referida próxima de 1 litro/dia."],
    ["Maior vulnerabilidade alimentar no período noturno", "Jantar tardio associado a maior fome e maior uso de delivery."],
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
        Sugestões para revisão profissional. Esta etapa não define diagnóstico automaticamente.
      </div>
      {suggestions.map(([title, evidence]) => (
        <div key={title} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-zinc-500">Evidência: {evidence}</p>
          <div className="mt-4 flex gap-2">
            <button className="rounded-md bg-zinc-950 px-3 py-2 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-950">Aceitar</button>
            <button className="rounded-md border border-zinc-200 px-3 py-2 text-xs font-medium dark:border-zinc-700">Editar</button>
            <button className="rounded-md px-3 py-2 text-xs font-medium text-zinc-500">Recusar</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ConductPanel() {
  const fields = [
    ["Fase do tratamento", "Organizando a casa"],
    ["Meta calórica", "1600 kcal"],
    ["Proteína", "120 g"],
    ["Carboidrato", "150 g"],
    ["Gordura", "58 g"],
    ["Número de refeições", "5"],
    ["Preferências", "Preparações rápidas, frutas e iogurte"],
    ["Restrições", "Sem restrições confirmadas"],
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        {fields.map(([label, value]) => (
          <label key={label} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <span className="block text-xs font-medium text-zinc-500">{label}</span>
            <input defaultValue={value} className="mt-2 w-full bg-transparent text-sm font-medium outline-none" />
          </label>
        ))}
      </div>
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
        <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Critérios prontos para o Nutrition Engine</p>
        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">Nesta edição, o sistema apenas estrutura os critérios. Nenhum plano alimentar é gerado por IA.</p>
      </div>
    </div>
  );
}

export function ConsultationStagePanel({
  stage,
  anamnesisFields,
  onAnamnesisChange,
}: {
  stage: ConsultationStageId;
  anamnesisFields: ClinicalField[];
  onAnamnesisChange: (id: string, value: string) => void;
}) {
  if (stage === "anamnesis") return <AnamnesisPanel fields={anamnesisFields} onChange={onAnamnesisChange} />;
  if (stage === "anthropometry") return <AnthropometryPanel />;
  if (stage === "dietary-recall") return <DietaryRecallPanel />;
  if (stage === "diagnosis") return <DiagnosisPanel />;
  return <ConductPanel />;
}
