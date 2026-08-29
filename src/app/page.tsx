import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6">
      <span className="text-sm font-medium text-zinc-500">NutriOS</span>
      <h1 className="mt-3 max-w-3xl text-5xl font-semibold tracking-tight">
        Consulta clínica com menos operação e mais decisão profissional.
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
        Protótipo navegável da consulta, biblioteca, Nutrition Engine, plano clínico e editor semanal inteligente.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/consultations/demo" className="inline-flex rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-950">Consulta demo</Link>
        <Link href="/nutrition-library" className="inline-flex rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-800 dark:border-zinc-700 dark:text-zinc-200">Biblioteca nutricional</Link>
        <Link href="/nutrition-engine-v2" className="inline-flex rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">Nutrition Engine v2</Link>
        <Link href="/meal-plan" className="inline-flex rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">Plano clínico</Link>
        <Link href="/weekly-plan" className="inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">Editor Semanal · Edição 7</Link>
      </div>
    </main>
  );
}
