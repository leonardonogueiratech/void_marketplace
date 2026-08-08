import { Truck, Check } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface TrackingEventLike {
  id: string;
  status: string;
  description: string;
  occurredAt: Date | string;
}

interface TrackingTimelineProps {
  trackingCode: string;
  events: TrackingEventLike[];
}

// Eventos vêm do webhook do Melhor Envio (ordenados asc); mostramos o mais recente
// primeiro. Sem eventos ainda, exibe só o código com o link externo dos Correios.
export function TrackingTimeline({ trackingCode, events }: TrackingTimelineProps) {
  const reversed = [...events].reverse();

  return (
    <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 space-y-3">
      <div className="flex items-center gap-2.5">
        <Truck className="size-4 text-purple-500 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-purple-700">Código de rastreio</p>
          <p className="font-mono text-sm font-bold text-purple-800 mt-0.5">{trackingCode}</p>
        </div>
        <a
          href="https://rastreamento.correios.com.br/app/index.php"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-xs text-purple-600 hover:text-purple-800 underline underline-offset-2 shrink-0"
        >
          Rastrear nos Correios →
        </a>
      </div>

      {reversed.length > 0 && (
        <ol className="space-y-2 border-t border-purple-100 pt-3">
          {reversed.map((event, i) => (
            <li key={event.id} className="flex items-start gap-2.5">
              <span
                className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full ${
                  i === 0 ? "bg-purple-600 text-white" : "bg-purple-200 text-purple-600"
                }`}
              >
                {i === 0 && <Check className="size-2.5" />}
              </span>
              <div className="min-w-0">
                <p className={`text-xs ${i === 0 ? "font-semibold text-purple-800" : "text-purple-600"}`}>
                  {event.description}
                </p>
                <p className="text-[11px] text-purple-400">{formatDateTime(event.occurredAt)}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
