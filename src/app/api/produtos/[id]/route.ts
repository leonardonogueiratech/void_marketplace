import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";

interface Params { params: Promise<{ id: string }> }

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

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const story = formData.get("story") as string;
    const price = parseFloat(formData.get("price") as string);
    const comparePrice = formData.get("comparePrice") ? parseFloat(formData.get("comparePrice") as string) : null;
    const stock = parseInt(formData.get("stock") as string);
    const sku = formData.get("sku") as string;
    const weight = formData.get("weight") ? parseFloat(formData.get("weight") as string) : null;
    const categoryId = formData.get("categoryId") as string || null;
    const status = formData.get("status") as string;
    const tagsRaw = formData.get("tags") as string;
    const materialsRaw = formData.get("materials") as string;
    const tags: string[] = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const materials: string[] = materialsRaw ? materialsRaw.split(",").map((m) => m.trim()).filter(Boolean) : [];

    // New images
    const imageFiles = formData.getAll("images") as File[];
    for (const file of imageFiles) {
      if (file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
        const url = await uploadImage(base64, `artesao/${product.artisanId}/produtos`);
        await prisma.productImage.create({ data: { productId: id, url, order: 99 } });
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { name, description: description || null, story: story || null, price, comparePrice, stock, sku: sku || null, weight, categoryId, status: status as "DRAFT" | "ACTIVE" | "INACTIVE", tags, materials },
    });

    return NextResponse.json(updated);
  } catch (err) {
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
