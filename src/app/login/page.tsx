import { signInWithPassword } from "@/app/actions/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const message = params.error === "missing"
    ? "Informe e-mail e senha."
    : params.error === "invalid"
      ? "Credenciais inválidas."
      : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
      <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">NutriOS · acesso profissional</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Entrar no workspace clínico</h1>
        <p className="mt-2 text-sm text-zinc-500">A sessão será validada pelo Supabase Auth e o acesso aos dados continuará restrito ao tenant do profissional.</p>
        <form action={signInWithPassword} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">E-mail<input name="email" type="email" autoComplete="email" required className="mt-1 w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:border-zinc-500 dark:border-zinc-700" /></label>
          <label className="block text-sm font-medium">Senha<input name="password" type="password" autoComplete="current-password" required className="mt-1 w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:border-zinc-500 dark:border-zinc-700" /></label>
          {message ? <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">{message}</p> : null}
          <button className="w-full rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-950">Entrar</button>
        </form>
      </section>
    </main>
  );
}
