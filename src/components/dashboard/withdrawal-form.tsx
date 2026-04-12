"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function WithdrawalForm({ maxAmount, artisanId }: { maxAmount: number; artisanId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ amount: "", pixKey: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (amount < 50) { toast.error("Valor mínimo para saque: R$ 50,00"); return; }
    if (amount > maxAmount) { toast.error("Saldo insuficiente."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/saques", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, pixKey: form.pixKey, artisanId }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao solicitar saque."); return; }
      toast.success("Saque solicitado com sucesso!");
      setForm({ amount: "", pixKey: "" });
      router.refresh();
    } catch {
      toast.error("Erro ao solicitar saque.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label>Valor (R$)</Label>
        <Input
          type="number"
          min="50"
          max={maxAmount}
          step="0.01"
          required
          placeholder="Mínimo R$ 50,00"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Chave PIX</Label>
        <Input
          required
          placeholder="CPF, email, telefone ou chave aleatória"
          value={form.pixKey}
          onChange={(e) => setForm({ ...form, pixKey: e.target.value })}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading || maxAmount < 50}>
        {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
        Solicitar saque
      </Button>
    </form>
  );
}
