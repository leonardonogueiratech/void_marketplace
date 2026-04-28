import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

interface Params { params: Promise<{ id: string }> }

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  story: z.string().optional(),
  price: z.coerce.number().positive(),
  comparePrice: z.coerce.number().optional().nullable(),
  stock: z.coerce.number().int().min(0),
  sku: z.string().optional(),
  weight: z.coerce.number().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]),
  tags: z.string().optional(),
  materials: z.string().optional(),
  imageUrls: z.array(z.string().url()).default([]),
});

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { artisan: true },
    });
    if (!product || product.artisan.userId !== session.user.id) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const body = await req.json();
    const data = schema.parse(body);

    const tags = data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const materials = data.materials ? data.materials.split(",").map((m) => m.trim()).filter(Boolean) : [];

    // Replace all images with the new set
    await prisma.productImage.deleteMany({ where: { productId: id } });
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
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

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao atualizar produto." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { artisan: true } });
  if (!product || product.artisan.userId !== session.user.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
