import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Package, ShoppingBag, TrendingUp, Clock } from "lucide-react";
import { OrdersList } from "@/components/dashboard/orders-list";

export default async function DashboardOrdersPage() {
  const session = await auth();
  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId: session!.user.id },
  });
  if (!artisan) return null;

  const orderItems = await prisma.orderItem.findMany({
    where: { artisanId: artisan.id },
    include: {
      product: { select: { name: true, slug: true } },
      order: {
        include: {
          user: { select: { name: true, email: true } },
          customer: true,
          payment: { select: { method: true, status: true } },
        },
      },
    },
    orderBy: { order: { createdAt: "desc" } },
  });


  const totalRevenue = orderItems
    .filter((i) => ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(i.order.status))
    .reduce((s, i) => s + i.totalPrice, 0);

  const pending = orderItems.filter((i) => i.order.status === "PAID").length;
  const shipped = orderItems.filter((i) => i.order.status === "SHIPPED").length;

  const stats = [
    { label: "Total de pedidos", value: orderItems.length, icon: ShoppingBag, color: "text-[#1e3a5f]" },
    { label: "Receita confirmada", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "text-[#27ae60]" },
    { label: "Aguardando envio", value: pending, icon: Package, color: "text-[#e07b2a]" },
    { label: "Em trânsito", value: shipped, icon: Clock, color: "text-[#17a2b8]" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Pedidos</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Gerencie e atualize o status dos seus pedidos.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-[#1e3a5f]/10">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-500">{label}</span>
                <Icon className={`size-4 ${color}`} />
              </div>
              <p className="text-xl font-bold text-[#1e3a5f]">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {orderItems.length === 0 ? (
        <Card className="border-[#1e3a5f]/10">
          <CardContent className="py-16 text-center">
            <ShoppingBag className="size-8 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-neutral-500">Nenhum pedido recebido ainda.</p>
            <p className="text-xs text-neutral-400 mt-1">Os pedidos aparecerão aqui assim que chegarem.</p>
          </CardContent>
        </Card>
      ) : (
        <OrdersList items={orderItems} />
      )}
    </div>
  );
}
