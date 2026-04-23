import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres."),
  phone: z.string().optional(),
});

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: data.name, phone: data.phone ?? null },
      select: { id: true, name: true, email: true, phone: true },
    });

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao atualizar." }, { status: 500 });
  }
}
