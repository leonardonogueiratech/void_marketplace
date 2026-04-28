import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  artisanId: z.string(),
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres."),
  description: z.string().optional(),
  story: z.string().optional(),
  price: z.coerce.number().positive("Preço deve ser maior que zero."),
  comparePrice: z.coerce.number().optional().nullable(),
  stock: z.coerce.number().int().min(0),
  sku: z.string().optional(),
  weight: z.coerce.number().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]).default("DRAFT"),
  tags: z.string().optional(),
  materials: z.string().optional(),
  imageUrls: z.array(z.string().url()).default([]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const artisan = await prisma.artisanProfile.findUnique({
      where: { id: data.artisanId, userId: session.user.id },
      include: { subscription: true },
    });
    if (!artisan) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });

    const tags = data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const materials = data.materials ? data.materials.split(",").map((m) => m.trim()).filter(Boolean) : [];

    const baseSlug = slugify(data.name);
    let slug = baseSlug;
    let count = 0;
    while (await prisma.product.findUnique({ where: { slug } })) {
      count++;
      slug = `${baseSlug}-${count}`;
    }

    const product = await prisma.product.create({
      data: {
        artisanId: data.artisanId,
        name: data.name,
        slug,
        description: data.description || null,
        story: data.story || null,
        price: data.price,
        comparePrice: data.comparePrice ?? null,
        stock: data.stock,
        sku: data.sku || null,
        weight: data.weight ?? null,
        categoryId: data.categoryId ?? null,
        status: data.status,
        tags,
        materials,
        images: {
          create: data.imageUrls.map((url, i) => ({ url, order: i })),
        },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao criar produto." }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const orders = await prisma.product.findMany({
    where: { artisan: { userId: session.user.id } },
    include: { images: { take: 1, orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
