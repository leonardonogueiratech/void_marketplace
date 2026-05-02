"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusSelect, STATUS_OPTIONS } from "./order-status-select";
import { EtiquetaModal } from "./etiqueta-modal";
import { Package, Printer, Download } from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  totalPrice: number;
  product: { name: string; slug: string };
  order: {
    id: string;
    status: string;
    trackingCode: string | null;
    labelUrl: string | null;
    melhorEnvioOrderId: string | null;
    shippingServiceId: number | null;
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

const SHIPPABLE_STATUSES = ["PAID", "PROCESSING", "SHIPPED"];

export function OrdersList({ items }: { items: OrderItem[] }) {
  const [filter, setFilter] = useState(ALL);
  const [etiquetaOrderId, setEtiquetaOrderId] = useState<string | null>(null);
  const [labelState, setLabelState] = useState<Record<string, { labelUrl: string; trackingCode: string | null }>>({});

  const counts: Record<string, number> = { [ALL]: items.length };
  for (const item of items) {
    counts[item.order.status] = (counts[item.order.status] ?? 0) + 1;
  }

  const visible = filter === ALL ? items : items.filter((i) => i.order.status === filter);
  const activeModal = etiquetaOrderId
    ? items.find((i) => i.order.id === etiquetaOrderId)
    : null;

  function handleEtiquetaSuccess(orderId: string, labelUrl: string, trackingCode: string | null) {
    setLabelState((prev) => ({ ...prev, [orderId]: { labelUrl, trackingCode } }));
    setEtiquetaOrderId(null);
  }

  return (
    <>
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
              const currentLabel = labelState[item.order.id];
              const labelUrl = currentLabel?.labelUrl ?? item.order.labelUrl;
              const trackingCode = currentLabel?.trackingCode ?? item.order.trackingCode;
              const canGenerateLabel = SHIPPABLE_STATUSES.includes(item.order.status);

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

                        {/* Tracking code */}
                        {trackingCode && (
                          <div className="inline-flex items-center gap-1.5 bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 rounded-lg px-2.5 py-1.5">
                            <Package className="size-3 text-[#1e3a5f]" />
                            <span className="text-xs font-mono font-semibold text-[#1e3a5f]">{trackingCode}</span>
                          </div>
                        )}

                        {/* Etiqueta button / download */}
                        {canGenerateLabel && (
                          <div className="flex gap-2 mt-1">
                            {labelUrl ? (
                              <a
                                href={labelUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#27ae60] hover:text-[#1f8a4c] border border-[#27ae60]/30 rounded-lg px-3 py-1.5 transition-colors hover:bg-[#27ae60]/5"
                              >
                                <Download className="size-3" /> Baixar etiqueta
                              </a>
                            ) : null}
                            <button
                              onClick={() => setEtiquetaOrderId(item.order.id)}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#e07b2a] hover:text-[#c96a1e] border border-[#e07b2a]/30 rounded-lg px-3 py-1.5 transition-colors hover:bg-[#e07b2a]/5"
                            >
                              <Printer className="size-3" />
                              {labelUrl ? "Regerar etiqueta" : "Gerar etiqueta"}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Status selector */}
                      <div className="shrink-0 flex flex-col items-end gap-2">
                        <OrderStatusSelect
                          orderId={item.order.id}
                          currentStatus={item.order.status}
                          currentTrackingCode={trackingCode}
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

      {/* Etiqueta modal */}
      {activeModal && (
        <EtiquetaModal
          orderId={activeModal.order.id}
          orderCode={activeModal.order.id.slice(-8).toUpperCase()}
          existingLabelUrl={labelState[activeModal.order.id]?.labelUrl ?? activeModal.order.labelUrl}
          existingTrackingCode={labelState[activeModal.order.id]?.trackingCode ?? activeModal.order.trackingCode}
          defaultServiceId={activeModal.order.shippingServiceId}
          onClose={() => setEtiquetaOrderId(null)}
          onSuccess={(labelUrl, trackingCode) => handleEtiquetaSuccess(activeModal.order.id, labelUrl, trackingCode)}
        />
      )}
    </>
  );
}
