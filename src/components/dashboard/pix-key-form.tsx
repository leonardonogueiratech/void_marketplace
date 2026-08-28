"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function PixKeyForm({ savedPixKey }: { savedPixKey: string | null }) {
  const router = useRouter();
  const [editing, setEditing] = useState(!savedPixKey);
  const [pixKey, setPixKey] = useState(savedPixKey ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (pixKey.trim().length < 5) { toast.error("Chave PIX inválida."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/pix-key", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pixKey: pixKey.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao salvar."); return; }
      toast.success("Chave PIX salva!");
      setEditing(false);
      router.refresh();
    } catch {
      toast.error("Erro ao salvar chave PIX.");
    } finally {
      setLoading(false);
    }
  }

  if (!editing && savedPixKey) {
    return (
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-neutral-400 mb-0.5">Chave PIX cadastrada</p>
          <p className="text-sm font-medium text-[#071a33] break-all">{savedPixKey}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 border-[#071a33]/20 text-[#071a33] text-xs"
          onClick={() => setEditing(true)}
        >
          <Pencil className="mr-1.5 size-3" /> Alterar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Chave PIX para recebimento</Label>
        <Input
          placeholder="CPF, email, telefone ou chave aleatória"
          value={pixKey}
          onChange={(e) => setPixKey(e.target.value)}
          className="border-[#071a33]/20 focus-visible:ring-[#7c9f61]"
        />
        <p className="text-[11px] text-neutral-400">
          Esta chave será usada para seus saques. Você pode alterar a qualquer momento.
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-[#7c9f61] hover:bg-[#219a52] text-white"
          size="sm"
        >
          {loading ? <Loader2 className="mr-1.5 size-3 animate-spin" /> : <Check className="mr-1.5 size-3" />}
          Salvar chave PIX
        </Button>
        {savedPixKey && (
          <Button variant="ghost" size="sm" onClick={() => { setPixKey(savedPixKey); setEditing(false); }}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}
