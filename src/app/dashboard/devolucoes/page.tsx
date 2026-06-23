import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";
import { ReturnRequestActions } from "@/components/dashboard/return-request-actions";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:      { label: "Aguardando análise", color: "bg-amber-50 text-amber-700 border-amber-200" },
  APPROVED:     { label: "Aprovada — aguardando envio", color: "bg-blue-50 text-blue-600 border-blue-200" },
  REJECTED:     { label: "Recusada", color: "bg-red-50 text-red-500 border-red-200" },
  SHIPPED_BACK: { label: "A caminho de volta", color: "bg-purple-50 text-purple-600 border-purple-200" },
  RECEIVED:     { label: "Recebida — reembolso pendente", color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  REFUNDED:     { label: "Reembolsada", color: "bg-[#27ae60]/10 text-[#27ae60] border-[#27ae60]/20" },
};

const REASON_LABELS: Record<string, string> = {
  NOT_LIKED: "Não gostou", DEFECTIVE: "Defeito", DAMAGED: "Danificado",
  WRONG_ITEM: "Produto errado", OTHER: "Outro motivo",
};

export default async function DashboardReturnsPage() {
  const session = await auth();
  const artisan = await prisma.artisanProfile.findUnique({ where: { userId: session!.user.id } });
  if (!artisan) return null;

  const returns = await prisma.returnRequest.findMany({
    where: { artisanId: artisan.id },
    include: {
      customer: { select: { name: true, email: true } },
      orderItem: { select: { id: true, quantity: true, totalPrice: true, product: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Devoluções</h1>
        <p className="text-sm text-neutral-500 mt-1">Solicitações de devolução dos seus produtos.</p>
      </div>

      <Card className="border-[#1e3a5f]/10">
        <CardContent className="p-0">
          {returns.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <RotateCcw className="size-8 text-neutral-200 mb-3" />
              <p className="text-sm text-neutral-400">Nenhuma solicitação de devolução.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1e3a5f]/6">
              {returns.map((r) => {
                const photos: string[] = JSON.parse(r.photos || "[]");
                const st = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.PENDING;
                return (
                  <div key={r.id} className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-[#1e3a5f] text-sm">{r.orderItem.product.name}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${st.color}`}>{st.label}</span>
                      </div>
                      <p className="text-xs text-neutral-400">
                        {r.customer.name ?? r.customer.email} · {REASON_LABELS[r.reason] ?? r.reason} · {formatCurrency(r.orderItem.totalPrice)}
                      </p>
                      {r.description && <p className="text-xs text-neutral-500 mt-1.5">{r.description}</p>}
                      {photos.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {photos.map((url) => (
                            <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                              <img src={url} alt="Foto da devolução" className="size-16 rounded-lg object-cover border border-[#1e3a5f]/10" />
                            </a>
                          ))}
                        </div>
                      )}
                      {r.returnTrackingCode && (
                        <p className="text-xs text-purple-600 mt-1.5 font-mono">Rastreio: {r.returnTrackingCode}</p>
                      )}
                      <p className="text-xs text-neutral-300 mt-1">{formatDate(r.createdAt)}</p>
                    </div>
                    <div className="shrink-0">
                      <ReturnRequestActions id={r.id} status={r.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
