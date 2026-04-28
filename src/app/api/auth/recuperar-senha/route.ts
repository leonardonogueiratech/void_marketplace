import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("E-mail inválido."),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, password: true },
  });

  // Always return 200 to avoid email enumeration
  if (!user || !user.password) {
    return NextResponse.json({ ok: true });
  }

  // Invalidate previous tokens
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  // Send email (dynamic import to avoid top-level await issues)
  const { sendPasswordReset } = await import("@/lib/email");
  void sendPasswordReset({ to: email, name: user.name ?? "usuário", token });

  return NextResponse.json({ ok: true });
}
