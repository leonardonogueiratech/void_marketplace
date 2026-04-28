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
import { CancelOrderButton } from "@/components/conta/cancel-order-button";
import { ReviewButton } from "@/components/conta/review-button";
import { Truck, Star } from "lucide-react";

export const metadata: Metadata = { title: "Meus Pedidos" };

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING:         { label: "Pendente",              className: "bg-amber-100 text-amber-700" },
  PAYMENT_PENDING: { label: "Aguardando pagamento",  className: "bg-yellow-100 text-yellow-700" },
  PAID:            { label: "Pago",                  className: "bg-blue-100 text-blue-700" },
  PROCESSING:      { label: "Em preparo",            className: "bg-indigo-100 text-indigo-700" },
  SHIPPED:         { label: "Enviado",               className: "bg-purple-100 text-purple-700" },
  DELIVERED:       { label: "Entregue",              className: "bg-green-100 text-green-700" },
  CANCELLED:       { label: "Cancelado",             className: "bg-red-100 text-red-700" },
  REFUNDED:        { label: "Reembolsado",           className: "bg-neutral-100 text-neutral-700" },
};

const paymentLabels: Record<string, string> = {
  PIX: "PIX", CREDIT_CARD: "Cartão", BOLETO: "Boleto",
};

const CANCELLABLE = ["PENDING", "PAYMENT_PENDING"];

export default async function AccountOrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/conta/pedidos");

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    include: {
      customer: true,
      items: {
        include: {
          product: {
            select: {
              id: true, name: true, slug: true,
              images: { take: 1, orderBy: { order: "asc" } },
              artisan: { select: { storeName: true } },
            },
          },
        },
      },
      payment: true,
      reviews: { select: { id: true, rating: true, comment: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1e3a5f]">Meus pedidos</h1>
          <p className="mt-2 text-neutral-500 text-sm">Acompanhe pagamentos, status e entregas.</p>
        </div>
        <Button variant="outline" asChild className="self-start sm:self-auto">
          <Link href="/produtos">Continuar comprando</Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-lg font-medium text-neutral-900">Você ainda não fez nenhum pedido.</p>
            <p className="mt-2 text-neutral-500 text-sm">Explore produtos artesanais e monte sua primeira cesta.</p>
            <Button className="mt-6 bg-[#1e3a5f] hover:bg-[#162d4a] text-white" asChild>
              <Link href="/produtos">Ver produtos</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const hasReview = order.reviews.length > 0;
            const review = order.reviews[0];
            const storeName = order.items[0]?.product?.artisan?.storeName ?? "Artesão";

            return (
              <Card key={order.id} className="border-[#1e3a5f]/10 overflow-hidden">
                {/* Header */}
                <CardHeader className="bg-[#f7f3ed]/60 border-b border-[#1e3a5f]/8 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base text-[#1e3a5f]">
                        Pedido <span className="font-mono">#{order.id.slice(-8).toUpperCase()}</span>
                      </CardTitle>
                      <p className="mt-0.5 text-xs text-neutral-400">Feito em {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={`text-xs ${statusConfig[order.status]?.className ?? "bg-neutral-100 text-neutral-700"}`}>
                        {statusConfig[order.status]?.label ?? order.status}
                      </Badge>
                      {order.payment && (
                        <Badge variant="outline" className="text-xs">
                          {paymentLabels[order.payment.method] ?? order.payment.method}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="py-5 space-y-5">
                  {/* Items */}
                  <div className="space-y-3">
                    {order.items.map((item) => {
                      const image = item.product.images[0]?.url ?? "/placeholder-product.jpg";
                      return (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-[#f7f3ed]">
                            <Image src={image} alt={item.product.name} fill sizes="64px" className="object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link href={`/produto/${item.product.slug}`} className="font-medium text-[#1e3a5f] hover:text-[#e07b2a] text-sm">
                              {item.product.name}
                            </Link>
                            <p className="text-xs text-neutral-400 mt-0.5">Qtd: {item.quantity}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-semibold text-[#1e3a5f] text-sm">{formatCurrency(item.totalPrice)}</p>
                            <p className="text-xs text-neutral-400">{formatCurrency(item.unitPrice)} un.</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tracking code */}
                  {order.trackingCode && (
                    <div className="flex items-center gap-2.5 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
                      <Truck className="size-4 text-purple-500 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-purple-700">Código de rastreio</p>
                        <p className="font-mono text-sm font-bold text-purple-800 mt-0.5">{order.trackingCode}</p>
                      </div>
                      <a
                        href="https://rastreamento.correios.com.br/app/index.php"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-xs text-purple-600 hover:text-purple-800 underline underline-offset-2"
                      >
                        Rastrear →
                      </a>
                    </div>
                  )}

                  {/* Review — already submitted */}
                  {order.status === "DELIVERED" && hasReview && review && (
                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                      <div className="flex gap-0.5 mt-0.5 shrink-0">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`size-3.5 ${n <= review.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200 fill-neutral-100"}`}
                          />
                        ))}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-amber-700">Sua avaliação</p>
                        {review.comment && (
                          <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer: address + total + actions */}
                  <div className="flex flex-wrap gap-4 border-t border-[#1e3a5f]/8 pt-4 items-end justify-between">
                    <div className="text-xs text-neutral-400 space-y-0.5">
                      {order.customer ? (
                        <>
                          <p className="font-medium text-neutral-600">Entrega</p>
                          <p>{order.customer.street}, {order.customer.number}{order.customer.complement ? `, ${order.customer.complement}` : ""}</p>
                          <p>{order.customer.district} — {order.customer.city}/{order.customer.state} · CEP {order.customer.zipCode}</p>
                        </>
                      ) : (
                        <p>Endereço não informado.</p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right text-xs text-neutral-400 space-y-0.5">
                        <p>Subtotal: {formatCurrency(order.subtotal)}</p>
                        {order.shippingCost > 0 && <p>Frete: {formatCurrency(order.shippingCost)}</p>}
                        {order.discount > 0 && <p className="text-green-600">Desconto: -{formatCurrency(order.discount)}</p>}
                      </div>
                      <p className="text-lg font-bold text-[#1e3a5f]">Total: {formatCurrency(order.total)}</p>
                      <div className="flex items-center gap-2">
                        {order.status === "DELIVERED" && !hasReview && (
                          <ReviewButton orderId={order.id} storeName={storeName} />
                        )}
                        {CANCELLABLE.includes(order.status) && (
                          <CancelOrderButton orderId={order.id} />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
