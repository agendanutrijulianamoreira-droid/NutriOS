import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6">
      <span className="text-sm font-medium text-zinc-500">NutriOS</span>
      <h1 className="mt-3 max-w-3xl text-5xl font-semibold tracking-tight">
        Consulta clínica com menos operação e mais decisão profissional.
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
        Protótipo navegável da consulta e da biblioteca clínica que alimentará o Nutrition Engine.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/consultations/demo"
          className="inline-flex rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-950"
        >
          Abrir consulta demo
        </Link>
        <Link
          href="/nutrition-library"
          className="inline-flex rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Abrir biblioteca nutricional
        </Link>
      </div>
    </main>
  );
}
