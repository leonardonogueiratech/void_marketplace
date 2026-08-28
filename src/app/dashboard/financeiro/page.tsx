import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Clock, CheckCircle2, Landmark } from "lucide-react";
import { WithdrawalForm } from "@/components/dashboard/withdrawal-form";
import { PixKeyForm } from "@/components/dashboard/pix-key-form";
import { MonthlyBarChart } from "@/components/dashboard/charts";
import { ExportButton } from "@/components/dashboard/export-button";
import { getArtisanBalance } from "@/lib/balance";

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

  // Retenção de 15 dias: dinheiro só disponível após entrega ou decorridos 15 dias
  const ESCROW_DAYS = 15;
  const escrowCutoff = new Date(Date.now() - ESCROW_DAYS * 24 * 60 * 60 * 1000);

  const [allCommissions, withdrawals, balance] = await Promise.all([
    prisma.commission.findMany({
      where: { artisanId: artisan.id },
      orderBy: { createdAt: "asc" },
      select: {
        createdAt: true,
        saleAmount: true,
        amount: true,
        rate: true,
        paid: true,
        orderItem: {
          select: {
            product: { select: { name: true } },
            order: { select: { status: true, deliveredAt: true } },
          },
        },
      },
    }),
    prisma.withdrawal.findMany({
      where: { artisanId: artisan.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    getArtisanBalance(artisan.id),
  ]);

  const { heldBalance, totalSales, totalCommissions, freeBalance } = balance;

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
    PAID: { label: "Pago", color: "bg-[#7c9f61]/10 text-[#7c9f61]" },
    REJECTED: { label: "Rejeitado", color: "bg-red-100 text-red-700" },
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#071a33]">Financeiro</h1>
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
          { label: "Total em vendas", value: formatCurrency(totalSales), icon: TrendingUp, color: "text-[#071a33]" },
          { label: "Disponível p/ saque", value: formatCurrency(freeBalance), icon: DollarSign, color: "text-[#7c9f61]" },
          { label: "Retido (em entrega)", value: formatCurrency(heldBalance), icon: Clock, color: "text-[#c1652e]" },
          { label: "Comissão plataforma", value: formatCurrency(totalCommissions), icon: CheckCircle2, color: "text-[#17a2b8]" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-[#071a33]/10">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-neutral-500">{label}</span>
                <Icon className={`size-4 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-[#071a33]">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly chart */}
      <Card className="border-[#071a33]/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-[#071a33]">Receita por mês (últimos 6 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyBarChart data={monthlyData} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados bancários */}
        <Card className="border-[#071a33]/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#071a33] flex items-center gap-2">
              <Landmark className="size-4" /> Dados bancários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PixKeyForm savedPixKey={artisan.pixKey} />
          </CardContent>
        </Card>

        {/* Withdrawal form */}
        <Card className="border-[#071a33]/10">
          <CardHeader>
            <CardTitle className="text-base text-[#071a33]">Solicitar saque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-neutral-500 mb-4 space-y-1">
              <p>
                Disponível:{" "}
                <strong className="text-[#7c9f61]">{formatCurrency(freeBalance)}</strong>
              </p>
              {heldBalance > 0 && (
                <p className="text-xs text-[#c1652e]">
                  {formatCurrency(heldBalance)} retidos — liberados após entrega ou 15 dias
                </p>
              )}
            </div>
            <WithdrawalForm maxAmount={freeBalance} artisanId={artisan.id} savedPixKey={artisan.pixKey} />
          </CardContent>
        </Card>

        {/* Withdrawal history */}
        <Card className="border-[#071a33]/10">
          <CardHeader>
            <CardTitle className="text-base text-[#071a33]">Histórico de saques</CardTitle>
          </CardHeader>
          <CardContent>
            {withdrawals.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-6">Nenhum saque solicitado.</p>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((w) => (
                  <div key={w.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#071a33]">{formatCurrency(w.amount)}</p>
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
      <Card className="border-[#071a33]/10">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base text-[#071a33]">
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
            <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-[#071a33]/8">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-400 uppercase tracking-wide">Data</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-400 uppercase tracking-wide">Produto</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-neutral-400 uppercase tracking-wide">Venda</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-neutral-400 uppercase tracking-wide">Comissão</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-neutral-400 uppercase tracking-wide">Líquido</th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-neutral-400 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#071a33]/6">
                  {allCommissions.map((c, i) => (
                    <tr key={i} className="hover:bg-[#f2ede0]/60 transition-colors">
                      <td className="px-4 py-3 text-xs text-neutral-400">{formatDate(c.createdAt)}</td>
                      <td className="px-4 py-3 font-medium text-[#071a33] max-w-[180px] truncate">{c.orderItem.product.name}</td>
                      <td className="px-4 py-3 text-right text-[#071a33] font-medium">{formatCurrency(c.saleAmount)}</td>
                      <td className="px-4 py-3 text-right text-red-500 text-xs">−{formatCurrency(c.amount)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-[#7c9f61]">{formatCurrency(c.saleAmount - c.amount)}</td>
                      <td className="px-4 py-3 text-center">
                        {c.paid ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#7c9f61]/10 text-[#7c9f61]">Sacado</span>
                        ) : c.orderItem.order.status === "DELIVERED" || c.createdAt <= escrowCutoff ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Disponível</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Retido</span>
                        )}
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
      <Card className="border-[#071a33]/10 bg-[#f2ede0]/50">
        <CardHeader>
          <CardTitle className="text-base text-[#071a33]">Como funciona a comissão</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-neutral-500 space-y-1.5">
          <p>• Comissão única de 15% sobre vendas, igual para todos os planos.</p>
          <p>• O saldo fica disponível para saque após confirmação do pagamento.</p>
          <p>• Saques são processados via PIX em até 2 dias úteis.</p>
          <p>• Valor mínimo para saque: <strong>R$ 50,00</strong>.</p>
        </CardContent>
      </Card>
    </div>
  );
}
