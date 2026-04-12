import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CategoryCard } from "@/components/marketplace/category-card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Categorias",
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    include: {
      _count: {
        select: {
          products: {
            where: { status: "ACTIVE" },
          },
        },
      },
    },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mb-8">
        <Badge variant="secondary" className="mb-3">
          Navegue por interesse
        </Badge>
        <h1 className="text-3xl font-bold text-neutral-900">Categorias</h1>
        <p className="mt-2 text-muted-foreground">
          Explore o marketplace por tipo de produto, estilo e técnica artesanal.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          Nenhuma categoria disponível no momento.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <div key={category.id} className="space-y-2">
              <CategoryCard category={category} />
              <div className="px-1">
                <p className="font-medium text-neutral-900">{category.name}</p>
                <p className="text-sm text-muted-foreground">
                  {category._count.products} produto(s)
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
