import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Store, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SubscriptionPanel } from "./subscription-panel";

export default async function DashboardSettingsPage() {
  const session = await auth();
  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId: session!.user.id },
    include: { subscription: true },
  });
  if (!artisan) return null;

  const sub = artisan.subscription;

  const storeStatusLabels: Record<string, { label: string; color: string }> = {
    APPROVED: { label: "Aprovada", color: "bg-[#4a7c3f]/10 text-[#4a7c3f] border-[#4a7c3f]/20" },
    PENDING:  { label: "Em análise", color: "bg-amber-50 text-amber-700 border-amber-200" },
    REJECTED: { label: "Rejeitada", color: "bg-red-50 text-red-600 border-red-200" },
    SUSPENDED:{ label: "Suspensa", color: "bg-neutral-100 text-neutral-500 border-neutral-200" },
  };
  const storeStatus = storeStatusLabels[artisan.status] ?? storeStatusLabels.PENDING;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Configurações</h1>
        <p className="text-sm text-neutral-500 mt-1">Conta, plano e visibilidade da loja.</p>
      </div>

      {/* Account + store info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-[#1e3a5f]/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-[#1e3a5f] flex items-center gap-2">
              <User className="size-4" /> Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-neutral-400">Nome</p>
              <p className="font-medium text-[#1e3a5f]">{session?.user.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400">Email</p>
              <p className="font-medium text-[#1e3a5f] truncate">{session?.user.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400">Membro desde</p>
              <p className="font-medium text-[#1e3a5f]">{formatDate(artisan.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#1e3a5f]/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-[#1e3a5f] flex items-center gap-2">
              <Store className="size-4" /> Loja
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-neutral-400">Status da loja</p>
              <span className={`inline-flex text-xs font-semibold px-2.5 py-0.5 rounded-full border mt-1 ${storeStatus.color}`}>
                {storeStatus.label}
              </span>
            </div>
            <div>
              <p className="text-xs text-neutral-400">URL pública</p>
              <p className="font-medium text-[#1e3a5f] text-xs">/artesao/{artisan.slug}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400">Destaque</p>
              <p className="font-medium text-[#1e3a5f]">{artisan.featured ? "Sim" : "Não"}</p>
            </div>
            <Button variant="outline" size="sm" asChild className="w-full mt-1 border-[#1e3a5f]/20 text-[#1e3a5f] text-xs">
              <Link href={`/artesao/${artisan.slug}`} target="_blank">
                <ExternalLink className="mr-1.5 size-3" /> Ver loja pública
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Subscription management */}
      <Card className="border-[#1e3a5f]/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#1e3a5f]">Plano e assinatura</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionPanel
            currentPlan={sub?.plan ?? "FREE"}
            currentStatus={sub?.status ?? "ACTIVE"}
            periodEnd={sub?.currentPeriodEnd ?? null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
