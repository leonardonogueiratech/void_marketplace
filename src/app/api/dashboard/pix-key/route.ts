import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  pixKey: z.string().min(5, "Chave PIX inválida."),
});

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  try {
    const body = await req.json();
    const { pixKey } = schema.parse(body);

    const artisan = await prisma.artisanProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!artisan) return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });

    await prisma.artisanProfile.update({
      where: { id: artisan.id },
      data: { pixKey },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
