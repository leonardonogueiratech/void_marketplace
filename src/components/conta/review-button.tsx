"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  orderId: string;
  storeName: string;
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`size-8 transition-colors ${
              n <= (hover || value)
                ? "fill-amber-400 text-amber-400"
                : "text-neutral-200 fill-neutral-100"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

const ratingLabels: Record<number, string> = {
  1: "Muito ruim",
  2: "Ruim",
  3: "Regular",
  4: "Bom",
  5: "Excelente!",
};

export function ReviewButton({ orderId, storeName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { toast.error("Selecione uma nota de 1 a 5."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao enviar avaliação."); return; }
      toast.success("Avaliação enviada! Obrigado.");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Erro ao enviar avaliação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg px-3 py-1.5 transition-colors"
      >
        <Star className="size-3.5 fill-amber-400 text-amber-400" />
        Avaliar compra
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5f]">Avaliar compra</DialogTitle>
          </DialogHeader>

          <div className="text-sm text-neutral-500 -mt-1 mb-2">
            Sua opinião sobre <span className="font-semibold text-[#1e3a5f]">{storeName}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-700">Nota</p>
              <StarRating value={rating} onChange={setRating} />
              {rating > 0 && (
                <p className="text-xs font-medium text-amber-600">{ratingLabels[rating]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">
                Comentário <span className="text-neutral-400 font-normal">(opcional)</span>
              </label>
              <Textarea
                rows={4}
                maxLength={1000}
                placeholder="Conte como foi sua experiência com o produto e o artesão..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <p className="text-xs text-neutral-400 text-right">{comment.length}/1000</p>
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || rating === 0}
                className="flex-1 bg-[#1e3a5f] hover:bg-[#162d4a] text-white"
              >
                {loading
                  ? <><Loader2 className="mr-2 size-4 animate-spin" /> Enviando...</>
                  : <><MessageSquare className="mr-2 size-4" /> Enviar avaliação</>
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
