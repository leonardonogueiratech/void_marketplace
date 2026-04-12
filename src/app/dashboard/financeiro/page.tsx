import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { WithdrawalForm } from "@/components/dashboard/withdrawal-form";

export default async function FinancialPage() {
  const session = await auth();
  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId: session!.user.id },
    include: { subscription: true },
  });
  if (!artisan) return null;

  const [pendingCommissions, paidCommissions, withdrawals] = await Promise.all([
    prisma.commission.aggregate({
      where: { artisanId: artisan.id, paid: false },
      _sum: { amount: true, saleAmount: true },
      _count: true,
    }),
    prisma.commission.aggregate({
      where: { artisanId: artisan.id, paid: true },
      _sum: { amount: true, saleAmount: true },
    }),
    prisma.withdrawal.findMany({
      where: { artisanId: artisan.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const totalSales = (pendingCommissions._sum.saleAmount ?? 0) + (paidCommissions._sum.saleAmount ?? 0);
  const totalCommissions = (pendingCommissions._sum.amount ?? 0) + (paidCommissions._sum.amount ?? 0);
  const availableBalance = (pendingCommissions._sum.saleAmount ?? 0) - (pendingCommissions._sum.amount ?? 0);
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "PENDING" || w.status === "PROCESSING");
  const lockedAmount = pendingWithdrawals.reduce((a, w) => a + w.amount, 0);
  const freeBalance = availableBalance - lockedAmount;

  const withdrawalStatusConfig: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Aguardando", color: "bg-amber-100 text-amber-700" },
    PROCESSING: { label: "Processando", color: "bg-blue-100 text-blue-700" },
    PAID: { label: "Pago", color: "bg-green-100 text-green-700" },
    REJECTED: { label: "Rejeitado", color: "bg-red-100 text-red-700" },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Financeiro</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total em vendas", value: formatCurrency(totalSales), icon: TrendingUp, color: "text-blue-600" },
          { label: "Saldo disponível", value: formatCurrency(freeBalance), icon: DollarSign, color: "text-green-600" },
          { label: "Aguardando saque", value: formatCurrency(lockedAmount), icon: Clock, color: "text-amber-600" },
          { label: "Plataforma recebeu", value: formatCurrency(totalCommissions), icon: CheckCircle2, color: "text-purple-600" },
        ].map(({ label, value, icon: Icon, color }) => (
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
        {/* Withdrawal form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Solicitar saque</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Saldo disponível: <strong>{formatCurrency(freeBalance)}</strong>
            </p>
            <WithdrawalForm maxAmount={freeBalance} artisanId={artisan.id} />
          </CardContent>
        </Card>

        {/* Withdrawal history */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Histórico de saques</CardTitle>
          </CardHeader>
          <CardContent>
            {withdrawals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum saque solicitado.</p>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((w) => (
                  <div key={w.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{formatCurrency(w.amount)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(w.createdAt)} · PIX: {w.pixKey}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${withdrawalStatusConfig[w.status]?.color}`}>
                      {withdrawalStatusConfig[w.status]?.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Commission info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Como funciona a comissão</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• A plataforma retém <strong>10%</strong> de comissão sobre cada venda confirmada.</p>
          <p>• O saldo fica disponível para saque após confirmação do pagamento.</p>
          <p>• Saques são processados via PIX em até 2 dias úteis.</p>
          <p>• Valor mínimo para saque: <strong>R$ 50,00</strong>.</p>
        </CardContent>
      </Card>
    </div>
  );
}
