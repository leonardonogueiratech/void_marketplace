import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { WithdrawalActions } from "./withdrawal-actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Financeiro" };

export default async function AdminFinanceiroPage() {
  const [commissionStats, pendingWithdrawals, recentWithdrawals, paidCommissions] = await Promise.all([
    prisma.commission.aggregate({
      _sum: { amount: true, saleAmount: true },
    }),
    prisma.withdrawal.findMany({
      where: { status: "PENDING" },
      include: { artisan: { select: { storeName: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.withdrawal.findMany({
      where: { status: { not: "PENDING" } },
      include: { artisan: { select: { storeName: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.commission.aggregate({
      where: { paid: true },
      _sum: { amount: true },
    }),
  ]);

  const totalCommissions = commissionStats._sum.amount ?? 0;
  const paidAmount = paidCommissions._sum.amount ?? 0;
  const pendingAmount = totalCommissions - paidAmount;
  const totalSales = commissionStats._sum.saleAmount ?? 0;

  const statusColors: Record<string, string> = {
    PENDING:    "bg-amber-50 text-amber-700 border-amber-200",
    PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
    PAID:       "bg-green-50 text-green-700 border-green-200",
    REJECTED:   "bg-red-50 text-red-600 border-red-200",
  };

  const statusLabels: Record<string, string> = {
    PENDING: "Pendente", PROCESSING: "Processando",
    PAID: "Pago", REJECTED: "Rejeitado",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#071a33]">Financeiro</h1>
        <p className="text-sm text-neutral-500 mt-1">Comissões geradas e solicitações de saque.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Volume total de vendas", value: formatCurrency(totalSales), icon: TrendingUp, color: "text-[#071a33]", bg: "bg-[#071a33]/8" },
          { label: "Comissões geradas", value: formatCurrency(totalCommissions), icon: DollarSign, color: "text-[#7c9f61]", bg: "bg-[#7c9f61]/8" },
          { label: "Comissões pagas", value: formatCurrency(paidAmount), icon: CheckCircle2, color: "text-[#7c9f61]", bg: "bg-[#7c9f61]/8" },
          { label: "Saques pendentes", value: pendingWithdrawals.length, icon: Clock, color: "text-[#c1652e]", bg: "bg-[#c1652e]/8", alert: pendingWithdrawals.length > 0 },
        ].map(({ label, value, icon: Icon, color, bg, alert }) => (
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

      {/* Pending withdrawals */}
      <Card className="border-[#071a33]/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#071a33] flex items-center gap-2">
            Saques pendentes
            {pendingWithdrawals.length > 0 && (
              <span className="text-xs bg-[#c1652e] text-white px-2 py-0.5 rounded-full">
                {pendingWithdrawals.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingWithdrawals.length === 0 ? (
            <div className="flex items-center gap-2 py-4 text-sm text-[#7c9f61]">
              <CheckCircle2 className="size-4" /> Nenhum saque pendente.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingWithdrawals.map((w) => (
                <div key={w.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-[#071a33]/6 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#071a33]">{w.artisan.storeName}</p>
                    <p className="text-xs text-neutral-400">
                      Chave PIX: <span className="font-mono">{w.pixKey}</span>
                    </p>
                    <p className="text-xs text-neutral-400">{formatDate(w.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-base font-bold text-[#071a33]">{formatCurrency(w.amount)}</span>
                    <WithdrawalActions id={w.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent withdrawals history */}
      <Card className="border-[#071a33]/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#071a33]">Histórico de saques</CardTitle>
        </CardHeader>
        <CardContent>
          {recentWithdrawals.length === 0 ? (
            <p className="text-sm text-neutral-400 py-4">Nenhum saque processado ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#071a33]/8 text-xs text-neutral-400 uppercase tracking-wide">
                    <th className="text-left py-2 pr-4">Artesão</th>
                    <th className="text-left py-2 pr-4">Chave PIX</th>
                    <th className="text-right py-2 pr-4">Valor</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    <th className="text-left py-2">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentWithdrawals.map((w) => (
                    <tr key={w.id} className="border-b border-[#071a33]/5 last:border-0">
                      <td className="py-2.5 pr-4 font-medium text-[#071a33]">{w.artisan.storeName}</td>
                      <td className="py-2.5 pr-4 font-mono text-xs text-neutral-500">{w.pixKey}</td>
                      <td className="py-2.5 pr-4 text-right font-semibold">{formatCurrency(w.amount)}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[w.status] ?? ""}`}>
                          {statusLabels[w.status] ?? w.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-xs text-neutral-400">{formatDate(w.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commission breakdown */}
      <Card className="border-[#071a33]/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#071a33]">Resumo de comissões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total gerado", value: formatCurrency(totalCommissions), color: "text-[#071a33]" },
              { label: "Já pago aos artesãos", value: formatCurrency(paidAmount), color: "text-[#7c9f61]" },
              { label: "A pagar (pendente)", value: formatCurrency(pendingAmount), color: "text-[#c1652e]" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#f2ede0] rounded-xl p-4">
                <p className="text-xs text-neutral-500 mb-1">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
