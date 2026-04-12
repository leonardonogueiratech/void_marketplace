import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";
import { z } from "zod";

const schema = z.object({
  storeName: z.string().min(2, "Nome da loja deve ter ao menos 2 caracteres."),
  bio: z.string().min(10, "Bio deve ter ao menos 10 caracteres."),
  story: z.string().optional(),
  location: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  website: z.string().url("URL inválida.").optional().or(z.literal("")),
  categoryIds: z.array(z.string()).optional(),
});

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const artisan = await prisma.artisanProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!artisan) {
      return NextResponse.json({ error: "Perfil de artesão não encontrado." }, { status: 404 });
    }

    const formData = await req.formData();

    // Parse text fields
    const raw = {
      storeName: formData.get("storeName") as string,
      bio: formData.get("bio") as string,
      story: (formData.get("story") as string) || undefined,
      location: (formData.get("location") as string) || undefined,
      city: (formData.get("city") as string) || undefined,
      state: (formData.get("state") as string) || undefined,
      whatsapp: (formData.get("whatsapp") as string) || undefined,
      instagram: (formData.get("instagram") as string) || undefined,
      website: (formData.get("website") as string) || undefined,
      categoryIds: formData.getAll("categoryIds") as string[],
    };

    const data = schema.parse(raw);

    // Upload logo se enviada
    let logoImage = artisan.logoImage;
    const logoFile = formData.get("logo") as File | null;
    if (logoFile && logoFile.size > 0) {
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const base64 = `data:${logoFile.type};base64,${buffer.toString("base64")}`;
      logoImage = await uploadImage(base64, `artesao/${artisan.id}/logo`);
    }

    // Upload banner se enviado
    let bannerImage = artisan.bannerImage;
    const bannerFile = formData.get("banner") as File | null;
    if (bannerFile && bannerFile.size > 0) {
      const buffer = Buffer.from(await bannerFile.arrayBuffer());
      const base64 = `data:${bannerFile.type};base64,${buffer.toString("base64")}`;
      bannerImage = await uploadImage(base64, `artesao/${artisan.id}/banner`);
    }

    // Atualizar perfil
    const updated = await prisma.artisanProfile.update({
      where: { id: artisan.id },
      data: {
        storeName: data.storeName,
        bio: data.bio,
        story: data.story ?? null,
        location: data.location ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        whatsapp: data.whatsapp ?? null,
        instagram: data.instagram ?? null,
        website: data.website || null,
        logoImage,
        bannerImage,
      },
    });

    // Atualizar categorias se enviadas
    if (data.categoryIds !== undefined) {
      await prisma.artisanCategory.deleteMany({ where: { artisanId: artisan.id } });

      if (data.categoryIds.length > 0) {
        await prisma.artisanCategory.createMany({
          data: data.categoryIds.map((categoryId) => ({
            artisanId: artisan.id,
            categoryId,
          })),
        });
      }
    }

    return NextResponse.json({ ok: true, artisan: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 }
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao atualizar perfil." }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      categories: { include: { category: true } },
      subscription: true,
    },
  });

  if (!artisan) {
    return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });
  }

  return NextResponse.json(artisan);
}
