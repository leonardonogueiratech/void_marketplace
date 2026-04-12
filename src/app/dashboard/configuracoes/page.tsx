import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardSettingsPage() {
  const session = await auth();
  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId: session!.user.id },
    include: { subscription: true },
  });

  if (!artisan) return null;

  const withdrawals = await prisma.withdrawal.findMany({
    where: { artisanId: artisan.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="mt-1 text-muted-foreground">
          Visão geral de conta, plano e pagamentos da sua loja.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Responsável</p>
              <p className="font-medium">{session?.user.name ?? "Não informado"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{session?.user.email ?? "Não informado"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Perfil</p>
              <p className="font-medium">{session?.user.role ?? "ARTISAN"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assinatura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{artisan.subscription?.plan ?? "FREE"}</Badge>
              <Badge variant="outline">{artisan.subscription?.status ?? "ACTIVE"}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Período atual</p>
              <p className="font-medium">
                {artisan.subscription?.currentPeriodStart
                  ? `${formatDate(artisan.subscription.currentPeriodStart)} até ${formatDate(artisan.subscription.currentPeriodEnd ?? artisan.subscription.currentPeriodStart)}`
                  : "Sem cobrança recorrente ativa"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visibilidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Status da loja</p>
              <p className="font-medium">{artisan.status}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Loja em destaque</p>
              <p className="font-medium">{artisan.featured ? "Sim" : "Não"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">URL pública</p>
              <p className="font-medium">/artesao/{artisan.slug}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos saques</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum saque solicitado até agora.
            </p>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex flex-col gap-1 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{withdrawal.pixKey}</p>
                    <p className="text-sm text-muted-foreground">
                      Solicitado em {formatDate(withdrawal.createdAt)}
                    </p>
                  </div>
                  <Badge variant="outline">{withdrawal.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
