import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/dashboard/product-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const session = await auth();
  const { id } = await params;

  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId: session!.user.id },
  });

  if (!artisan) notFound();

  const [categories, product] = await Promise.all([
    prisma.category.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    }),
    prisma.product.findFirst({
      where: {
        id,
        artisanId: artisan.id,
      },
    }),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Editar produto</h1>
      <ProductForm artisanId={artisan.id} categories={categories} product={product} />
    </div>
  );
}
