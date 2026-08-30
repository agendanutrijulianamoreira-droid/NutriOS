import { NextResponse } from "next/server";

export async function GET() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  const databaseConfigured = Boolean(process.env.DATABASE_URL);

  const ready = supabaseConfigured && databaseConfigured;

  return NextResponse.json(
    {
      status: ready ? "ready" : "degraded",
      supabaseConfigured,
      databaseConfigured,
      timestamp: new Date().toISOString(),
    },
    { status: ready ? 200 : 503 },
  );
}
