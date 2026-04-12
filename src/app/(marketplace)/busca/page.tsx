import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/marketplace/product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Busca",
};

interface SearchParams {
  q?: string;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  const products = query
    ? await prisma.product.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { tags: { has: query } },
          ],
        },
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          artisan: { select: { storeName: true, slug: true } },
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: 24,
      })
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-neutral-900">Buscar no marketplace</h1>
        <p className="mt-2 text-muted-foreground">
          Encontre produtos artesanais por nome, material, técnica ou tema.
        </p>
      </div>

      <form className="mb-8 flex flex-col gap-3 sm:flex-row" action="/busca">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={query}
            placeholder="Ex.: cerâmica, crochê, decoração, madeira..."
            className="h-11 pl-10"
          />
        </div>
        <Button type="submit" className="h-11 px-6">
          Buscar
        </Button>
      </form>

      {!query ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-lg font-medium text-neutral-900">Digite algo para começar</p>
          <p className="mt-2 text-muted-foreground">
            Você também pode explorar por <Link href="/categorias" className="text-primary hover:underline">categorias</Link>.
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-lg font-medium text-neutral-900">
            Nenhum produto encontrado para “{query}”.
          </p>
          <p className="mt-2 text-muted-foreground">
            Tente outro termo ou navegue pelo catálogo completo.
          </p>
          <Button className="mt-6" variant="outline" asChild>
            <Link href="/produtos">Ver todos os produtos</Link>
          </Button>
        </div>
      ) : (
        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Resultados</h2>
              <p className="text-sm text-muted-foreground">
                {products.length} produto(s) para “{query}”
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href={`/produtos?q=${encodeURIComponent(query)}`}>Abrir filtros avançados</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
