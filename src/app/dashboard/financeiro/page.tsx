import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { WithdrawalForm } from "@/components/dashboard/withdrawal-form";
import { MonthlyBarChart } from "@/components/dashboard/charts";
import { ExportButton } from "@/components/dashboard/export-button";

function buildMonthlyData(commissions: { createdAt: Date; saleAmount: number }[]) {
  const map = new Map<string, number>();
  for (const c of commissions) {
    const key = new Date(c.createdAt).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    map.set(key, (map.get(key) ?? 0) + c.saleAmount);
  }
  return Array.from(map.entries())
    .slice(-6)
    .map(([month, receita]) => ({ month, receita: Math.round(receita * 100) / 100 }));
}

export default async function FinancialPage() {
  const session = await auth();
  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId: session!.user.id },
    include: { subscription: true },
  });
  if (!artisan) return null;

  const [pendingCommissions, paidCommissions, allCommissions, withdrawals] = await Promise.all([
    prisma.commission.aggregate({
      where: { artisanId: artisan.id, paid: false },
      _sum: { amount: true, saleAmount: true },
      _count: true,
    }),
    prisma.commission.aggregate({
      where: { artisanId: artisan.id, paid: true },
      _sum: { amount: true, saleAmount: true },
    }),
    prisma.commission.findMany({
      where: { artisanId: artisan.id },
      orderBy: { createdAt: "asc" },
      select: {
        createdAt: true,
        saleAmount: true,
        amount: true,
        rate: true,
        paid: true,
        orderItem: { select: { product: { select: { name: true } } } },
      },
    }),
    prisma.withdrawal.findMany({
      where: { artisanId: artisan.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const totalSales =
    (pendingCommissions._sum.saleAmount ?? 0) + (paidCommissions._sum.saleAmount ?? 0);
  const totalCommissions =
    (pendingCommissions._sum.amount ?? 0) + (paidCommissions._sum.amount ?? 0);
  const availableBalance =
    (pendingCommissions._sum.saleAmount ?? 0) - (pendingCommissions._sum.amount ?? 0);
  const pendingWithdrawals = withdrawals.filter(
    (w) => w.status === "PENDING" || w.status === "PROCESSING"
  );
  const lockedAmount = pendingWithdrawals.reduce((a, w) => a + w.amount, 0);
  const freeBalance = availableBalance - lockedAmount;

  const monthlyData = buildMonthlyData(allCommissions);

  // Prepare CSV export data
  const csvData = allCommissions.map((c) => ({
    Data: formatDate(c.createdAt),
    Produto: c.orderItem.product.name,
    "Valor da venda": c.saleAmount.toFixed(2).replace(".", ","),
    "Comissão (%)": `${(c.rate * 100).toFixed(0)}%`,
    "Comissão (R$)": c.amount.toFixed(2).replace(".", ","),
    "Valor líquido": (c.saleAmount - c.amount).toFixed(2).replace(".", ","),
    Status: c.paid ? "Pago" : "Pendente",
  }));

  const withdrawalStatusConfig: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Aguardando", color: "bg-amber-100 text-amber-700" },
    PROCESSING: { label: "Processando", color: "bg-blue-100 text-blue-700" },
    PAID: { label: "Pago", color: "bg-[#27ae60]/10 text-[#27ae60]" },
    REJECTED: { label: "Rejeitado", color: "bg-red-100 text-red-700" },
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Financeiro</h1>
          <p className="text-sm text-neutral-500 mt-1">Resumo de receitas, comissões e saques.</p>
        </div>
        <ExportButton
          data={csvData}
          filename={`financeiro-${new Date().toISOString().slice(0, 10)}.csv`}
          label="Exportar CSV"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total em vendas", value: formatCurrency(totalSales), icon: TrendingUp, color: "text-[#1e3a5f]" },
          { label: "Saldo disponível", value: formatCurrency(freeBalance), icon: DollarSign, color: "text-[#27ae60]" },
          { label: "Aguardando saque", value: formatCurrency(lockedAmount), icon: Clock, color: "text-[#e07b2a]" },
          { label: "Plataforma recebeu", value: formatCurrency(totalCommissions), icon: CheckCircle2, color: "text-[#17a2b8]" },
        ].map(({ label, value, icon: Icon, color }) => (
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

      {/* Monthly chart */}
      <Card className="border-[#1e3a5f]/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-[#1e3a5f]">Receita por mês (últimos 6 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyBarChart data={monthlyData} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Withdrawal form */}
        <Card className="border-[#1e3a5f]/10">
          <CardHeader>
            <CardTitle className="text-base text-[#1e3a5f]">Solicitar saque</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-500 mb-4">
              Saldo disponível:{" "}
              <strong className="text-[#27ae60]">{formatCurrency(freeBalance)}</strong>
            </p>
            <WithdrawalForm maxAmount={freeBalance} artisanId={artisan.id} />
          </CardContent>
        </Card>

        {/* Withdrawal history */}
        <Card className="border-[#1e3a5f]/10">
          <CardHeader>
            <CardTitle className="text-base text-[#1e3a5f]">Histórico de saques</CardTitle>
          </CardHeader>
          <CardContent>
            {withdrawals.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-6">Nenhum saque solicitado.</p>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((w) => (
                  <div key={w.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1e3a5f]">{formatCurrency(w.amount)}</p>
                      <p className="text-xs text-neutral-400">
                        {formatDate(w.createdAt)} · PIX: {w.pixKey}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full ${withdrawalStatusConfig[w.status]?.color}`}
                    >
                      {withdrawalStatusConfig[w.status]?.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Commission table */}
      <Card className="border-[#1e3a5f]/10">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base text-[#1e3a5f]">
            Extrato de comissões
            <span className="ml-2 text-xs font-normal text-neutral-400">
              ({allCommissions.length} registros)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {allCommissions.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-8">Nenhuma comissão registrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e3a5f]/8">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-400 uppercase tracking-wide">Data</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-400 uppercase tracking-wide">Produto</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-neutral-400 uppercase tracking-wide">Venda</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-neutral-400 uppercase tracking-wide">Comissão</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-neutral-400 uppercase tracking-wide">Líquido</th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-neutral-400 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e3a5f]/6">
                  {allCommissions.slice(0, 20).map((c, i) => (
                    <tr key={i} className="hover:bg-[#f7f3ed]/60 transition-colors">
                      <td className="px-4 py-3 text-xs text-neutral-400">{formatDate(c.createdAt)}</td>
                      <td className="px-4 py-3 font-medium text-[#1e3a5f] max-w-[180px] truncate">{c.orderItem.product.name}</td>
                      <td className="px-4 py-3 text-right text-[#1e3a5f] font-medium">{formatCurrency(c.saleAmount)}</td>
                      <td className="px-4 py-3 text-right text-red-500 text-xs">−{formatCurrency(c.amount)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-[#27ae60]">{formatCurrency(c.saleAmount - c.amount)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.paid ? "bg-[#27ae60]/10 text-[#27ae60]" : "bg-amber-50 text-amber-700"}`}>
                          {c.paid ? "Pago" : "Pendente"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commission info */}
      <Card className="border-[#1e3a5f]/10 bg-[#f7f3ed]/50">
        <CardHeader>
          <CardTitle className="text-base text-[#1e3a5f]">Como funciona a comissão</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-neutral-500 space-y-1.5">
          <p>• A comissão varia conforme o plano: FREE 12%, Básico 8%, Pro 5%.</p>
          <p>• O saldo fica disponível para saque após confirmação do pagamento.</p>
          <p>• Saques são processados via PIX em até 2 dias úteis.</p>
          <p>• Valor mínimo para saque: <strong>R$ 50,00</strong>.</p>
        </CardContent>
      </Card>
    </div>
  );
}
