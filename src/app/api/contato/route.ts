import { prisma } from "@/lib/prisma";
import { sendContactNotification } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }

    const data = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    };

    await prisma.contactMessage.create({ data });

    // Notifica admin por email (não bloqueia resposta se falhar)
    sendContactNotification(data).catch(console.error);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/contato]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
