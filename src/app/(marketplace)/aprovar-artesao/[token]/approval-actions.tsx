"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ArtisanApprovalActions({ token }: { token: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState<"approve" | "reject" | null>(null);

  async function act(action: "approve" | "reject", rejectReason?: string) {
    setLoading(action);
    try {
      const res = await fetch(`/api/public/artesaos/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao processar."); return; }
      setDone(action);
    } catch {
      toast.error("Erro ao processar.");
    } finally {
      setLoading(null);
    }
  }

  if (done === "approve") {
    return (
      <div className="bg-white rounded-2xl border border-[#27ae60]/20 p-5 text-center">
        <CheckCircle2 className="size-6 text-[#27ae60] mx-auto mb-2" />
        <p className="text-sm font-semibold text-[#27ae60]">Cadastro aprovado!</p>
        <p className="text-xs text-neutral-400 mt-1">O artesão foi notificado por e-mail.</p>
      </div>
    );
  }

  if (done === "reject") {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-5 text-center">
        <XCircle className="size-6 text-red-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-red-500">Cadastro rejeitado</p>
        <p className="text-xs text-neutral-400 mt-1">O artesão foi notificado por e-mail.</p>
      </div>
    );
  }

  if (rejectOpen) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-5">
        <p className="text-sm font-semibold text-red-700 mb-2">Motivo da rejeição</p>
        <Textarea
          autoFocus
          rows={3}
          maxLength={300}
          placeholder="Ex: Produtos industrializados, fotos sem qualidade..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mb-3"
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={loading !== null} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={() => act("reject", reason || undefined)}
            disabled={loading !== null}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
          >
            {loading === "reject" && <Loader2 className="size-4 animate-spin mr-2" />}
            Confirmar rejeição
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Button
        onClick={() => act("approve")}
        disabled={loading !== null}
        className="flex-1 bg-[#27ae60] hover:bg-[#229954] text-white font-semibold"
      >
        {loading === "approve" ? <Loader2 className="size-4 animate-spin mr-2" /> : <CheckCircle2 className="size-4 mr-2" />}
        Aprovar
      </Button>
      <Button
        onClick={() => setRejectOpen(true)}
        disabled={loading !== null}
        variant="outline"
        className="flex-1 border-red-200 text-red-500 hover:bg-red-50"
      >
        <XCircle className="size-4 mr-2" />
        Rejeitar
      </Button>
    </div>
  );
}
