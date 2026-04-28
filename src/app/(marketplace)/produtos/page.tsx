import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/marketplace/product-card";
import { ProductFilters } from "@/components/marketplace/product-filters";
import { ActiveFilters } from "@/components/marketplace/active-filters";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Produtos" };

interface SearchParams {
  categoria?: string;
  ordem?: string;
  min?: string;
  max?: string;
  q?: string;
  pagina?: string;
}

const PAGE_SIZE = 24;

async function getProducts(params: SearchParams) {
  const page = Number(params.pagina ?? 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    status: "ACTIVE" as const,
    artisan: { status: "APPROVED" as const },
    ...(params.categoria && { category: { slug: params.categoria } }),
    ...(params.q && {
      OR: [
        { name: { contains: params.q, mode: "insensitive" as const } },
        { description: { contains: params.q, mode: "insensitive" as const } },
        { tags: { has: params.q } },
      ],
    }),
    ...(params.min || params.max
      ? {
          price: {
            ...(params.min ? { gte: Number(params.min) } : {}),
            ...(params.max ? { lte: Number(params.max) } : {}),
          },
        }
      : {}),
  };

  const orderBy = (() => {
    switch (params.ordem) {
      case "menor-preco":  return { price: "asc" as const };
      case "maior-preco":  return { price: "desc" as const };
      case "mais-vendidos": return { salesCount: "desc" as const };
      case "avaliacao":    return { rating: "desc" as const };
      case "categoria":    return { category: { name: "asc" as const } };
      default:             return { createdAt: "desc" as const };
    }
  })();

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        artisan: { select: { storeName: true, slug: true } },
      },
      orderBy,
      skip,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, totalPages: Math.ceil(total / PAGE_SIZE) };
}

async function getCategories() {
  return prisma.category.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true },
  });
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [{ products, total, page, totalPages }, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ]);

  const activeCategory = categories.find((c) => c.slug === params.categoria);

  return (
    <div className="min-h-screen bg-[#f7f3ed]">
      {/* Page header — creme com acento verde */}
      <div className="bg-[#f7f3ed] border-b border-[#1e3a5f]/8 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#27ae60] mb-1">Marketplace</p>
          <h1 className="text-3xl font-bold text-[#1e3a5f]">
            {activeCategory ? activeCategory.name : "Todos os Produtos"}
          </h1>
          <p className="text-neutral-500 mt-1 text-sm">
            {total > 0
              ? `${total} produto${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`
              : "Nenhum produto encontrado"}
            {params.q && <span> para &quot;{params.q}&quot;</span>}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-60 shrink-0">
            <ProductFilters categories={categories} />
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Active filter chips */}
            <ActiveFilters params={params} categories={categories} total={total} />

            {products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#1e3a5f]/20 bg-white py-20 text-center px-6 mt-4">
                <p className="text-2xl mb-2">🔍</p>
                <p className="font-semibold text-[#1e3a5f] text-lg">Nenhum produto encontrado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tente ajustar os filtros ou buscar por outro termo.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <a
                        key={p}
                        href={`?${new URLSearchParams({ ...params, pagina: String(p) })}`}
                        className={`size-9 flex items-center justify-center rounded-lg text-sm font-medium border transition-colors ${
                          p === page
                            ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                            : "border-[#1e3a5f]/20 text-[#1e3a5f] hover:bg-white"
                        }`}
                      >
                        {p}
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
