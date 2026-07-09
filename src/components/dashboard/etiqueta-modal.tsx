"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Package, Download, ExternalLink, X, Printer, MapPin } from "lucide-react";

const SERVICES = [
  { id: 1,  label: "PAC — Correios",       days: "8–15 dias úteis", agencyUrl: "https://localiza.correios.com.br/",              agencyLabel: "Agências dos Correios" },
  { id: 2,  label: "Sedex — Correios",      days: "1–5 dias úteis",  agencyUrl: "https://localiza.correios.com.br/",              agencyLabel: "Agências dos Correios" },
  { id: 3,  label: "Sedex 10 — Correios",   days: "1 dia útil",      agencyUrl: "https://localiza.correios.com.br/",              agencyLabel: "Agências dos Correios" },
  { id: 4,  label: "Sedex Hoje — Correios", days: "Mesmo dia",       agencyUrl: "https://localiza.correios.com.br/",              agencyLabel: "Agências dos Correios" },
  { id: 7,  label: ".Package — Jadlog",     days: "3–10 dias úteis", agencyUrl: "https://www.jadlog.com.br/jadlog/findUnit.jad",   agencyLabel: "Pontos Jadlog" },
  { id: 8,  label: ".Com — Jadlog",         days: "2–8 dias úteis",  agencyUrl: "https://www.jadlog.com.br/jadlog/findUnit.jad",   agencyLabel: "Pontos Jadlog" },
];

interface Props {
  orderId: string;
  orderCode: string;
  existingLabelUrl?: string | null;
  existingTrackingCode?: string | null;
  defaultServiceId?: number | null;
  onClose: () => void;
  onSuccess: (labelUrl: string, trackingCode: string | null) => void;
}

export function EtiquetaModal({
  orderId,
  orderCode,
  existingLabelUrl,
  existingTrackingCode,
  defaultServiceId,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [serviceId, setServiceId] = useState<number>(defaultServiceId ?? 1);
  const activeService = SERVICES.find((s) => s.id === serviceId) ?? SERVICES[0]!;
  const [weight, setWeight] = useState("0.5");
  const [height, setHeight] = useState("10");
  const [width, setWidth] = useState("15");
  const [length, setLength] = useState("20");
  const [labelUrl, setLabelUrl] = useState<string | null>(existingLabelUrl ?? null);
  const [trackingCode, setTrackingCode] = useState<string | null>(existingTrackingCode ?? null);
  const [downloading, setDownloading] = useState(false);

  // O link do PDF expira em ~30min — sempre busca um novo antes de abrir.
  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/pedidos/${orderId}/etiqueta`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erro ao obter link da etiqueta.");
        return;
      }
      window.open(data.labelUrl, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Erro ao obter link da etiqueta.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/pedidos/${orderId}/etiqueta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          weight: parseFloat(weight),
          height: parseFloat(height),
          width: parseFloat(width),
          length: parseFloat(length),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erro ao gerar etiqueta.");
        return;
      }
      setLabelUrl(data.labelUrl);
      setTrackingCode(data.trackingCode ?? null);
      onSuccess(data.labelUrl, data.trackingCode ?? null);
      toast.success("Etiqueta gerada com sucesso!");
    } catch {
      toast.error("Erro ao gerar etiqueta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e3a5f]/10">
          <div className="flex items-center gap-2">
            <Printer className="size-5 text-[#1e3a5f]" />
            <div>
              <h2 className="text-base font-bold text-[#1e3a5f]">Gerar Etiqueta de Envio</h2>
              <p className="text-xs text-neutral-400">Pedido #{orderCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {labelUrl ? (
            /* Label already generated */
            <div className="space-y-4">
              <div className="bg-[#27ae60]/8 border border-[#27ae60]/20 rounded-xl p-4 text-center space-y-2">
                <Package className="size-8 text-[#27ae60] mx-auto" />
                <p className="text-sm font-semibold text-[#27ae60]">Etiqueta gerada!</p>
                {trackingCode && (
                  <div className="bg-white rounded-lg px-3 py-2 border border-[#27ae60]/20">
                    <p className="text-xs text-neutral-400 mb-0.5">Código de rastreio</p>
                    <p className="font-mono font-bold text-[#1e3a5f] text-sm">{trackingCode}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex-1 bg-[#1e3a5f] hover:bg-[#162d4a] text-white"
                >
                  {downloading
                    ? <Loader2 className="mr-2 size-4 animate-spin" />
                    : <Download className="mr-2 size-4" />}
                  Baixar PDF
                </Button>
                <Button
                  variant="outline"
                  className="border-[#1e3a5f]/20 text-[#1e3a5f]"
                  onClick={() => { setLabelUrl(null); setTrackingCode(null); }}
                >
                  <ExternalLink className="size-4" />
                </Button>
              </div>

              <a
                href={activeService.agencyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full text-xs font-medium text-[#e07b2a] border border-[#e07b2a]/30 rounded-xl py-2.5 hover:bg-[#e07b2a]/5 transition-colors"
              >
                <MapPin className="size-3.5" />
                Encontrar {activeService.agencyLabel} →
              </a>

              <p className="text-xs text-neutral-400 text-center">
                Imprima a etiqueta, embale o produto e leve ao ponto de postagem.
              </p>
            </div>
          ) : (
            /* Form */
            <div className="space-y-4">
              {/* Shipping service */}
              <div className="space-y-1.5">
                <Label className="text-[#1e3a5f] font-medium">Serviço de envio</Label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(Number(e.target.value))}
                  className="w-full text-sm border border-[#1e3a5f]/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 bg-white text-[#1e3a5f]"
                >
                  {SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} · {s.days}
                    </option>
                  ))}
                </select>
              </div>

              {/* Weight */}
              <div className="space-y-1.5">
                <Label className="text-[#1e3a5f] font-medium">Peso total (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="border-[#1e3a5f]/20 focus-visible:ring-[#1e3a5f]/20"
                />
              </div>

              {/* Dimensions */}
              <div className="space-y-1.5">
                <Label className="text-[#1e3a5f] font-medium">Dimensões do pacote (cm)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">Altura</p>
                    <Input
                      type="number"
                      step="1"
                      min="1"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="border-[#1e3a5f]/20 focus-visible:ring-[#1e3a5f]/20"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">Largura</p>
                    <Input
                      type="number"
                      step="1"
                      min="1"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="border-[#1e3a5f]/20 focus-visible:ring-[#1e3a5f]/20"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">Comprimento</p>
                    <Input
                      type="number"
                      step="1"
                      min="1"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="border-[#1e3a5f]/20 focus-visible:ring-[#1e3a5f]/20"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#f7f3ed] rounded-xl p-3 text-xs text-neutral-500 space-y-1.5">
                <p>• O custo da etiqueta é descontado do saldo no Melhor Envio.</p>
                <p>• O código de rastreio é gerado automaticamente e enviado ao comprador.</p>
                <a
                  href={activeService.agencyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#e07b2a] font-medium hover:underline pt-0.5"
                >
                  <MapPin className="size-3" /> Encontrar {activeService.agencyLabel} →
                </a>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-[#e07b2a] hover:bg-[#c96a1e] text-white font-semibold"
              >
                {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {loading ? "Gerando etiqueta..." : "Gerar etiqueta"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
