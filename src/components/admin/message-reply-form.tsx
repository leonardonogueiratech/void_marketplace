"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send, Loader2, ChevronDown, ChevronUp } from "lucide-react";

export function MessageReplyForm({ id, hasReply }: { id: string; hasReply: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!reply.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/mensagens/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      });
      if (!res.ok) { toast.error("Erro ao enviar resposta."); return; }
      toast.success("Resposta enviada! O cliente receberá um email.");
      setReply("");
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 border-t border-[#1e3a5f]/8 pt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1e3a5f] hover:text-[#e07b2a] transition-colors"
      >
        {open ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        {hasReply ? "Editar resposta" : "Responder"}
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Escreva a resposta para o cliente..."
            rows={4}
            className="w-full rounded-xl border border-[#1e3a5f]/15 px-3.5 py-2.5 text-sm text-[#1e3a5f] placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/40 resize-none transition-all"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={submit}
              disabled={!reply.trim() || loading}
              className="inline-flex items-center gap-1.5 text-xs bg-[#1e3a5f] text-white font-semibold px-4 py-2 rounded-full hover:bg-[#1e3a5f]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="size-3 animate-spin" /> : <Send className="size-3" />}
              Enviar resposta
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
