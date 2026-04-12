import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DeleteProductButton } from "@/components/dashboard/delete-product-button";

export default async function DashboardProductsPage() {
  const session = await auth();
  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId: session!.user.id },
  });
  if (!artisan) return null;

  const products = await prisma.product.findMany({
    where: { artisanId: artisan.id },
    include: { images: { take: 1, orderBy: { order: "asc" } }, category: true },
    orderBy: { createdAt: "desc" },
  });

  const statusConfig: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: "Ativo", color: "bg-green-100 text-green-700" },
    DRAFT: { label: "Rascunho", color: "bg-neutral-100 text-neutral-600" },
    INACTIVE: { label: "Inativo", color: "bg-amber-100 text-amber-700" },
    SOLD_OUT: { label: "Esgotado", color: "bg-red-100 text-red-700" },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-muted-foreground mt-1">{products.length} produto(s)</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/produtos/novo">
            <Plus className="size-4 mr-2" /> Novo produto
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground mb-4">Você ainda não tem produtos cadastrados.</p>
            <Button asChild>
              <Link href="/dashboard/produtos/novo">
                <Plus className="size-4 mr-2" /> Adicionar primeiro produto
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
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
                      <h3 className="font-medium truncate">{product.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${statusConfig[product.status]?.color}`}>
                        {statusConfig[product.status]?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{formatCurrency(product.price)}</span>
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

                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/produto/${product.slug}`}>
                        <Eye className="size-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
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
