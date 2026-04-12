import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  storeName: z.string().min(2),
  bio: z.string().min(10),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  plan: z.enum(["FREE", "BASIC", "PRO"]).default("FREE"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "Email já cadastrado." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(data.password, 12);
    const baseSlug = slugify(data.storeName);

    // Ensure unique slug
    let slug = baseSlug;
    let count = 0;
    while (await prisma.artisanProfile.findUnique({ where: { slug } })) {
      count++;
      slug = `${baseSlug}-${count}`;
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed,
        role: "ARTISAN",
        artisanProfile: {
          create: {
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
        },
      },
    });

    return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
