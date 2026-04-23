"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCheck, Trash2, Loader2 } from "lucide-react";

export function MessageActions({ id, read }: { id: string; read: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"read" | "delete" | null>(null);

  async function markRead() {
    setLoading("read");
    try {
      await fetch(`/api/admin/mensagens/${id}`, { method: "PATCH" });
      router.refresh();
    } finally { setLoading(null); }
  }

  async function remove() {
    setLoading("delete");
    try {
      const res = await fetch(`/api/admin/mensagens/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Mensagem removida."); router.refresh(); }
    } finally { setLoading(null); }
  }

  return (
    <div className="flex items-center gap-1.5">
      {!read && (
        <button
          onClick={markRead}
          disabled={loading !== null}
          className="inline-flex items-center gap-1 text-xs bg-[#1e3a5f]/8 text-[#1e3a5f] border border-[#1e3a5f]/15 px-2.5 py-1 rounded-full hover:bg-[#1e3a5f]/15 transition-colors"
        >
          {loading === "read" ? <Loader2 className="size-3 animate-spin" /> : <CheckCheck className="size-3" />}
          Lida
        </button>
      )}
      <button
        onClick={remove}
        disabled={loading !== null}
        className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-500 border border-red-100 px-2.5 py-1 rounded-full hover:bg-red-100 transition-colors"
      >
        {loading === "delete" ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
        Excluir
      </button>
    </div>
  );
}
