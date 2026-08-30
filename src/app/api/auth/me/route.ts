import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSupabaseUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { user } = await requireSupabaseUser();

    const professional = await prisma.professional.findUnique({
      where: { authUserId: user.id },
      select: {
        id: true,
        name: true,
        tenantId: true,
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "authenticated_user_not_linked_to_professional" },
        { status: 403 },
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email ?? null,
      },
      professional,
    });
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}
