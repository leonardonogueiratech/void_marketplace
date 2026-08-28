import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CategoryCard } from "@/components/marketplace/category-card";

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
            where: { status: "ACTIVE", artisan: { status: "APPROVED" } },
          },
        },
      },
    },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <div className="min-h-screen bg-[#f2ede0]">
      {/* Header — creme com acento verde, alinhado ao padrão de /produtos */}
      <div className="bg-[#f2ede0] border-b border-[#071a33]/8 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#7c9f61] mb-1">Navegue</p>
          <h1 className="text-3xl font-bold uppercase text-[#071a33]">Categorias</h1>
          <p className="mt-2 text-neutral-500 text-sm">
            Explore o marketplace por tipo de produto, estilo e técnica artesanal.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {categories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#071a33]/30 py-16 text-center text-muted-foreground bg-white">
            Nenhuma categoria disponível no momento.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
