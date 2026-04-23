import { prisma } from "@/lib/prisma";
import { CategoryManager } from "./category-manager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Categorias — Admin" };

export default async function AdminCategoriasPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true, artisanCategories: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Categorias</h1>
        <p className="text-sm text-neutral-500 mt-1">Gerencie as categorias do marketplace.</p>
      </div>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
