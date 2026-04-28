import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WithdrawalStatus } from "@/generated/prisma";
import { z } from "zod";

const schema = z.object({
  status: z.nativeEnum(WithdrawalStatus),
  notes: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const withdrawal = await prisma.withdrawal.update({
    where: { id },
    data: {
      status: parsed.data.status,
      notes: parsed.data.notes,
      processedAt: parsed.data.status === "PAID" ? new Date() : undefined,
    },
  });

  return NextResponse.json(withdrawal);
}
