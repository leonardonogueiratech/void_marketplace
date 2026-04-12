import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/marketplace/product-card";
import { ProductFilters } from "@/components/marketplace/product-filters";
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
    ...(params.categoria && {
      category: { slug: params.categoria },
    }),
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
      case "menor-preco": return { price: "asc" as const };
      case "maior-preco": return { price: "desc" as const };
      case "mais-vendidos": return { salesCount: "desc" as const };
      case "avaliacao": return { rating: "desc" as const };
      default: return { createdAt: "desc" as const };
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Produtos</h1>
        <p className="text-muted-foreground mt-1">{total} produtos encontrados</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-56 shrink-0">
          <ProductFilters categories={categories} />
        </aside>

        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              Nenhum produto encontrado.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
                      className={`size-9 flex items-center justify-center rounded-md text-sm font-medium border transition-colors ${
                        p === page
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-neutral-50"
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
  );
}
