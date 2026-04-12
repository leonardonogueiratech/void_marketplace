import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  amount: z.number().min(50),
  pixKey: z.string().min(5),
  artisanId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const artisan = await prisma.artisanProfile.findUnique({
      where: { id: data.artisanId, userId: session.user.id },
    });
    if (!artisan) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });

    const withdrawal = await prisma.withdrawal.create({
      data: {
        artisanId: data.artisanId,
        amount: data.amount,
        pixKey: data.pixKey,
        status: "PENDING",
      },
    });

    return NextResponse.json(withdrawal, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const artisan = await prisma.artisanProfile.findUnique({ where: { userId: session.user.id } });
  if (!artisan) return NextResponse.json([]);

  const withdrawals = await prisma.withdrawal.findMany({
    where: { artisanId: artisan.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(withdrawals);
}
