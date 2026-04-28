"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle, PauseCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  artisanId: string;
  currentStatus: string;
}

export function ArtisanActions({ artisanId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  async function act(action: "approve" | "reject" | "suspend", rejectReason?: string) {
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/artesaos/${artisanId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro."); return; }
      const labels = { approve: "Artesão aprovado!", reject: "Artesão rejeitado.", suspend: "Artesão suspenso." };
      toast.success(labels[action]);
      setRejectOpen(false);
      setReason("");
      router.refresh();
    } catch {
      toast.error("Erro ao atualizar.");
    } finally {
      setLoading(null);
    }
  }

  if (rejectOpen) {
    return (
      <div className="flex flex-col gap-2 bg-red-50 border border-red-100 rounded-xl p-3 min-w-[240px]">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-red-700">Motivo da rejeição</p>
          <button onClick={() => setRejectOpen(false)} className="text-neutral-400 hover:text-neutral-600">
            <X className="size-3.5" />
          </button>
        </div>
        <Textarea
          autoFocus
          rows={2}
          maxLength={300}
          placeholder="Ex: Produtos industrializados, fotos sem qualidade..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="text-xs resize-none"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => act("reject", reason || undefined)}
            disabled={loading !== null}
            className="h-7 text-xs bg-red-500 hover:bg-red-600 text-white flex-1"
          >
            {loading === "reject" ? <Loader2 className="size-3 animate-spin mr-1" /> : <XCircle className="size-3 mr-1" />}
            Confirmar rejeição
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {currentStatus !== "APPROVED" && (
        <button
          onClick={() => act("approve")}
          disabled={loading !== null}
          className="inline-flex items-center gap-1 text-xs bg-[#27ae60]/10 text-[#27ae60] border border-[#27ae60]/20 px-3 py-1.5 rounded-full hover:bg-[#27ae60]/20 transition-colors font-medium"
        >
          {loading === "approve" ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
          Aprovar
        </button>
      )}
      {currentStatus !== "REJECTED" && (
        <button
          onClick={() => setRejectOpen(true)}
          disabled={loading !== null}
          className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-500 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors font-medium"
        >
          <XCircle className="size-3" />
          Rejeitar
        </button>
      )}
      {currentStatus === "APPROVED" && (
        <button
          onClick={() => act("suspend")}
          disabled={loading !== null}
          className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors font-medium"
        >
          {loading === "suspend" ? <Loader2 className="size-3 animate-spin" /> : <PauseCircle className="size-3" />}
          Suspender
        </button>
      )}
    </div>
  );
}
