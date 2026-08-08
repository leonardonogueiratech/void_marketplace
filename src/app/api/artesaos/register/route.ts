import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { slugify } from "@/lib/utils";
import { sendAdminNewArtisanApplication, sendArtisanApplicationReceived } from "@/lib/email";
import { z } from "zod";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  storeName: z.string().min(2),
  bio: z.string().min(10),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  cpfCnpj: z.string().refine((v) => {
    const digits = v.replace(/\D/g, "");
    return digits.length === 11 || digits.length === 14;
  }, "CPF ou CNPJ inválido."),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória."),
  zipCode: z.string().min(8, "CEP inválido."),
  addressNumber: z.string().optional(),
  incomeValue: z.number().positive("Renda mensal inválida."),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  plan: z.enum(["FREE", "BASIC", "PRO"]).default("FREE"),
  termsAccepted: z.literal(true, { message: "Você precisa aceitar os Termos de Adesão." }),
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

    const approvalToken = randomBytes(32).toString("hex");

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
            cpfCnpj: data.cpfCnpj,
            birthDate: new Date(data.birthDate),
            zipCode: data.zipCode.replace(/\D/g, ""),
            addressNumber: data.addressNumber,
            incomeValue: data.incomeValue,
            whatsapp: data.whatsapp,
            instagram: data.instagram,
            status: "PENDING",
            termsAcceptedAt: new Date(),
            approvalToken,
            subscription: {
              create: { plan: data.plan, status: "ACTIVE" },
            },
          },
        },
      },
    });

    void sendArtisanApplicationReceived({
      to: data.email,
      artisanName: data.name,
      storeName: data.storeName,
    });

    void sendAdminNewArtisanApplication({
      artisanName: data.name,
      storeName: data.storeName,
      email: data.email,
      plan: data.plan,
      city: data.city,
      state: data.state,
      approveUrl: `${BASE_URL}/aprovar-artesao/${approvalToken}`,
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
