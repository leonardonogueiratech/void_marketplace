import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReplyNotification } from "@/lib/email";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  // Se veio com reply, salva resposta e envia email
  if (body.reply?.trim()) {
    const msg = await prisma.contactMessage.findUnique({ where: { id } });
    if (!msg) return NextResponse.json({ error: "Mensagem não encontrada." }, { status: 404 });

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { reply: body.reply.trim(), repliedAt: new Date(), read: true },
    });

    sendReplyNotification({
      to: msg.email,
      clientName: msg.name,
      subject: msg.subject,
      originalMessage: msg.message,
      reply: body.reply.trim(),
      token: updated.token,
    }).catch(console.error);

    return NextResponse.json({ ok: true });
  }

  // Sem reply = apenas marcar como lida
  await prisma.contactMessage.update({ where: { id }, data: { read: true } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }
  const { id } = await params;
  await prisma.contactMessage.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
