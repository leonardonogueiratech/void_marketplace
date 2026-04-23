import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, DollarSign, Star, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";
import { RevenueChart } from "@/components/dashboard/charts";

function buildLast30Days(items: { createdAt: Date; totalPrice: number }[]) {
  const today = new Date();
  const days: { day: string; receita: number; pedidos: number }[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    const dayItems = items.filter((item) => {
      const id = new Date(item.createdAt);
      return (
        id.getDate() === d.getDate() &&
        id.getMonth() === d.getMonth() &&
        id.getFullYear() === d.getFullYear()
      );
    });
    days.push({
      day: label,
      receita: dayItems.reduce((s, it) => s + it.totalPrice, 0),
      pedidos: dayItems.length,
    });
  }
  return days;
}

export default async function DashboardPage() {
  const session = await auth();
  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId: session!.user.id },
    include: { subscription: true },
  });
  if (!artisan) return null;

  const since30d = new Date();
  since30d.setDate(since30d.getDate() - 30);

  const [products, recentOrders, commissions, last30Items] = await Promise.all([
    prisma.product.count({ where: { artisanId: artisan.id } }),
    prisma.orderItem.findMany({
      where: { artisanId: artisan.id },
      include: {
        order: { select: { id: true, status: true, createdAt: true, user: { select: { name: true } } } },
        product: { select: { name: true } },
      },
      orderBy: { order: { createdAt: "desc" } },
      take: 5,
    }),
    prisma.commission.aggregate({
      where: { artisanId: artisan.id, paid: false },
      _sum: { amount: true },
    }),
    prisma.orderItem.findMany({
      where: {
        artisanId: artisan.id,
        order: { createdAt: { gte: since30d }, status: { in: ["PAID", "DELIVERED", "SHIPPED"] } },
      },
      select: { totalPrice: true, order: { select: { createdAt: true } } },
    }),
  ]);

  const chartData = buildLast30Days(
    last30Items.map((i) => ({ createdAt: i.order.createdAt, totalPrice: i.totalPrice }))
  );
  const revenue30d = last30Items.reduce((s, i) => s + i.totalPrice, 0);

  const stats = [
    { label: "Produtos cadastrados", value: products, icon: Package, color: "text-[#1e3a5f]" },
    { label: "Total de vendas", value: artisan.totalSales, icon: TrendingUp, color: "text-[#4a7c3f]" },
    { label: "Receita (30 dias)", value: formatCurrency(revenue30d), icon: DollarSign, color: "text-[#e07b2a]" },
    { label: "Avaliação média", value: artisan.rating > 0 ? artisan.rating.toFixed(1) : "—", icon: Star, color: "text-purple-500" },
  ];

  const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Pendente", color: "bg-amber-100 text-amber-700" },
    PAYMENT_PENDING: { label: "Aguard. pgto", color: "bg-yellow-100 text-yellow-700" },
    PAID: { label: "Pago", color: "bg-blue-100 text-blue-700" },
    PROCESSING: { label: "Processando", color: "bg-indigo-100 text-indigo-700" },
    SHIPPED: { label: "Enviado", color: "bg-purple-100 text-purple-700" },
    DELIVERED: { label: "Entregue", color: "bg-[#4a7c3f]/10 text-[#4a7c3f]" },
    CANCELLED: { label: "Cancelado", color: "bg-red-100 text-red-700" },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Olá, {artisan.storeName}!</h1>
        <p className="text-neutral-500 mt-1 text-sm">Aqui está um resumo da sua loja.</p>
      </div>

      {artisan.status === "PENDING" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800 text-sm">Cadastro em análise</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Nossa equipe irá aprovar seu perfil em até 2 dias úteis.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-[#1e3a5f]/10">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-neutral-500">{label}</span>
                <Icon className={`size-4 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-[#1e3a5f]">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue chart */}
      <Card className="border-[#1e3a5f]/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-[#1e3a5f] flex items-center justify-between">
            Receita — últimos 30 dias
            <span className="text-sm font-normal text-neutral-400">{formatCurrency(revenue30d)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={chartData} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <Card className="border-[#1e3a5f]/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1e3a5f] flex items-center justify-between">
              Pedidos recentes
              <Link href="/dashboard/pedidos" className="text-sm font-normal text-[#4a7c3f] hover:underline">
                Ver todos
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-6">Nenhum pedido ainda.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1e3a5f] truncate">{item.product.name}</p>
                      <p className="text-xs text-neutral-400">
                        {item.order.user.name} · {formatDate(item.order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-semibold text-[#1e3a5f]">{formatCurrency(item.totalPrice)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusLabels[item.order.status]?.color ?? "bg-neutral-100"}`}>
                        {statusLabels[item.order.status]?.label ?? item.order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="border-[#1e3a5f]/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1e3a5f]">Ações rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {[
              { href: "/dashboard/produtos/novo", label: "Adicionar produto", icon: Package },
              { href: "/dashboard/pedidos", label: "Ver pedidos pendentes", icon: ShoppingBag },
              { href: "/dashboard/financeiro", label: "Solicitar saque", icon: DollarSign },
              { href: "/dashboard/perfil", label: "Editar perfil da loja", icon: Star },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#1e3a5f]/4 transition-colors group"
              >
                <div className="size-8 rounded-lg bg-[#f7f3ed] flex items-center justify-center group-hover:bg-[#1e3a5f]/8 transition-colors">
                  <Icon className="size-4 text-[#1e3a5f]" />
                </div>
                <span className="text-sm text-neutral-600 group-hover:text-[#1e3a5f] transition-colors">{label}</span>
                <span className="ml-auto text-neutral-300 group-hover:text-[#1e3a5f] transition-colors text-sm">→</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
