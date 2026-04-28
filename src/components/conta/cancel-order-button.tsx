"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    setLoading(true);
    try {
      const res = await fetch(`/api/pedidos/${orderId}/cancelar`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao cancelar."); return; }
      toast.success("Pedido cancelado.");
      setConfirming(false);
      router.refresh();
    } catch {
      toast.error("Erro ao cancelar pedido.");
    } finally {
      setLoading(false);
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-xs text-red-400 hover:text-red-600 underline underline-offset-2 transition-colors"
      >
        Cancelar pedido
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
      <X className="size-3.5 text-red-500 shrink-0" />
      <span className="text-xs text-red-600 font-medium">Confirmar cancelamento?</span>
      <Button
        size="sm"
        onClick={handleCancel}
        disabled={loading}
        className="h-6 px-2.5 text-xs bg-red-500 hover:bg-red-600 text-white"
      >
        {loading ? <Loader2 className="size-3 animate-spin" /> : "Sim"}
      </Button>
      <button
        onClick={() => setConfirming(false)}
        className="text-xs text-neutral-400 hover:text-neutral-600"
      >
        Não
      </button>
    </div>
  );
}
