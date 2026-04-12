import { prisma } from "@/lib/prisma";
import { ArtisanCard } from "@/components/marketplace/artisan-card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Artesãos" };

export default async function ArtisansPage() {
  const artisans = await prisma.artisanProfile.findMany({
    where: { status: "APPROVED" },
    include: {
      user: { select: { name: true } },
      _count: { select: { products: { where: { status: "ACTIVE" } } } },
    },
    orderBy: [{ featured: "desc" }, { totalSales: "desc" }],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Artesãos</h1>
        <p className="text-muted-foreground mt-1">
          {artisans.length} artesãos cadastrados na plataforma
        </p>
      </div>
      {artisans.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          Nenhum artesão cadastrado ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artisans.map((artisan) => (
            <ArtisanCard key={artisan.id} artisan={artisan} />
          ))}
        </div>
      )}
    </div>
  );
}
