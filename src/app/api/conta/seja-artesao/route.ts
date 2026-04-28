import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  storeName: z.string().min(2, "Nome da loja deve ter pelo menos 2 caracteres."),
  bio: z.string().min(10, "Conte um pouco mais sobre você (mínimo 10 caracteres)."),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  plan: z.enum(["FREE", "BASIC", "PRO"]).default("FREE"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Você precisa estar logado." }, { status: 401 });
  }

  if (session.user.role === "ARTISAN") {
    return NextResponse.json({ error: "Você já é um artesão." }, { status: 400 });
  }

  if (session.user.role === "ADMIN") {
    return NextResponse.json({ error: "Conta admin não pode se tornar artesão." }, { status: 400 });
  }

  const existing = await prisma.artisanProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) {
    return NextResponse.json({ error: "Você já possui um perfil de artesão." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const baseSlug = slugify(data.storeName);
    let slug = baseSlug;
    let count = 0;
    while (await prisma.artisanProfile.findUnique({ where: { slug } })) {
      count++;
      slug = `${baseSlug}-${count}`;
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { role: "ARTISAN" },
      }),
      prisma.artisanProfile.create({
        data: {
          userId: session.user.id,
          storeName: data.storeName,
          slug,
          bio: data.bio,
          city: data.city,
          state: data.state,
          whatsapp: data.whatsapp,
          instagram: data.instagram,
          status: "PENDING",
          subscription: {
            create: { plan: data.plan, status: "ACTIVE" },
          },
        },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
