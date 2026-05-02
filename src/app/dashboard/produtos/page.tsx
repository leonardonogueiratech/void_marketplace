import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DeleteProductButton } from "@/components/dashboard/delete-product-button";
import { ProductFiltersBar } from "@/components/dashboard/product-filters-bar";
import type { Prisma } from "@/generated/prisma";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ACTIVE:   { label: "Ativo",      color: "bg-green-100 text-green-700" },
  DRAFT:    { label: "Rascunho",   color: "bg-neutral-100 text-neutral-600" },
  INACTIVE: { label: "Inativo",    color: "bg-amber-100 text-amber-700" },
  SOLD_OUT: { label: "Esgotado",   color: "bg-red-100 text-red-700" },
};

interface Props {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function DashboardProductsPage({ searchParams }: Props) {
  const session = await auth();
  const { q, status } = await searchParams;

  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId: session!.user.id },
  });
  if (!artisan) return null;

  const where: Prisma.ProductWhereInput = {
    artisanId: artisan.id,
    ...(status && status !== "ALL" ? { status: status as Prisma.ProductWhereInput["status"] } : {}),
    ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
  };

  const [products, counts] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { take: 1, orderBy: { order: "asc" } }, category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.groupBy({
      by: ["status"],
      where: { artisanId: artisan.id },
      _count: true,
    }),
  ]);

  const statusCounts = Object.fromEntries(counts.map((c) => [c.status, c._count]));
  const total = counts.reduce((a, c) => a + c._count, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Produtos</h1>
          <p className="text-muted-foreground mt-1">{total} produto(s)</p>
        </div>
        <Button asChild className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white">
          <Link href="/dashboard/produtos/novo">
            <Plus className="size-4 mr-2" /> Novo produto
          </Link>
        </Button>
      </div>

      {/* Barra de busca e filtros */}
      <ProductFiltersBar statusCounts={statusCounts} total={total} />

      {products.length === 0 ? (
        <Card className="mt-4">
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground mb-4">
              {q || status ? "Nenhum produto encontrado com esses filtros." : "Você ainda não tem produtos cadastrados."}
            </p>
            {!q && !status && (
              <Button asChild className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white">
                <Link href="/dashboard/produtos/novo">
                  <Plus className="size-4 mr-2" /> Adicionar primeiro produto
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 mt-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden border-[#1e3a5f]/10 hover:border-[#1e3a5f]/25 transition-colors">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 p-4">
                  <div className="relative size-16 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center text-muted-foreground text-xs">
                        Sem foto
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-medium truncate text-[#1e3a5f]">{product.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${STATUS_CONFIG[product.status]?.color}`}>
                        {STATUS_CONFIG[product.status]?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="font-medium text-[#1e3a5f]">{formatCurrency(product.price)}</span>
                      <span>·</span>
                      <span>{product.stock} em estoque</span>
                      {product.category && (
                        <>
                          <span>·</span>
                          <span>{product.category.name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" asChild title="Ver público">
                      <Link href={`/produto/${product.slug}`} target="_blank">
                        <Eye className="size-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild title="Editar">
                      <Link href={`/dashboard/produtos/${product.id}/editar`}>
                        <Edit className="size-4" />
                      </Link>
                    </Button>
                    <DeleteProductButton productId={product.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
