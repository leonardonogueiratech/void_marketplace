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
            where: { status: "ACTIVE" },
          },
        },
      },
    },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <div className="min-h-screen bg-[#f7f3ed]">
      {/* Header — âmbar quente, convite à exploração */}
      <div className="bg-[#f7f3ed] border-b border-[#e07b2a]/20 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#e07b2a] mb-1">Navegue</p>
          <h1 className="text-3xl font-bold text-[#1e3a5f]">Categorias</h1>
          <p className="mt-2 text-neutral-500 text-sm">
            Explore o marketplace por tipo de produto, estilo e técnica artesanal.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {categories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#1e3a5f]/30 py-16 text-center text-muted-foreground bg-white">
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
