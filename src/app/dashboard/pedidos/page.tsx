import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusSelect } from "@/components/dashboard/order-status-select";

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

  const statusConfig: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Pendente", color: "bg-amber-100 text-amber-700" },
    PAYMENT_PENDING: {
      label: "Aguard. pagamento",
      color: "bg-yellow-100 text-yellow-700",
    },
    PAID: { label: "Pago", color: "bg-blue-100 text-blue-700" },
    PROCESSING: { label: "Processando", color: "bg-indigo-100 text-indigo-700" },
    SHIPPED: { label: "Enviado", color: "bg-purple-100 text-purple-700" },
    DELIVERED: { label: "Entregue", color: "bg-green-100 text-green-700" },
    CANCELLED: { label: "Cancelado", color: "bg-red-100 text-red-700" },
    REFUNDED: { label: "Reembolsado", color: "bg-neutral-100 text-neutral-600" },
  };

  const paymentMethodLabels: Record<string, string> = {
    PIX: "PIX",
    CREDIT_CARD: "Cartão",
    BOLETO: "Boleto",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="mt-1 text-muted-foreground">
          {orderItems.length} pedido(s) no total
        </p>
      </div>

      {orderItems.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            Nenhum pedido recebido ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orderItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-mono text-sm text-muted-foreground">
                        #{item.order.id.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${statusConfig[item.order.status]?.color}`}
                      >
                        {statusConfig[item.order.status]?.label}
                      </span>
                    </div>

                    <h3 className="font-medium">{item.product.name}</h3>

                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Qtd: {item.quantity} · {formatCurrency(item.totalPrice)}
                      {item.order.payment &&
                        ` · ${
                          paymentMethodLabels[item.order.payment.method] ??
                          item.order.payment.method
                        }`}
                    </p>

                    <div className="mt-2 text-sm">
                      <p className="font-medium">{item.order.user.name}</p>
                      <p className="text-muted-foreground">{item.order.user.email}</p>
                      {item.order.customer && (
                        <p className="text-muted-foreground">
                          {item.order.customer.street}, {item.order.customer.number}
                          {item.order.customer.complement
                            ? ` ${item.order.customer.complement}`
                            : ""}
                          {" — "}
                          {item.order.customer.city}/{item.order.customer.state} ·
                          {" "}CEP: {item.order.customer.zipCode}
                        </p>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(item.order.createdAt)}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <OrderStatusSelect
                      orderId={item.order.id}
                      currentStatus={item.order.status}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
