import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, ShoppingBag, DollarSign, Clock, CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function AdminPage() {
  const [
    totalUsers, totalArtisans, pendingArtisans, totalOrders,
    revenueData, recentArtisans, unreadMessages,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.artisanProfile.count(),
    prisma.artisanProfile.count({ where: { status: "PENDING" } }),
    prisma.order.count(),
    prisma.commission.aggregate({ _sum: { amount: true } }),
    prisma.artisanProfile.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.contactMessage.count({ where: { read: false } }),
  ]);

  const totalRevenue = revenueData._sum.amount ?? 0;

  const stats = [
    { label: "Compradores", value: totalUsers, icon: Users, color: "text-[#1e3a5f]", bg: "bg-[#1e3a5f]/8" },
    { label: "Artesãos ativos", value: totalArtisans, icon: Store, color: "text-[#4a7c3f]", bg: "bg-[#4a7c3f]/8" },
    { label: "Aguardando aprovação", value: pendingArtisans, icon: Clock, color: "text-[#e07b2a]", bg: "bg-[#e07b2a]/8", alert: pendingArtisans > 0 },
    { label: "Total de pedidos", value: totalOrders, icon: ShoppingBag, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Comissões geradas", value: formatCurrency(totalRevenue), icon: DollarSign, color: "text-[#4a7c3f]", bg: "bg-[#4a7c3f]/8" },
    { label: "Mensagens não lidas", value: unreadMessages, icon: MessageSquare, color: "text-[#e07b2a]", bg: "bg-[#e07b2a]/8", alert: unreadMessages > 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Visão Geral</h1>
        <p className="text-sm text-neutral-500 mt-1">Painel administrativo do marketplace.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, alert }) => (
          <Card key={label} className={`border-[#1e3a5f]/10 ${alert ? "ring-1 ring-[#e07b2a]/30" : ""}`}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-neutral-500">{label}</span>
                <div className={`size-8 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`size-4 ${color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#1e3a5f]">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending artisans */}
      <Card className="border-[#1e3a5f]/10">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base text-[#1e3a5f]">
            Artesãos aguardando aprovação
            {pendingArtisans > 0 && (
              <span className="ml-2 text-xs bg-[#e07b2a] text-white px-2 py-0.5 rounded-full">{pendingArtisans}</span>
            )}
          </CardTitle>
          <Link href="/admin/artesaos" className="text-xs text-[#4a7c3f] hover:underline">Ver todos →</Link>
        </CardHeader>
        <CardContent>
          {recentArtisans.length === 0 ? (
            <div className="flex items-center gap-2 py-4 text-sm text-[#4a7c3f]">
              <CheckCircle2 className="size-4" /> Nenhum artesão aguardando aprovação.
            </div>
          ) : (
            <div className="space-y-3">
              {recentArtisans.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-4 py-2 border-b border-[#1e3a5f]/6 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1e3a5f]">{a.storeName}</p>
                    <p className="text-xs text-neutral-400">{a.user.name} · {a.user.email}</p>
                    <p className="text-xs text-neutral-300">{formatDate(a.createdAt)}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      href={`/admin/artesaos?id=${a.id}&action=approve`}
                      className="inline-flex items-center gap-1 text-xs bg-[#4a7c3f]/10 text-[#4a7c3f] border border-[#4a7c3f]/20 px-3 py-1.5 rounded-full hover:bg-[#4a7c3f]/20 transition-colors font-medium"
                    >
                      <CheckCircle2 className="size-3" /> Aprovar
                    </Link>
                    <Link
                      href={`/admin/artesaos?id=${a.id}&action=reject`}
                      className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-500 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors font-medium"
                    >
                      <XCircle className="size-3" /> Rejeitar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
