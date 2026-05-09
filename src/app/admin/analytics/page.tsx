import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DailyGmvChart, MonthlyGmvChart, OrderStatusChart,
  UserGrowthChart, PlanChart,
} from "@/components/admin/analytics-charts";
import {
  TrendingUp, TrendingDown, Minus,
  DollarSign, ShoppingBag, Users, Store,
  BarChart2, Star, Package,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics — Admin" };

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  PAYMENT_PENDING: "Aguard. Pgto",
  PAID: "Pago",
  PROCESSING: "Preparando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
  REFUNDED: "Estornado",
};

const COMPLETED = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

function groupByDay(orders: { createdAt: Date; total: number }[]) {
  const map = new Map<string, { gmv: number; orders: number; sortKey: string }>();
  orders.forEach((o) => {
    const d = new Date(o.createdAt);
    const sortKey = d.toISOString().slice(0, 10);
    const day = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    const cur = map.get(sortKey) ?? { gmv: 0, orders: 0, sortKey };
    map.set(sortKey, { gmv: cur.gmv + o.total, orders: cur.orders + 1, sortKey });
  });
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([sortKey, v]) => ({
      day: new Date(sortKey + "T12:00:00Z").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      gmv: Math.round(v.gmv * 100) / 100,
      orders: v.orders,
    }));
}

function groupByMonth(items: { createdAt: Date }[], valueKey?: (item: any) => number) {
  const map = new Map<string, { count: number; value: number; sortKey: string }>();
  items.forEach((item: any) => {
    const d = new Date(item.createdAt);
    const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    const cur = map.get(sortKey) ?? { count: 0, value: 0, sortKey };
    map.set(sortKey, {
      count: cur.count + 1,
      value: cur.value + (valueKey ? valueKey(item) : 0),
      sortKey,
    });
  });
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([sortKey, v]) => {
      const [year, month] = sortKey.split("-");
      const d = new Date(Number(year), Number(month) - 1, 1);
      return {
        month: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
        count: v.count,
        gmv: Math.round(v.value * 100) / 100,
        orders: v.count,
        sortKey,
      };
    });
}

function pct(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

async function getAnalytics() {
  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * 86400_000);
  const d60 = new Date(now.getTime() - 60 * 86400_000);
  const d365 = new Date(now.getTime() - 365 * 86400_000);

  const [
    // Time-series orders
    orders30, orders30_60, orders365,
    // All orders for status distribution
    ordersByStatus,
    // Total orders
    totalOrders, completedOrders,
    // Commission total
    commissionTotal,
    // Top artisans
    topArtisanItems,
    // Top products
    topProductItems,
    // Users monthly
    users12m,
    artisans12m,
    // Plans
    subscriptions,
    totalApprovedArtisans,
  ] = await Promise.all([
    // Current 30 days
    prisma.order.findMany({
      where: { status: { in: [...COMPLETED] }, createdAt: { gte: d30 } },
      select: { createdAt: true, total: true },
    }),
    // Previous 30 days (for % change)
    prisma.order.findMany({
      where: { status: { in: [...COMPLETED] }, createdAt: { gte: d60, lt: d30 } },
      select: { createdAt: true, total: true },
    }),
    // Last 12 months
    prisma.order.findMany({
      where: { status: { in: [...COMPLETED] }, createdAt: { gte: d365 } },
      select: { createdAt: true, total: true },
    }),
    // Order status counts
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    // Total and completed counts
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: [...COMPLETED] } } }),
    // Platform revenue (commissions)
    prisma.commission.aggregate({ _sum: { amount: true } }),
    // Top 8 artisans by GMV
    prisma.orderItem.groupBy({
      by: ["artisanId"],
      _sum: { totalPrice: true },
      _count: { _all: true },
      orderBy: { _sum: { totalPrice: "desc" } },
      take: 8,
    }),
    // Top 8 products by GMV
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { totalPrice: true, quantity: true },
      orderBy: { _sum: { totalPrice: "desc" } },
      take: 8,
    }),
    // New users last 12 months
    prisma.user.findMany({
      where: { role: "CUSTOMER", createdAt: { gte: d365 } },
      select: { createdAt: true },
    }),
    // New approved artisans last 12 months
    prisma.artisanProfile.findMany({
      where: { status: "APPROVED", createdAt: { gte: d365 } },
      select: { createdAt: true },
    }),
    // Subscriptions
    prisma.subscription.groupBy({
      by: ["plan"],
      where: { status: "ACTIVE" },
      _count: { _all: true },
    }),
    prisma.artisanProfile.count({ where: { status: "APPROVED" } }),
  ]);

  // Enrich top artisans
  const artisanIds = topArtisanItems.map((a) => a.artisanId);
  const artisanDetails = await prisma.artisanProfile.findMany({
    where: { id: { in: artisanIds } },
    select: { id: true, storeName: true, slug: true, rating: true, totalSales: true },
  });

  // Enrich top products
  const productIds = topProductItems.map((p) => p.productId);
  const productDetails = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true, name: true, slug: true, rating: true,
      images: { take: 1, select: { url: true }, orderBy: { order: "asc" } },
      artisan: { select: { storeName: true } },
    },
  });

  // KPIs current vs previous period
  const gmvCurrent = orders30.reduce((s, o) => s + o.total, 0);
  const gmvPrevious = orders30_60.reduce((s, o) => s + o.total, 0);
  const avgTicketCurrent = orders30.length > 0 ? gmvCurrent / orders30.length : 0;
  const avgTicketPrevious = orders30_60.length > 0 ? gmvPrevious / orders30_60.length : 0;

  // Plan distribution: artisans without subscription = FREE
  const subscribedCount = subscriptions.reduce((s, p) => s + p._count._all, 0);
  const freeCount = Math.max(0, totalApprovedArtisans - subscribedCount);
  const planData = [
    ...(freeCount > 0 ? [{ plan: "FREE", count: freeCount }] : []),
    ...subscriptions.map((s) => ({ plan: s.plan, count: s._count._all })),
  ].sort((a, b) => {
    const order = ["FREE", "BASIC", "PRO"];
    return order.indexOf(a.plan) - order.indexOf(b.plan);
  });

  // Merge user growth
  const usersByMonth = groupByMonth(users12m);
  const artisansByMonth = groupByMonth(artisans12m);
  const allMonths = [...new Set([...usersByMonth.map((m) => m.sortKey), ...artisansByMonth.map((m) => m.sortKey)])].sort();
  const userGrowth = allMonths.map((key) => {
    const u = usersByMonth.find((m) => m.sortKey === key);
    const a = artisansByMonth.find((m) => m.sortKey === key);
    return {
      month: (u ?? a)!.month,
      compradores: u?.count ?? 0,
      artesaos: a?.count ?? 0,
    };
  });

  return {
    kpis: {
      gmv: { current: gmvCurrent, change: pct(gmvCurrent, gmvPrevious) },
      revenue: commissionTotal._sum.amount ?? 0,
      avgTicket: { current: avgTicketCurrent, change: pct(avgTicketCurrent, avgTicketPrevious) },
      completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
      ordersCurrent: orders30.length,
      ordersPrevious: orders30_60.length,
    },
    dailyGmv: groupByDay(orders30),
    monthlyGmv: groupByMonth(orders365, (o) => o.total),
    orderStatus: ordersByStatus.map((s) => ({
      status: s.status,
      label: STATUS_LABELS[s.status] ?? s.status,
      count: s._count._all,
    })),
    topArtisans: topArtisanItems.map((item) => {
      const d = artisanDetails.find((a) => a.id === item.artisanId);
      return {
        storeName: d?.storeName ?? "—",
        slug: d?.slug ?? "",
        rating: d?.rating ?? 0,
        gmv: item._sum.totalPrice ?? 0,
        orders: item._count._all,
      };
    }),
    topProducts: topProductItems.map((item) => {
      const d = productDetails.find((p) => p.id === item.productId);
      return {
        name: d?.name ?? "—",
        slug: d?.slug ?? "",
        image: d?.images[0]?.url ?? null,
        artisan: d?.artisan.storeName ?? "—",
        rating: d?.rating ?? 0,
        gmv: item._sum.totalPrice ?? 0,
        units: item._sum.quantity ?? 0,
      };
    }),
    userGrowth,
    planData,
  };
}

// ── Componente de KPI card ────────────────────────────────────────────────────

function KpiCard({
  label, value, change, icon: Icon, color, bg, suffix = "",
}: {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
  bg: string;
  suffix?: string;
}) {
  const TrendIcon = change == null ? null : change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  const trendColor = change == null ? "" : change > 0 ? "text-[#27ae60]" : change < 0 ? "text-red-500" : "text-neutral-400";

  return (
    <Card className="border-[#1e3a5f]/10">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-neutral-500 font-medium">{label}</span>
          <div className={`size-8 rounded-lg ${bg} flex items-center justify-center`}>
            <Icon className={`size-4 ${color}`} />
          </div>
        </div>
        <p className="text-2xl font-bold text-[#1e3a5f]">{value}{suffix}</p>
        {TrendIcon && change != null && (
          <div className={`flex items-center gap-1 mt-1.5 ${trendColor}`}>
            <TrendIcon className="size-3" />
            <span className="text-xs font-medium">
              {Math.abs(change)}% vs. 30 dias anteriores
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AnalyticsPage() {
  const data = await getAnalytics();
  const { kpis, dailyGmv, monthlyGmv, orderStatus, topArtisans, topProducts, userGrowth, planData } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Analytics</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Visão completa do desempenho do marketplace. KPIs comparados com os 30 dias anteriores.
        </p>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="GMV (últimos 30 dias)"
          value={formatCurrency(kpis.gmv.current)}
          change={kpis.gmv.change}
          icon={DollarSign}
          color="text-[#27ae60]"
          bg="bg-[#27ae60]/8"
        />
        <KpiCard
          label="Receita da plataforma"
          value={formatCurrency(kpis.revenue)}
          icon={TrendingUp}
          color="text-[#17a2b8]"
          bg="bg-[#17a2b8]/8"
        />
        <KpiCard
          label="Ticket médio (30 dias)"
          value={formatCurrency(kpis.avgTicket.current)}
          change={kpis.avgTicket.change}
          icon={ShoppingBag}
          color="text-[#e07b2a]"
          bg="bg-[#e07b2a]/8"
        />
        <KpiCard
          label="Taxa de conclusão"
          value={kpis.completionRate}
          suffix="%"
          icon={BarChart2}
          color="text-[#1e3a5f]"
          bg="bg-[#1e3a5f]/8"
        />
      </div>

      {/* ── GMV Diário ── */}
      <Card className="border-[#1e3a5f]/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-[#1e3a5f] flex items-center gap-2">
            <TrendingUp className="size-4 text-[#27ae60]" />
            GMV Diário — últimos 30 dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DailyGmvChart data={dailyGmv} />
        </CardContent>
      </Card>

      {/* ── GMV Mensal + Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#1e3a5f]/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#1e3a5f] flex items-center gap-2">
              <BarChart2 className="size-4 text-[#27ae60]" />
              GMV Mensal — últimos 12 meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyGmvChart data={monthlyGmv} />
          </CardContent>
        </Card>

        <Card className="border-[#1e3a5f]/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#1e3a5f] flex items-center gap-2">
              <ShoppingBag className="size-4 text-[#e07b2a]" />
              Pedidos por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OrderStatusChart data={orderStatus} />
          </CardContent>
        </Card>
      </div>

      {/* ── Top Artesãos + Top Produtos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Artesãos */}
        <Card className="border-[#1e3a5f]/10">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-[#1e3a5f] flex items-center gap-2">
              <Store className="size-4 text-[#27ae60]" />
              Top Artesãos por GMV
            </CardTitle>
            <Link href="/admin/artesaos" className="text-xs text-[#27ae60] hover:underline">
              Ver todos →
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {topArtisans.length === 0 ? (
              <p className="text-sm text-neutral-400 py-6 text-center">Nenhuma venda ainda.</p>
            ) : (
              <div className="space-y-0">
                {topArtisans.map((a, i) => (
                  <div key={a.slug} className="flex items-center gap-3 py-2.5 border-b border-[#1e3a5f]/5 last:border-0">
                    <span className="text-xs font-bold text-neutral-300 w-5 text-right shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <Link href={`/artesao/${a.slug}`} target="_blank" className="text-sm font-semibold text-[#1e3a5f] hover:underline truncate block">
                        {a.storeName}
                      </Link>
                      <div className="flex items-center gap-1 mt-0.5">
                        {a.rating > 0 && (
                          <>
                            <Star className="size-3 fill-[#e07b2a] text-[#e07b2a]" />
                            <span className="text-[10px] text-neutral-400">{a.rating.toFixed(1)}</span>
                            <span className="text-[10px] text-neutral-300 mx-1">·</span>
                          </>
                        )}
                        <span className="text-[10px] text-neutral-400">{a.orders} pedido{a.orders !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#27ae60] shrink-0">
                      {formatCurrency(a.gmv)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Produtos */}
        <Card className="border-[#1e3a5f]/10">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-[#1e3a5f] flex items-center gap-2">
              <Package className="size-4 text-[#e07b2a]" />
              Top Produtos por Receita
            </CardTitle>
            <Link href="/admin/pedidos" className="text-xs text-[#27ae60] hover:underline">
              Ver pedidos →
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {topProducts.length === 0 ? (
              <p className="text-sm text-neutral-400 py-6 text-center">Nenhuma venda ainda.</p>
            ) : (
              <div className="space-y-0">
                {topProducts.map((p, i) => (
                  <div key={p.slug} className="flex items-center gap-3 py-2.5 border-b border-[#1e3a5f]/5 last:border-0">
                    <span className="text-xs font-bold text-neutral-300 w-5 text-right shrink-0">
                      {i + 1}
                    </span>
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="size-9 rounded-lg object-cover shrink-0 border border-[#1e3a5f]/8" />
                    ) : (
                      <div className="size-9 rounded-lg bg-[#f7f3ed] shrink-0 border border-[#1e3a5f]/8 flex items-center justify-center">
                        <Package className="size-4 text-neutral-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link href={`/produto/${p.slug}`} target="_blank" className="text-sm font-semibold text-[#1e3a5f] hover:underline truncate block">
                        {p.name}
                      </Link>
                      <span className="text-[10px] text-neutral-400">{p.artisan} · {p.units} un.</span>
                    </div>
                    <span className="text-sm font-bold text-[#e07b2a] shrink-0">
                      {formatCurrency(p.gmv)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Crescimento de Usuários + Planos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-[#1e3a5f]/10 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#1e3a5f] flex items-center gap-2">
              <Users className="size-4 text-[#1e3a5f]" />
              Crescimento de Usuários — últimos 12 meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserGrowthChart data={userGrowth} />
          </CardContent>
        </Card>

        <Card className="border-[#1e3a5f]/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#1e3a5f] flex items-center gap-2">
              <Store className="size-4 text-[#17a2b8]" />
              Distribuição de Planos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PlanChart data={planData} />
            <div className="mt-4 space-y-1.5">
              {planData.map((p) => {
                const total = planData.reduce((s, x) => s + x.count, 0);
                const pct = total > 0 ? Math.round((p.count / total) * 100) : 0;
                const labels: Record<string, string> = { FREE: "Gratuito", BASIC: "Básico", PRO: "Pro" };
                const colors: Record<string, string> = { FREE: "bg-slate-400", BASIC: "bg-[#27ae60]", PRO: "bg-[#e07b2a]" };
                return (
                  <div key={p.plan} className="flex items-center gap-2 text-xs">
                    <div className={`size-2 rounded-full ${colors[p.plan] ?? "bg-neutral-300"} shrink-0`} />
                    <span className="text-neutral-500 flex-1">{labels[p.plan] ?? p.plan}</span>
                    <span className="font-semibold text-[#1e3a5f]">{p.count}</span>
                    <span className="text-neutral-400">({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
