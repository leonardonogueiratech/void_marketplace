"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MessageSquarePlus, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  reviewId: string;
  existingReply?: string | null;
}

export function ReviewReply({ reviewId, existingReply }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(existingReply ?? "");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao salvar resposta."); return; }
      toast.success("Resposta salva.");
      setEditing(false);
      router.refresh();
    } catch {
      toast.error("Erro ao salvar resposta.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao remover resposta."); return; }
      toast.success("Resposta removida.");
      setText("");
      setEditing(false);
      router.refresh();
    } catch {
      toast.error("Erro ao remover resposta.");
    } finally {
      setDeleting(false);
    }
  }

  if (!editing && existingReply) {
    return (
      <div className="mt-4 rounded-xl border border-[#1e3a5f]/10 bg-[#f7f3ed] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#1e3a5f] mb-1">Sua resposta</p>
            <p className="text-sm text-neutral-600 leading-relaxed">{existingReply}</p>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => { setText(existingReply); setEditing(true); }}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-[#1e3a5f] hover:bg-[#1e3a5f]/8 transition-colors"
              title="Editar resposta"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              title="Remover resposta"
            >
              {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#1e3a5f] hover:text-[#e07b2a] transition-colors"
      >
        <MessageSquarePlus className="size-3.5" />
        Responder avaliação
      </button>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <Textarea
        autoFocus
        rows={3}
        maxLength={1000}
        placeholder="Escreva sua resposta pública ao cliente..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="text-sm"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={loading || !text.trim()}
          className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white h-8 text-xs"
        >
          {loading ? <Loader2 className="size-3.5 animate-spin mr-1" /> : <Check className="size-3.5 mr-1" />}
          Publicar resposta
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => { setEditing(false); setText(existingReply ?? ""); }}
          className="h-8 text-xs"
        >
          <X className="size-3.5 mr-1" /> Cancelar
        </Button>
      </div>
    </div>
  );
}
