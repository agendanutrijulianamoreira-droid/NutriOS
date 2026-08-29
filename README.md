# NutriOS — Starter Vertical Slice

Primeira fatia funcional da arquitetura do NutriOS.

## O que já está implementado

- Next.js 15 + React + TypeScript + Tailwind
- Estrutura modular por domínio
- Página de consulta ao vivo
- Cronômetro com meta de 15 minutos
- amarelo quando faltam <= 10 minutos
- vermelho quando faltam <= 5 minutos
- aviso visual + som + vibração ao atingir 15 minutos
- gravação que continua após o alerta
- captura do microfone com MediaRecorder
- chunks locais de áudio a cada 5 segundos
- persistência offline via IndexedDB/Dexie
- state machine de consulta
- contratos desacoplados para transcrição
- contratos desacoplados para IA clínica
- schema Prisma inicial multi-tenant
- proveniência de sugestões da IA por segmento de transcrição
- audit log inicial

## O que ainda não está conectado

- Supabase Auth
- RLS
- persistência server-side real
- OpenAI Realtime / STT
- diarização real
- sincronização dos chunks offline
- Structured Outputs para anamnese
- autosave dos campos clínicos

Esses pontos formam a próxima fatia de implementação.

## Executar localmente

```bash
cp .env.example .env.local
npm install
npm run prisma:generate
npm run dev
```

Acesse:

```text
http://localhost:3000/consultations/demo
```

## Princípio arquitetural

A camada de IA não escreve diretamente no prontuário. Ela gera `ClinicalSuggestion` com status `AI_SUGGESTED`, evidências e proveniência. O profissional aceita, edita ou rejeita.

Da mesma forma, o futuro Nutrition Engine não permitirá que o LLM gere alimentos ou quantidades livremente. O LLM ficará antes e depois do motor determinístico, nunca no lugar dele.
