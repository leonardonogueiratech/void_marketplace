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
    <div className="min-h-screen bg-[#f7f3ed]">
      {/* Header — navy, autoridade e comunidade */}
      <div className="bg-[#1e3a5f] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#a8d5a2] mb-1">Comunidade</p>
          <h1 className="text-3xl font-bold text-[#f7f3ed]">Artesãos</h1>
          <p className="text-[#f7f3ed]/55 mt-1 text-sm">
            {artisans.length} artesã{artisans.length !== 1 ? "os" : "o"} cadastrado{artisans.length !== 1 ? "s" : ""} na plataforma
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
    </div>
  );
}
