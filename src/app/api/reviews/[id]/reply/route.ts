import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  reply: z.string().min(1).max(1000),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;

  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!artisan) {
    return NextResponse.json({ error: "Perfil de artesão não encontrado." }, { status: 403 });
  }

  const review = await prisma.review.findUnique({
    where: { id },
    select: { artisanId: true },
  });
  if (!review) {
    return NextResponse.json({ error: "Avaliação não encontrada." }, { status: 404 });
  }
  if (review.artisanId !== artisan.id) {
    return NextResponse.json({ error: "Sem permissão para responder esta avaliação." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  await prisma.review.update({
    where: { id },
    data: { reply: parsed.data.reply.trim() },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;

  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!artisan) {
    return NextResponse.json({ error: "Perfil não encontrado." }, { status: 403 });
  }

  const review = await prisma.review.findUnique({ where: { id }, select: { artisanId: true } });
  if (!review || review.artisanId !== artisan.id) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await prisma.review.update({ where: { id }, data: { reply: null } });
  return NextResponse.json({ ok: true });
}
