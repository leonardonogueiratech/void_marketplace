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
    { label: "Compradores", value: totalUsers, icon: Users, color: "text-[#071a33]", bg: "bg-[#071a33]/8" },
    { label: "Artesãos ativos", value: totalArtisans, icon: Store, color: "text-[#7c9f61]", bg: "bg-[#7c9f61]/8" },
    { label: "Aguardando aprovação", value: pendingArtisans, icon: Clock, color: "text-[#c1652e]", bg: "bg-[#c1652e]/8", alert: pendingArtisans > 0 },
    { label: "Total de pedidos", value: totalOrders, icon: ShoppingBag, color: "text-[#17a2b8]", bg: "bg-[#17a2b8]/8" },
    { label: "Comissões geradas", value: formatCurrency(totalRevenue), icon: DollarSign, color: "text-[#7c9f61]", bg: "bg-[#7c9f61]/8" },
    { label: "Mensagens não lidas", value: unreadMessages, icon: MessageSquare, color: "text-[#c1652e]", bg: "bg-[#c1652e]/8", alert: unreadMessages > 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#071a33]">Visão Geral</h1>
        <p className="text-sm text-neutral-500 mt-1">Painel administrativo do marketplace.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, alert }) => (
          <Card key={label} className={`border-[#071a33]/10 ${alert ? "ring-1 ring-[#c1652e]/30" : ""}`}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-neutral-500">{label}</span>
                <div className={`size-8 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`size-4 ${color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#071a33]">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending artisans */}
      <Card className="border-[#071a33]/10">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base text-[#071a33]">
            Artesãos aguardando aprovação
            {pendingArtisans > 0 && (
              <span className="ml-2 text-xs bg-[#c1652e] text-white px-2 py-0.5 rounded-full">{pendingArtisans}</span>
            )}
          </CardTitle>
          <Link href="/admin/artesaos" className="text-xs text-[#7c9f61] hover:underline">Ver todos →</Link>
        </CardHeader>
        <CardContent>
          {recentArtisans.length === 0 ? (
            <div className="flex items-center gap-2 py-4 text-sm text-[#7c9f61]">
              <CheckCircle2 className="size-4" /> Nenhum artesão aguardando aprovação.
            </div>
          ) : (
            <div className="space-y-3">
              {recentArtisans.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-4 py-2 border-b border-[#071a33]/6 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#071a33]">{a.storeName}</p>
                    <p className="text-xs text-neutral-400">{a.user.name} · {a.user.email}</p>
                    <p className="text-xs text-neutral-300">{formatDate(a.createdAt)}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      href={`/admin/artesaos?id=${a.id}&action=approve`}
                      className="inline-flex items-center gap-1 text-xs bg-[#7c9f61]/10 text-[#7c9f61] border border-[#7c9f61]/20 px-3 py-1.5 rounded-full hover:bg-[#7c9f61]/20 transition-colors font-medium"
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
