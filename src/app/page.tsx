import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6">
      <span className="text-sm font-medium text-zinc-500">NutriOS</span>
      <h1 className="mt-3 max-w-3xl text-5xl font-semibold tracking-tight">
        Consulta clínica com menos operação e mais decisão profissional.
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
        Primeiro corte funcional: consulta ao vivo, cronômetro, gravação local e transcrição preparada para sincronização.
      </p>
      <div className="mt-8">
        <Link
          href="/consultations/demo"
          className="inline-flex rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-950"
        >
          Abrir consulta demo
        </Link>
      </div>
    </main>
  );
}
