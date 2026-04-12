import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  try {
    const formData = await req.formData();
    const artisanId = formData.get("artisanId") as string;

    // Verify ownership
    const artisan = await prisma.artisanProfile.findUnique({
      where: { id: artisanId, userId: session.user.id },
      include: { subscription: true },
    });
    if (!artisan) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });

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

    const baseSlug = slugify(name);
    let slug = baseSlug;
    let count = 0;
    while (await prisma.product.findUnique({ where: { slug } })) {
      count++;
      slug = `${baseSlug}-${count}`;
    }

    // Upload images
    const imageFiles = formData.getAll("images") as File[];
    const uploadedImages: string[] = [];
    for (const file of imageFiles) {
      if (file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
        const url = await uploadImage(base64, `artesao/${artisanId}/produtos`);
        uploadedImages.push(url);
      }
    }

    const product = await prisma.product.create({
      data: {
        artisanId,
        name,
        slug,
        description: description || null,
        story: story || null,
        price,
        comparePrice,
        stock,
        sku: sku || null,
        weight,
        categoryId,
        status: status as "DRAFT" | "ACTIVE" | "INACTIVE",
        tags,
        materials,
        images: {
          create: uploadedImages.map((url, i) => ({ url, order: i })),
        },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao criar produto." }, { status: 500 });
  }
}
