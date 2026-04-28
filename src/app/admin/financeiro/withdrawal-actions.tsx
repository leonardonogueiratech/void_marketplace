"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function WithdrawalActions({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function update(status: "PROCESSED" | "REJECTED") {
    setLoading(status === "PROCESSED" ? "approve" : "reject");
    try {
      const res = await fetch(`/api/admin/saques/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(status === "PROCESSED" ? "Saque marcado como processado." : "Saque rejeitado.");
      router.refresh();
    } catch {
      toast.error("Erro ao atualizar saque.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => update("PROCESSED")}
        disabled={!!loading}
        className="inline-flex items-center gap-1 text-xs bg-[#4a7c3f]/10 text-[#4a7c3f] border border-[#4a7c3f]/20 px-3 py-1.5 rounded-full hover:bg-[#4a7c3f]/20 transition-colors font-medium disabled:opacity-50"
      >
        {loading === "approve" ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
        Processar
      </button>
      <button
        onClick={() => update("REJECTED")}
        disabled={!!loading}
        className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-500 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors font-medium disabled:opacity-50"
      >
        {loading === "reject" ? <Loader2 className="size-3 animate-spin" /> : <XCircle className="size-3" />}
        Rejeitar
      </button>
    </div>
  );
}
