import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArtisanActions } from "@/components/admin/artisan-actions";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "Aguardando", color: "bg-amber-100 text-amber-700 border-amber-200" },
  APPROVED:  { label: "Aprovado",   color: "bg-[#4a7c3f]/10 text-[#4a7c3f] border-[#4a7c3f]/20" },
  REJECTED:  { label: "Rejeitado",  color: "bg-red-50 text-red-600 border-red-200" },
  SUSPENDED: { label: "Suspenso",   color: "bg-neutral-100 text-neutral-500 border-neutral-200" },
};

export default async function AdminArtisansPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const artisans = await prisma.artisanProfile.findMany({
    where: status ? { status: status.toUpperCase() as "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" } : undefined,
    include: {
      user: { select: { name: true, email: true, createdAt: true } },
      subscription: { select: { plan: true } },
      _count: { select: { products: true, reviews: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const counts = await prisma.artisanProfile.groupBy({
    by: ["status"],
    _count: { id: true },
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count.id]));
  const total = artisans.length;

  const tabs = [
    { value: "", label: "Todos", count: Object.values(countMap).reduce((a, b) => a + b, 0) },
    { value: "pending", label: "Aguardando", count: countMap.PENDING ?? 0 },
    { value: "approved", label: "Aprovados", count: countMap.APPROVED ?? 0 },
    { value: "rejected", label: "Rejeitados", count: countMap.REJECTED ?? 0 },
    { value: "suspended", label: "Suspensos", count: countMap.SUSPENDED ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Artesãos</h1>
        <p className="text-sm text-neutral-500 mt-1">{total} artesão(s) encontrado(s).</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/admin/artesaos?status=${tab.value}` : "/admin/artesaos"}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
              (status ?? "") === tab.value
                ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                : "bg-white text-neutral-500 border-[#1e3a5f]/15 hover:border-[#1e3a5f]/30"
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${(status ?? "") === tab.value ? "bg-white/20" : "bg-neutral-100"}`}>
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      <Card className="border-[#1e3a5f]/10">
        <CardContent className="p-0">
          {artisans.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-10">Nenhum artesão encontrado.</p>
          ) : (
            <div className="divide-y divide-[#1e3a5f]/6">
              {artisans.map((a) => {
                const st = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.PENDING;
                return (
                  <div key={a.id} className="px-5 py-4 flex flex-wrap items-start gap-4 hover:bg-[#f7f3ed]/40 transition-colors">
                    <div className="size-10 rounded-xl bg-[#1e3a5f] text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {a.storeName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-[#1e3a5f]">{a.storeName}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${st.color}`}>{st.label}</span>
                        <span className="text-xs text-neutral-400 border border-[#1e3a5f]/10 px-2 py-0.5 rounded-full">
                          {a.subscription?.plan ?? "FREE"}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">{a.user.name} · {a.user.email}</p>
                      <p className="text-xs text-neutral-300 mt-0.5">
                        {a._count.products} produto(s) · {a._count.reviews} avaliação(ões) · cadastrado {formatDate(a.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/artesao/${a.slug}`}
                        target="_blank"
                        className="size-7 rounded-lg bg-[#f7f3ed] flex items-center justify-center text-neutral-400 hover:text-[#1e3a5f] transition-colors"
                      >
                        <ExternalLink className="size-3.5" />
                      </Link>
                      <ArtisanActions artisanId={a.id} currentStatus={a.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
