export default function InfrastructurePage() {
  const supabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const databaseUrl = Boolean(process.env.DATABASE_URL);
  const ready = supabaseUrl && publishableKey && databaseUrl;

  const items = [
    ["Supabase URL", supabaseUrl],
    ["Publishable key", publishableKey],
    ["PostgreSQL / Prisma", databaseUrl],
    ["SSR Auth", true],
    ["Tenant authorization", true],
    ["Plan versioning", true],
    ["Clinical record snapshot", true],
    ["Audit log", true],
    ["RLS policy bundle", true],
  ] as const;

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">NutriOS · Edição 9</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Persistência e infraestrutura clínica</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-500">Auth, Prisma, versionamento, prontuário e auditoria preparados para um projeto Supabase dedicado.</p>
          </div>
          <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${ready ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
            {ready ? "BACKEND CONFIGURADO" : "AGUARDANDO CREDENCIAIS DO PROJETO"}
          </span>
        </div>

        <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(([label, ok]) => (
            <div key={label} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="text-xs text-zinc-500">{label}</div>
              <div className={`mt-2 text-sm font-semibold ${ok ? "text-emerald-600" : "text-amber-600"}`}>{ok ? "Pronto" : "Pendente"}</div>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-semibold">Fluxo persistente de aprovação</h2>
          <div className="mt-4 grid gap-2 text-sm text-zinc-600 dark:text-zinc-300 md:grid-cols-5">
            {["Sessão Supabase", "Validação do tenant", "Nova versão do plano", "Snapshot no prontuário", "AuditLog"].map((item, index) => (
              <div key={item} className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950"><span className="text-xs text-zinc-400">{index + 1}</span><div className="mt-1 font-medium">{item}</div></div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-zinc-950 p-5 text-white dark:bg-zinc-100 dark:text-zinc-950">
          <h2 className="font-semibold">Ativação segura</h2>
          <p className="mt-2 text-sm leading-6 opacity-70">O NutriOS não reutiliza automaticamente projetos Supabase existentes. Para dados clínicos, o projeto dedicado deve ser escolhido/criado explicitamente antes de aplicar a migração e as políticas RLS.</p>
        </section>
      </div>
    </main>
  );
}
