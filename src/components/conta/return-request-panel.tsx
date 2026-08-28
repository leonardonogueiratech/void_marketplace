"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, RotateCcw, Truck, Clock, CheckCircle2, XCircle, PackageCheck, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const REASON_OPTIONS = [
  { value: "NOT_LIKED", label: "Não gostei do produto" },
  { value: "DEFECTIVE", label: "Produto com defeito" },
  { value: "DAMAGED", label: "Chegou danificado" },
  { value: "WRONG_ITEM", label: "Produto errado" },
  { value: "OTHER", label: "Outro motivo" },
];

interface ReturnRequestData {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SHIPPED_BACK" | "RECEIVED" | "REFUNDED";
  artisanNote: string | null;
  returnTrackingCode: string | null;
  returnLabelUrl: string | null;
}

interface Props {
  orderItemId: string;
  eligible: boolean;
  returnRequest: ReturnRequestData | null;
}

export function ReturnRequestPanel({ orderItemId, eligible, returnRequest }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("NOT_LIKED");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [sendingTracking, setSendingTracking] = useState(false);
  const [generatingLabel, setGeneratingLabel] = useState(false);
  const [labelUrl, setLabelUrl] = useState(returnRequest?.returnLabelUrl ?? null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      let photos: string[] = [];
      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);
        formData.append("folder", "devolucoes");
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) photos = [uploadData.url];
      }

      const res = await fetch("/api/devolucoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderItemId, reason, description: description || undefined, photos }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao solicitar devolução."); return; }
      toast.success("Devolução solicitada! O artesão vai analisar.");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Erro ao solicitar devolução.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateLabel() {
    if (!returnRequest) return;
    setGeneratingLabel(true);
    try {
      const res = await fetch(`/api/devolucoes/${returnRequest.id}/etiqueta`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao gerar etiqueta."); return; }
      setLabelUrl(data.labelUrl);
      if (data.trackingCode) setTrackingCode(data.trackingCode);
      toast.success("Etiqueta de devolução gerada!");
      router.refresh();
    } catch {
      toast.error("Erro ao gerar etiqueta de devolução.");
    } finally {
      setGeneratingLabel(false);
    }
  }

  async function handleSendTracking() {
    if (!trackingCode.trim() || !returnRequest) return;
    setSendingTracking(true);
    try {
      const res = await fetch(`/api/devolucoes/${returnRequest.id}/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingCode: trackingCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao informar envio."); return; }
      toast.success("Envio informado ao artesão.");
      router.refresh();
    } catch {
      toast.error("Erro ao informar envio.");
    } finally {
      setSendingTracking(false);
    }
  }

  if (returnRequest) {
    if (returnRequest.status === "PENDING") {
      return (
        <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
          <Clock className="size-3.5" /> Devolução em análise pelo artesão
        </div>
      );
    }
    if (returnRequest.status === "REJECTED") {
      return (
        <div className="flex flex-col gap-1 text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          <span className="flex items-center gap-1.5 font-medium"><XCircle className="size-3.5" /> Devolução recusada</span>
          {returnRequest.artisanNote && <p className="text-red-400">{returnRequest.artisanNote}</p>}
        </div>
      );
    }
    if (returnRequest.status === "APPROVED") {
      return (
        <div className="flex flex-col gap-2 bg-[#7c9f61]/8 border border-[#7c9f61]/20 rounded-xl px-3 py-2.5 max-w-xs">
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#7c9f61]">
            <CheckCircle2 className="size-3.5" /> Devolução aprovada — envie o produto
          </span>

          {labelUrl ? (
            <a
              href={labelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-[#071a33] bg-white border border-[#7c9f61]/30 rounded-lg px-2.5 py-1.5 hover:bg-[#7c9f61]/5"
            >
              <Tag className="size-3.5" /> Baixar etiqueta de devolução (PDF)
            </a>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateLabel}
              disabled={generatingLabel}
              className="h-7 text-xs w-fit border-[#7c9f61]/40 text-[#7c9f61] hover:bg-[#7c9f61]/10"
            >
              {generatingLabel ? <Loader2 className="mr-1.5 size-3 animate-spin" /> : <Tag className="mr-1.5 size-3" />}
              Gerar etiqueta de devolução grátis
            </Button>
          )}

          <div className="flex gap-1.5">
            <Input
              placeholder="Código de rastreio"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              className="h-7 text-xs"
            />
            <Button
              size="sm"
              onClick={handleSendTracking}
              disabled={sendingTracking || !trackingCode.trim()}
              className="h-7 text-xs bg-[#7c9f61] hover:bg-[#63804e] text-white shrink-0"
            >
              {sendingTracking ? <Loader2 className="size-3 animate-spin" /> : "Enviei"}
            </Button>
          </div>
          <span className="text-[10px] text-neutral-400">
            Já tem sua própria etiqueta? Só informe o código de rastreio acima.
          </span>
        </div>
      );
    }
    if (returnRequest.status === "SHIPPED_BACK") {
      return (
        <div className="flex items-center gap-1.5 text-xs text-purple-600 bg-purple-50 border border-purple-200 rounded-full px-3 py-1.5">
          <Truck className="size-3.5" /> Aguardando o artesão confirmar recebimento
        </div>
      );
    }
    if (returnRequest.status === "RECEIVED") {
      return (
        <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5">
          <PackageCheck className="size-3.5" /> Recebido — reembolso em processamento
        </div>
      );
    }
    if (returnRequest.status === "REFUNDED") {
      return (
        <div className="flex items-center gap-1.5 text-xs text-[#7c9f61] bg-[#7c9f61]/8 border border-[#7c9f61]/20 rounded-full px-3 py-1.5">
          <CheckCircle2 className="size-3.5" /> Reembolso concluído
        </div>
      );
    }
  }

  if (!eligible) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-[#071a33] bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg px-3 py-1.5 transition-colors"
      >
        <RotateCcw className="size-3.5" />
        Solicitar devolução
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#071a33]">Solicitar devolução</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Motivo</Label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {REASON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>
                Detalhes <span className="text-neutral-400 font-normal">(opcional)</span>
              </Label>
              <Textarea
                rows={3}
                maxLength={1000}
                placeholder="Descreva o problema..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Foto <span className="text-neutral-400 font-normal">(recomendado em caso de defeito/dano)</span>
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-[#071a33] hover:bg-[#051224] text-white">
                {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RotateCcw className="mr-2 size-4" />}
                Enviar solicitação
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
