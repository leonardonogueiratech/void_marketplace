import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  action: z.enum(["approve", "reject", "suspend"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { action } = schema.parse(body);

    const statusMap = { approve: "APPROVED", reject: "REJECTED", suspend: "SUSPENDED" } as const;

    const artisan = await prisma.artisanProfile.update({
      where: { id },
      data: { status: statusMap[action] },
      include: { user: { select: { name: true, email: true } } },
    });

    return NextResponse.json({ ok: true, artisan });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao atualizar." }, { status: 500 });
  }
}
