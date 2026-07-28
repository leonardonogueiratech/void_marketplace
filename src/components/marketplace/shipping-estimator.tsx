"use client";

import { useState } from "react";
import { Loader2, Truck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import type { ShippingOption } from "@/lib/melhor-envio";

export function ShippingEstimator({ productId }: { productId: string }) {
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<ShippingOption[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function formatCep(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
  }

  async function handleCalculate() {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      setError("Informe um CEP válido.");
      return;
    }
    setLoading(true);
    setError(null);
    setOptions(null);
    try {
      const res = await fetch(`/api/frete?cep=${digits}&productIds=${productId}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao calcular frete."); return; }
      if (!data.options?.length) { setError("Nenhuma transportadora disponível pra esse CEP."); return; }
      setOptions(data.options);
    } catch {
      setError("Erro ao calcular frete. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-border rounded-lg p-4">
      <p className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 mb-3">
        <Truck className="size-4 text-[#27ae60]" /> Calcular frete
      </p>

      <div className="flex gap-2">
        <Input
          value={cep}
          onChange={(e) => setCep(formatCep(e.target.value))}
          onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
          placeholder="00000-000"
          maxLength={9}
          className="max-w-[160px]"
        />
        <Button type="button" variant="outline" onClick={handleCalculate} disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
        </Button>
      </div>

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

      {options && options.length > 0 && (
        <div className="mt-3 space-y-2">
          {options.map((o) => (
            <div key={o.id} className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium text-neutral-800">{o.label}</span>
                <span className="text-muted-foreground"> · {o.description}</span>
              </div>
              <span className="font-semibold text-[#1e3a5f]">{formatCurrency(o.price)}</span>
            </div>
          ))}
          <p className="text-[11px] text-neutral-400 pt-1">
            Frete deste produto. O valor final é confirmado no carrinho e pode mudar se você comprar mais itens.
          </p>
        </div>
      )}
    </div>
  );
}
