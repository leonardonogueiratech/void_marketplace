"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle, PauseCircle, Loader2 } from "lucide-react";

interface Props {
  artisanId: string;
  currentStatus: string;
}

export function ArtisanActions({ artisanId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function act(action: "approve" | "reject" | "suspend") {
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/artesaos/${artisanId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro."); return; }
      const labels = { approve: "Artesão aprovado!", reject: "Artesão rejeitado.", suspend: "Artesão suspenso." };
      toast.success(labels[action]);
      router.refresh();
    } catch {
      toast.error("Erro ao atualizar.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      {currentStatus !== "APPROVED" && (
        <button
          onClick={() => act("approve")}
          disabled={loading !== null}
          className="inline-flex items-center gap-1 text-xs bg-[#4a7c3f]/10 text-[#4a7c3f] border border-[#4a7c3f]/20 px-3 py-1.5 rounded-full hover:bg-[#4a7c3f]/20 transition-colors font-medium"
        >
          {loading === "approve" ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
          Aprovar
        </button>
      )}
      {currentStatus !== "REJECTED" && (
        <button
          onClick={() => act("reject")}
          disabled={loading !== null}
          className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-500 border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors font-medium"
        >
          {loading === "reject" ? <Loader2 className="size-3 animate-spin" /> : <XCircle className="size-3" />}
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
