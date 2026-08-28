"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ReturnRequestActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [note, setNote] = useState("");

  async function decide(action: "approve" | "reject") {
    setLoading(action);
    try {
      const res = await fetch(`/api/devolucoes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: action === "reject" ? note : undefined }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro."); return; }
      toast.success(action === "approve" ? "Devolução aprovada." : "Devolução recusada.");
      setRejectOpen(false);
      router.refresh();
    } catch {
      toast.error("Erro ao processar.");
    } finally {
      setLoading(null);
    }
  }

  async function confirmReceipt() {
    setLoading("confirm");
    try {
      const res = await fetch(`/api/devolucoes/${id}/confirmar`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro."); return; }
      toast.success("Recebimento confirmado.");
      router.refresh();
    } catch {
      toast.error("Erro ao confirmar.");
    } finally {
      setLoading(null);
    }
  }

  if (status === "PENDING") {
    if (rejectOpen) {
      return (
        <div className="flex flex-col gap-2 bg-red-50 border border-red-100 rounded-xl p-3 min-w-[240px]">
          <Textarea
            autoFocus
            rows={2}
            maxLength={500}
            placeholder="Motivo da recusa (opcional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="text-xs resize-none"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => decide("reject")} disabled={!!loading} className="h-7 text-xs bg-red-500 hover:bg-red-600 text-white flex-1">
              {loading === "reject" ? <Loader2 className="size-3 animate-spin" /> : "Confirmar recusa"}
            </Button>
            <button onClick={() => setRejectOpen(false)} className="text-xs text-neutral-400 hover:text-neutral-600">Cancelar</button>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => decide("approve")}
          disabled={!!loading}
          className="inline-flex items-center gap-1 text-xs bg-[#7c9f61]/10 text-[#7c9f61] border border-[#7c9f61]/20 px-3 py-1.5 rounded-full hover:bg-[#7c9f61]/20 transition-colors font-medium disabled:opacity-50"
        >
          {loading === "approve" ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
          Aprovar
        </button>
        <button
          onClick={() => setRejectOpen(true)}
          disabled={!!loading}
          className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-500 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors font-medium disabled:opacity-50"
        >
          <XCircle className="size-3" />
          Recusar
        </button>
      </div>
    );
  }

  if (status === "APPROVED" || status === "SHIPPED_BACK") {
    return (
      <button
        onClick={confirmReceipt}
        disabled={!!loading}
        className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors font-medium disabled:opacity-50"
      >
        {loading === "confirm" ? <Loader2 className="size-3 animate-spin" /> : <PackageCheck className="size-3" />}
        Confirmar recebimento
      </button>
    );
  }

  return null;
}
