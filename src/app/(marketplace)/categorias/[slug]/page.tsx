import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/marketplace/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCategory(slug: string) {
  return prisma.category.findFirst({
    where: { slug, active: true },
    include: {
      products: {
        where: { status: "ACTIVE" },
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          artisan: { select: { storeName: true, slug: true } },
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      },
      artisanCategories: {
        include: {
          artisan: {
            select: {
              id: true,
              slug: true,
              storeName: true,
            },
          },
        },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findFirst({
    where: { slug },
    select: { name: true, description: true },
  });

  return {
    title: category?.name ?? "Categoria",
    description: category?.description ?? undefined,
  };
}

export default async function CategoryDetailsPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) notFound();

  const artisans = category.artisanCategories.slice(0, 6).map(({ artisan }) => artisan);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link href="/categorias" className="hover:text-primary">Categorias</Link>
        <span>/</span>
        <span className="text-foreground">{category.name}</span>
      </nav>

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <Badge variant="secondary" className="mb-3">
            Categoria
          </Badge>
          <h1 className="text-3xl font-bold text-neutral-900">{category.name}</h1>
          <p className="mt-2 text-muted-foreground">
            {category.description || "Uma curadoria especial de peças feitas à mão por artesãos independentes."}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/produtos?categoria=${category.slug}`}>
            Ver todos nos filtros
          </Link>
        </Button>
      </div>

      {artisans.length > 0 && (
        <section className="mb-10 rounded-2xl border border-border bg-neutral-50 p-5">
          <h2 className="text-lg font-semibold text-neutral-900">Artesãos desta categoria</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {artisans.map((artisan) => (
              <Link
                key={artisan.id}
                href={`/artesao/${artisan.slug}`}
                className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
              >
                {artisan.storeName}
              </Link>
            ))}
          </div>
        </section>
      )}

      {category.products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          Nenhum produto ativo nesta categoria ainda.
        </div>
      ) : (
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-neutral-900">Produtos</h2>
            <p className="text-sm text-muted-foreground">
              {category.products.length} produto(s) encontrados
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {category.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
