import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Meus Pedidos",
};

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pendente", className: "bg-amber-100 text-amber-700" },
  PAYMENT_PENDING: { label: "Aguardando pagamento", className: "bg-yellow-100 text-yellow-700" },
  PAID: { label: "Pago", className: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "Em preparo", className: "bg-indigo-100 text-indigo-700" },
  SHIPPED: { label: "Enviado", className: "bg-purple-100 text-purple-700" },
  DELIVERED: { label: "Entregue", className: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelado", className: "bg-red-100 text-red-700" },
  REFUNDED: { label: "Reembolsado", className: "bg-neutral-100 text-neutral-700" },
};

const paymentLabels: Record<string, string> = {
  PIX: "PIX",
  CREDIT_CARD: "Cartão",
  BOLETO: "Boleto",
};

export default async function AccountOrdersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/conta/pedidos");
  }

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    include: {
      customer: true,
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: { take: 1, orderBy: { order: "asc" } },
            },
          },
        },
      },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Meus pedidos</h1>
          <p className="mt-2 text-muted-foreground">
            Acompanhe pagamentos, status e itens comprados.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/produtos">Continuar comprando</Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-lg font-medium text-neutral-900">Você ainda não fez nenhum pedido.</p>
            <p className="mt-2 text-muted-foreground">
              Explore produtos artesanais e monte sua primeira cesta.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/produtos">Ver produtos</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Pedido #{order.id.slice(-8).toUpperCase()}
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Feito em {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={statusConfig[order.status]?.className}>
                    {statusConfig[order.status]?.label ?? order.status}
                  </Badge>
                  {order.payment && (
                    <Badge variant="outline">
                      {paymentLabels[order.payment.method] ?? order.payment.method}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="space-y-3">
                  {order.items.map((item) => {
                    const image = item.product.images[0]?.url ?? "/placeholder-product.jpg";

                    return (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                          <Image
                            src={image}
                            alt={item.product.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/produto/${item.product.slug}`}
                            className="font-medium text-neutral-900 hover:text-primary"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            Quantidade: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(item.unitPrice)} cada
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-4 border-t border-border pt-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Entrega</p>
                    {order.customer ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {order.customer.street}, {order.customer.number}
                        {order.customer.complement ? `, ${order.customer.complement}` : ""}
                        <br />
                        {order.customer.district} - {order.customer.city}/{order.customer.state}
                        <br />
                        CEP: {order.customer.zipCode}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Endereço não informado.
                      </p>
                    )}
                  </div>

                  <div className="md:text-right">
                    <p className="text-sm text-muted-foreground">Subtotal: {formatCurrency(order.subtotal)}</p>
                    <p className="text-sm text-muted-foreground">Frete: {formatCurrency(order.shippingCost)}</p>
                    {order.discount > 0 && (
                      <p className="text-sm text-green-700">
                        Desconto: -{formatCurrency(order.discount)}
                      </p>
                    )}
                    <p className="mt-2 text-lg font-semibold text-neutral-900">
                      Total: {formatCurrency(order.total)}
                    </p>
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
