import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  label: z.string().optional(),
  street: z.string().min(1, "Rua obrigatória."),
  number: z.string().min(1, "Número obrigatório."),
  complement: z.string().optional(),
  district: z.string().min(1, "Bairro obrigatório."),
  city: z.string().min(1, "Cidade obrigatória."),
  state: z.string().length(2, "UF deve ter 2 caracteres."),
  zipCode: z.string().min(8, "CEP inválido."),
  isDefault: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(addresses);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  try {
    const body = await req.json();
    const data = schema.parse(body);

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: { ...data, userId: session.user.id },
    });

    return NextResponse.json(address, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao salvar endereço." }, { status: 500 });
  }
}
