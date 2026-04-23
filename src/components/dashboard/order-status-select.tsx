"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export const STATUS_OPTIONS = [
  { value: "PENDING",         label: "Pendente",           color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "PAYMENT_PENDING", label: "Aguard. pagamento",  color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "PAID",            label: "Pago",               color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "PROCESSING",      label: "Processando",        color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { value: "SHIPPED",         label: "Enviado",            color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "DELIVERED",       label: "Entregue",           color: "bg-[#4a7c3f]/10 text-[#4a7c3f] border-[#4a7c3f]/20" },
  { value: "CANCELLED",       label: "Cancelado",          color: "bg-red-50 text-red-600 border-red-200" },
  { value: "REFUNDED",        label: "Reembolsado",        color: "bg-neutral-100 text-neutral-500 border-neutral-200" },
] as const;

export type OrderStatus = typeof STATUS_OPTIONS[number]["value"];

interface Props {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusSelect({ orderId, currentStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const current = STATUS_OPTIONS.find((o) => o.value === status);

  async function handleChange(next: string) {
    if (next === status) { setOpen(false); return; }
    const prev = status;
    setStatus(next);
    setOpen(false);
    try {
      const res = await fetch(`/api/pedidos/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus(prev); toast.error(data.error ?? "Erro ao atualizar."); return; }
      toast.success("Status atualizado.");
      startTransition(() => router.refresh());
    } catch {
      setStatus(prev);
      toast.error("Erro ao atualizar.");
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all hover:opacity-80 ${current?.color ?? "bg-neutral-100 text-neutral-500 border-neutral-200"}`}
      >
        {isPending ? <Loader2 className="size-3 animate-spin" /> : current?.label ?? status}
        <ChevronDown className="size-3 opacity-60" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-50 w-48 bg-white rounded-xl border border-[#1e3a5f]/10 shadow-xl overflow-hidden py-1">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleChange(opt.value)}
                className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-[#f7f3ed] transition-colors ${status === opt.value ? "font-semibold" : ""}`}
              >
                <span className={`w-2 h-2 rounded-full border ${opt.color}`} />
                {opt.label}
                {status === opt.value && <span className="ml-auto text-[#4a7c3f]">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
