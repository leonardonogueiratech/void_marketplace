"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusSelect, STATUS_OPTIONS } from "./order-status-select";
import { Package } from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  totalPrice: number;
  product: { name: string; slug: string };
  order: {
    id: string;
    status: string;
    trackingCode: string | null;
    createdAt: Date;
    user: { name: string | null; email: string };
    customer: {
      street: string; number: string; complement: string | null;
      city: string; state: string; zipCode: string;
    } | null;
    payment: { method: string; status: string } | null;
  };
}

const PAYMENT_LABELS: Record<string, string> = {
  PIX: "PIX", CREDIT_CARD: "Cartão", BOLETO: "Boleto",
};

const ALL = "ALL";

export function OrdersList({ items }: { items: OrderItem[] }) {
  const [filter, setFilter] = useState(ALL);

  const counts: Record<string, number> = { [ALL]: items.length };
  for (const item of items) {
    counts[item.order.status] = (counts[item.order.status] ?? 0) + 1;
  }

  const visible = filter === ALL ? items : items.filter((i) => i.order.status === filter);

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter(ALL)}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
            filter === ALL
              ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
              : "bg-white text-neutral-500 border-[#1e3a5f]/15 hover:border-[#1e3a5f]/30"
          }`}
        >
          Todos
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filter === ALL ? "bg-white/20" : "bg-neutral-100"}`}>
            {counts[ALL]}
          </span>
        </button>

        {STATUS_OPTIONS.filter((o) => counts[o.value]).map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
              filter === opt.value
                ? `${opt.color} shadow-sm`
                : "bg-white text-neutral-500 border-[#1e3a5f]/15 hover:border-[#1e3a5f]/30"
            }`}
          >
            {opt.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filter === opt.value ? "bg-white/30" : "bg-neutral-100"}`}>
              {counts[opt.value]}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <Card className="border-[#1e3a5f]/10">
          <CardContent className="py-14 text-center">
            <Package className="size-8 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-400">Nenhum pedido neste status.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((item) => {
            return (
              <Card key={item.id} className="border-[#1e3a5f]/10 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      {/* Order ID + date */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-neutral-400 bg-[#f7f3ed] px-2 py-0.5 rounded">
                          #{item.order.id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-xs text-neutral-400">{formatDate(item.order.createdAt)}</span>
                        {item.order.payment && (
                          <span className="text-xs text-neutral-400 border border-[#1e3a5f]/10 px-2 py-0.5 rounded-full">
                            {PAYMENT_LABELS[item.order.payment.method] ?? item.order.payment.method}
                          </span>
                        )}
                      </div>

                      {/* Product */}
                      <div>
                        <p className="font-semibold text-[#1e3a5f]">{item.product.name}</p>
                        <p className="text-sm text-neutral-500">
                          {item.quantity}× · {formatCurrency(item.totalPrice)}
                        </p>
                      </div>

                      {/* Buyer */}
                      <div className="text-sm">
                        <p className="font-medium text-neutral-700">{item.order.user.name}</p>
                        <p className="text-xs text-neutral-400">{item.order.user.email}</p>
                        {item.order.customer && (
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {item.order.customer.street}, {item.order.customer.number}
                            {item.order.customer.complement ? ` ${item.order.customer.complement}` : ""}{" "}
                            — {item.order.customer.city}/{item.order.customer.state} · CEP {item.order.customer.zipCode}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status selector */}
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <OrderStatusSelect
                        orderId={item.order.id}
                        currentStatus={item.order.status}
                        currentTrackingCode={item.order.trackingCode}
                      />
                      <span className="text-lg font-bold text-[#1e3a5f]">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
