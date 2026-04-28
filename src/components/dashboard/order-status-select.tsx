"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronDown, Truck } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const STATUS_OPTIONS = [
  { value: "PENDING",         label: "Pendente",           color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "PAYMENT_PENDING", label: "Aguard. pagamento",  color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { value: "PAID",            label: "Pago",               color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "PROCESSING",      label: "Em preparo",         color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { value: "SHIPPED",         label: "Enviado",            color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "DELIVERED",       label: "Entregue",           color: "bg-[#27ae60]/10 text-[#27ae60] border-[#27ae60]/20" },
  { value: "CANCELLED",       label: "Cancelado",          color: "bg-red-50 text-red-600 border-red-200" },
  { value: "REFUNDED",        label: "Reembolsado",        color: "bg-neutral-100 text-neutral-500 border-neutral-200" },
] as const;

export type OrderStatus = typeof STATUS_OPTIONS[number]["value"];

interface Props {
  orderId: string;
  currentStatus: string;
  currentTrackingCode?: string | null;
}

export function OrderStatusSelect({ orderId, currentStatus, currentTrackingCode }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [trackingCode, setTrackingCode] = useState(currentTrackingCode ?? "");
  const [open, setOpen] = useState(false);
  const [showTrackingInput, setShowTrackingInput] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const trackingRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showTrackingInput) trackingRef.current?.focus();
  }, [showTrackingInput]);

  const current = STATUS_OPTIONS.find((o) => o.value === status);

  async function submitChange(nextStatus: string, tracking?: string) {
    const prev = status;
    setStatus(nextStatus);
    setOpen(false);
    setShowTrackingInput(false);
    setPendingStatus(null);

    try {
      const res = await fetch(`/api/pedidos/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, trackingCode: tracking }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(prev);
        toast.error(data.error ?? "Erro ao atualizar.");
        return;
      }
      if (tracking) setTrackingCode(tracking);
      toast.success("Status atualizado.");
      startTransition(() => router.refresh());
    } catch {
      setStatus(prev);
      toast.error("Erro ao atualizar.");
    }
  }

  function handleSelect(next: string) {
    if (next === status) { setOpen(false); return; }
    if (next === "SHIPPED") {
      setPendingStatus(next);
      setOpen(false);
      setShowTrackingInput(true);
      return;
    }
    submitChange(next);
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Status pill button */}
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
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-[#f7f3ed] transition-colors ${status === opt.value ? "font-semibold" : ""}`}
                >
                  <span className={`size-2 rounded-full border ${opt.color}`} />
                  {opt.label}
                  {opt.value === "SHIPPED" && <Truck className="size-3 ml-auto text-purple-400" />}
                  {status === opt.value && opt.value !== "SHIPPED" && (
                    <span className="ml-auto text-[#27ae60]">✓</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Tracking code input — appears when SHIPPED is selected */}
      {showTrackingInput && (
        <div className="w-64 bg-white border border-purple-200 rounded-xl p-3 shadow-md space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700">
            <Truck className="size-3.5" /> Código de rastreio
          </div>
          <Input
            ref={trackingRef}
            placeholder="Ex: BR123456789BR"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            className="h-8 text-xs uppercase"
            onKeyDown={(e) => {
              if (e.key === "Enter") submitChange(pendingStatus!, trackingCode || undefined);
              if (e.key === "Escape") { setShowTrackingInput(false); setPendingStatus(null); }
            }}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => submitChange(pendingStatus!, trackingCode || undefined)}
              className="flex-1 h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white"
            >
              Confirmar envio
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setShowTrackingInput(false); setPendingStatus(null); }}
              className="h-7 text-xs"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Show existing tracking code */}
      {!showTrackingInput && trackingCode && status === "SHIPPED" && (
        <div className="flex items-center gap-1.5 text-xs text-purple-600 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-full">
          <Truck className="size-3" />
          <span className="font-mono font-medium">{trackingCode}</span>
        </div>
      )}
    </div>
  );
}
