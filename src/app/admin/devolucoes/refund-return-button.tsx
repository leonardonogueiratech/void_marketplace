"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, RotateCcw } from "lucide-react";

export function RefundReturnButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleRefund() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/devolucoes/${id}/estornar`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao estornar."); return; }
      toast.success("Reembolso processado e estoque reposto.");
      setConfirming(false);
      router.refresh();
    } catch {
      toast.error("Erro ao estornar.");
    } finally {
      setLoading(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <button onClick={handleRefund} disabled={loading} className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50">
          {loading ? <Loader2 className="size-3 animate-spin inline" /> : "Confirmar?"}
        </button>
        <button onClick={() => setConfirming(false)} disabled={loading} className="text-xs text-neutral-400 hover:text-neutral-600">Não</button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1 text-xs bg-[#7c9f61]/10 text-[#7c9f61] border border-[#7c9f61]/20 px-3 py-1.5 rounded-full hover:bg-[#7c9f61]/20 transition-colors font-medium"
    >
      <RotateCcw className="size-3" />
      Processar reembolso
    </button>
  );
}
