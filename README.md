# NutriOS

Sistema operacional clínico para consulta nutricional, prontuário, motor nutricional determinístico e prescrição semanal.

## Estado atual

- Next.js 15 + React + TypeScript + Tailwind
- Supabase Auth SSR
- PostgreSQL/Supabase dedicado (`NutriOS`, região `sa-east-1`)
- Prisma para persistência server-side
- arquitetura multi-tenant: Tenant → Professional → Patient
- RLS ativada nas tabelas expostas
- profissional inicial vinculado ao Supabase Auth
- versionamento de plano alimentar e prontuário
- auditoria de aprovação clínica
- CI com Prisma generate + typecheck + build
- endpoint `/api/health` para readiness de produção
- endpoint autenticado `/api/auth/me` para verificar Auth → Professional → Tenant

## Variáveis de ambiente

Copie `.env.example` e configure:

```bash
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://sqxodorfqbghbuvwluor.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="..."
OPENAI_API_KEY="..."
```

`DATABASE_URL` e `OPENAI_API_KEY` são segredos server-side. Nunca use prefixo `NEXT_PUBLIC_` para esses valores.

## Vercel

Importe o repositório `agendanutrijulianamoreira-droid/NutriOS` como projeto Next.js e cadastre as variáveis acima nos ambientes Production e Preview. Após o deploy:

1. abra `/api/health` e confirme `status: ready`;
2. faça login em `/login`;
3. abra `/api/auth/me` autenticado e confirme o vínculo do profissional com o tenant correto;
4. só então habilite dados clínicos reais no fluxo de consulta.

## Executar localmente

```bash
cp .env.example .env.local
npm install
npm run prisma:generate
npm run dev
```

## Princípio arquitetural

A IA não escreve diretamente no prontuário nem gera livremente alimentos ou quantidades. Ela interpreta e apresenta; regras clínicas e cálculos nutricionais permanecem em motores determinísticos e são submetidos à aprovação profissional.
