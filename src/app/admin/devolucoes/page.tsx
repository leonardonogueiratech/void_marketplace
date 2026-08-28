import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, CheckCircle2 } from "lucide-react";
import { RefundReturnButton } from "./refund-return-button";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:      { label: "Aguardando artesão", color: "bg-amber-50 text-amber-700 border-amber-200" },
  APPROVED:     { label: "Aprovada — aguardando envio", color: "bg-blue-50 text-blue-600 border-blue-200" },
  REJECTED:     { label: "Recusada", color: "bg-red-50 text-red-500 border-red-200" },
  SHIPPED_BACK: { label: "A caminho de volta", color: "bg-purple-50 text-purple-600 border-purple-200" },
  RECEIVED:     { label: "Recebida — pronta pra estornar", color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  REFUNDED:     { label: "Reembolsada", color: "bg-[#7c9f61]/10 text-[#7c9f61] border-[#7c9f61]/20" },
};

export default async function AdminReturnsPage() {
  const [pending, others] = await Promise.all([
    prisma.returnRequest.findMany({
      where: { status: "RECEIVED" },
      include: {
        customer: { select: { name: true, email: true } },
        artisan: { select: { storeName: true } },
        orderItem: { select: { totalPrice: true, product: { select: { name: true } } } },
      },
      orderBy: { receivedAt: "asc" },
    }),
    prisma.returnRequest.findMany({
      where: { status: { not: "RECEIVED" } },
      include: {
        customer: { select: { name: true, email: true } },
        artisan: { select: { storeName: true } },
        orderItem: { select: { totalPrice: true, product: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#071a33]">Devoluções</h1>
        <p className="text-sm text-neutral-500 mt-1">Acompanhe e processe os reembolsos de devoluções.</p>
      </div>

      <Card className="border-[#071a33]/10">
        <CardContent className="p-0">
          <div className="px-5 py-3 border-b border-[#071a33]/8">
            <h2 className="text-sm font-bold text-[#071a33]">Prontas para reembolso</h2>
          </div>
          {pending.length === 0 ? (
            <div className="flex items-center gap-2 px-5 py-6 text-sm text-[#7c9f61]">
              <CheckCircle2 className="size-4" /> Nenhuma devolução pendente de estorno.
            </div>
          ) : (
            <div className="divide-y divide-[#071a33]/6">
              {pending.map((r) => (
                <div key={r.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#071a33]">{r.orderItem.product.name}</p>
                    <p className="text-xs text-neutral-400">
                      {r.customer.name ?? r.customer.email} · {r.artisan.storeName} · {formatCurrency(r.orderItem.totalPrice)}
                    </p>
                  </div>
                  <RefundReturnButton id={r.id} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-[#071a33]/10">
        <CardContent className="p-0">
          <div className="px-5 py-3 border-b border-[#071a33]/8">
            <h2 className="text-sm font-bold text-[#071a33]">Histórico</h2>
          </div>
          {others.length === 0 ? (
            <div className="flex items-center gap-2 px-5 py-6 text-sm text-neutral-400">
              <RotateCcw className="size-4" /> Nenhuma devolução registrada ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#071a33]/8 text-xs text-neutral-400 uppercase tracking-wide">
                    <th className="text-left py-2 px-5">Produto</th>
                    <th className="text-left py-2 px-5">Cliente</th>
                    <th className="text-left py-2 px-5">Artesão</th>
                    <th className="text-right py-2 px-5">Valor</th>
                    <th className="text-left py-2 px-5">Status</th>
                    <th className="text-left py-2 px-5">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#071a33]/5">
                  {others.map((r) => {
                    const st = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.PENDING;
                    return (
                      <tr key={r.id}>
                        <td className="px-5 py-2.5 font-medium text-[#071a33]">{r.orderItem.product.name}</td>
                        <td className="px-5 py-2.5 text-neutral-500 text-xs">{r.customer.name ?? r.customer.email}</td>
                        <td className="px-5 py-2.5 text-neutral-500 text-xs">{r.artisan.storeName}</td>
                        <td className="px-5 py-2.5 text-right font-semibold">{formatCurrency(r.orderItem.totalPrice)}</td>
                        <td className="px-5 py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${st.color}`}>{st.label}</span>
                        </td>
                        <td className="px-5 py-2.5 text-xs text-neutral-400">{formatDate(r.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
