import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, DollarSign, Star, TrendingUp, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId: session!.user.id },
    include: { subscription: true },
  });

  if (!artisan) return null;

  const [products, orders, commissions] = await Promise.all([
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
  ]);

  const totalSales = artisan.totalSales;
  const pendingBalance = commissions._sum.amount ?? 0;

  const stats = [
    { label: "Produtos ativos", value: products, icon: Package, color: "text-blue-600" },
    { label: "Total de vendas", value: totalSales, icon: TrendingUp, color: "text-green-600" },
    { label: "Saldo a receber", value: formatCurrency(pendingBalance), icon: DollarSign, color: "text-amber-600" },
    { label: "Avaliação média", value: artisan.rating > 0 ? artisan.rating.toFixed(1) : "—", icon: Star, color: "text-purple-600" },
  ];

  const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Pendente", color: "bg-amber-100 text-amber-700" },
    PAYMENT_PENDING: { label: "Aguard. pgto", color: "bg-yellow-100 text-yellow-700" },
    PAID: { label: "Pago", color: "bg-blue-100 text-blue-700" },
    PROCESSING: { label: "Processando", color: "bg-indigo-100 text-indigo-700" },
    SHIPPED: { label: "Enviado", color: "bg-purple-100 text-purple-700" },
    DELIVERED: { label: "Entregue", color: "bg-green-100 text-green-700" },
    CANCELLED: { label: "Cancelado", color: "bg-red-100 text-red-700" },
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Olá, {artisan.storeName}! 👋</h1>
        <p className="text-muted-foreground mt-1">Aqui está um resumo da sua loja</p>
      </div>

      {artisan.status === "PENDING" && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Cadastro em análise</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Nossa equipe irá analisar e aprovar seu perfil em até 2 dias úteis.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{label}</span>
                <Icon className={`size-5 ${color}`} />
              </div>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Pedidos recentes
              <Link href="/dashboard/pedidos" className="text-sm text-primary hover:underline font-normal">
                Ver todos
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum pedido ainda.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.order.user.name} · {formatDate(item.order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatCurrency(item.totalPrice)}</span>
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ações rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { href: "/dashboard/produtos/novo", label: "Adicionar produto", icon: Package },
              { href: "/dashboard/pedidos", label: "Ver pedidos pendentes", icon: ShoppingBag },
              { href: "/dashboard/financeiro", label: "Solicitar saque", icon: DollarSign },
              { href: "/dashboard/perfil", label: "Editar perfil da loja", icon: Star },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <Icon className="size-5 text-muted-foreground" />
                <span className="text-sm">{label}</span>
                <span className="ml-auto text-muted-foreground">→</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
