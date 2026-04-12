import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/dashboard/product-form";

export default async function NewProductPage() {
  const session = await auth();
  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId: session!.user.id },
  });

  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Novo produto</h1>
      <ProductForm artisanId={artisan!.id} categories={categories} />
    </div>
  );
}
