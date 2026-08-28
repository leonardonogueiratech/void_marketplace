import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import type { OrderStatus } from "@/generated/prisma";
import { RefundButton } from "./refund-button";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:         { label: "Pendente",       color: "bg-neutral-100 text-neutral-500 border-neutral-200" },
  PAYMENT_PENDING: { label: "Aguard. Pgto",  color: "bg-amber-50 text-amber-600 border-amber-200" },
  PAID:            { label: "Pago",           color: "bg-[#7c9f61]/10 text-[#7c9f61] border-[#7c9f61]/20" },
  PROCESSING:      { label: "Preparando",    color: "bg-blue-50 text-blue-600 border-blue-200" },
  SHIPPED:         { label: "Enviado",        color: "bg-purple-50 text-purple-600 border-purple-200" },
  DELIVERED:       { label: "Entregue",       color: "bg-[#7c9f61]/15 text-[#7c9f61] border-[#7c9f61]/25" },
  CANCELLED:       { label: "Cancelado",      color: "bg-red-50 text-red-500 border-red-200" },
  REFUNDED:        { label: "Reembolsado",    color: "bg-neutral-100 text-neutral-400 border-neutral-200" },
};

const PAYMENT_LABELS: Record<string, string> = {
  CREDIT_CARD: "Cartão", PIX: "PIX", BOLETO: "Boleto",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1") || 1);
  const perPage = 20;

  const where = status ? { status: status.toUpperCase() as OrderStatus } : undefined;

  const [orders, total, statusCounts] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        items: true,
        payment: { select: { method: true, status: true, asaasPaymentId: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ["status"], _count: { id: true } }),
  ]);

  const countMap = Object.fromEntries(statusCounts.map((s) => [s.status, s._count.id]));
  const totalPages = Math.ceil(total / perPage);

  const tabs = [
    { value: "", label: "Todos", count: Object.values(countMap).reduce((a, b) => a + b, 0) },
    { value: "payment_pending", label: "Aguard. Pgto", count: countMap.PAYMENT_PENDING ?? 0 },
    { value: "paid", label: "Pagos", count: countMap.PAID ?? 0 },
    { value: "processing", label: "Preparando", count: countMap.PROCESSING ?? 0 },
    { value: "shipped", label: "Enviados", count: countMap.SHIPPED ?? 0 },
    { value: "delivered", label: "Entregues", count: countMap.DELIVERED ?? 0 },
    { value: "cancelled", label: "Cancelados", count: countMap.CANCELLED ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#071a33]">Pedidos</h1>
        <p className="text-sm text-neutral-500 mt-1">{total} pedido(s) no total.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/admin/pedidos?status=${tab.value}` : "/admin/pedidos"}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
              (status ?? "") === tab.value
                ? "bg-[#071a33] text-white border-[#071a33]"
                : "bg-white text-neutral-500 border-[#071a33]/15 hover:border-[#071a33]/30"
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${(status ?? "") === tab.value ? "bg-white/20" : "bg-neutral-100"}`}>
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      <Card className="border-[#071a33]/10">
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-10">Nenhum pedido encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#071a33]/8">
                    {["Pedido", "Comprador", "Itens", "Total", "Pagamento", "Status", "Data", "Ações"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-neutral-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#071a33]/6">
                  {orders.map((o) => {
                    const st = STATUS_CONFIG[o.status] ?? STATUS_CONFIG.PENDING;
                    const canRefund = !!o.payment?.asaasPaymentId
                      && !["REFUNDED", "CANCELLED", "PENDING", "PAYMENT_PENDING"].includes(o.status);
                    return (
                      <tr key={o.id} className="hover:bg-[#f2ede0]/40 transition-colors">
                        <td className="px-5 py-3">
                          <span className="font-mono text-xs text-[#071a33] font-semibold">
                            #{o.id.slice(-6).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-[#071a33] text-xs">{o.user.name ?? "—"}</p>
                          <p className="text-xs text-neutral-400">{o.user.email}</p>
                        </td>
                        <td className="px-5 py-3 text-neutral-500 text-xs">
                          {o.items.length} item(s)
                        </td>
                        <td className="px-5 py-3 font-semibold text-[#071a33] text-xs whitespace-nowrap">
                          {formatCurrency(o.total)}
                        </td>
                        <td className="px-5 py-3 text-neutral-400 text-xs">
                          {o.payment ? PAYMENT_LABELS[o.payment.method] ?? o.payment.method : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${st.color}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-neutral-400 whitespace-nowrap">
                          {formatDate(o.createdAt)}
                        </td>
                        <td className="px-5 py-3">
                          {canRefund && <RefundButton orderId={o.id} />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>Página {page} de {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/pedidos?${status ? `status=${status}&` : ""}page=${page - 1}`}
                className="px-3 py-1.5 rounded-full border border-[#071a33]/15 hover:border-[#071a33]/30 transition-colors"
              >
                ← Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/pedidos?${status ? `status=${status}&` : ""}page=${page + 1}`}
                className="px-3 py-1.5 rounded-full border border-[#071a33]/15 hover:border-[#071a33]/30 transition-colors"
              >
                Próxima →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
