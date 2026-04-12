"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendente" },
  { value: "PAYMENT_PENDING", label: "Aguard. pagamento" },
  { value: "PAID", label: "Pago" },
  { value: "PROCESSING", label: "Processando" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "DELIVERED", label: "Entregue" },
  { value: "CANCELLED", label: "Cancelado" },
  { value: "REFUNDED", label: "Reembolsado" },
] as const;

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: OrderStatusSelectProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  async function handleChange(nextStatus: string | null) {
    if (!nextStatus) return;

    const previousStatus = status;
    setStatus(nextStatus);

    try {
      const res = await fetch(`/api/pedidos/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(previousStatus);
        toast.error(data.error ?? "Erro ao atualizar pedido.");
        return;
      }

      toast.success("Status do pedido atualizado.");
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setStatus(previousStatus);
      toast.error("Erro ao atualizar pedido.");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger className="w-44" size="sm">
          <SelectValue placeholder="Atualizar status" />
        </SelectTrigger>
        <SelectContent align="end">
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && (
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}
