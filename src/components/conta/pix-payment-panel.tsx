"use client";

import Image from "next/image";
import { toast } from "sonner";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  pixQrCode: string;
  pixQrCodeBase64: string | null;
}

export function PixPaymentPanel({ pixQrCode, pixQrCodeBase64 }: Props) {
  return (
    <div className="bg-[#f2ede0] border border-[#071a33]/10 rounded-xl p-4 space-y-3">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-[#071a33]">
        <QrCode className="size-4" /> Pagar com PIX
      </p>
      {pixQrCodeBase64 && (
        <div className="flex justify-center">
          <Image
            src={`data:image/png;base64,${pixQrCodeBase64}`}
            alt="QR Code PIX"
            width={176}
            height={176}
            unoptimized
            className="size-44 rounded-lg bg-white p-2 border"
          />
        </div>
      )}
      <div>
        <p className="text-xs text-neutral-500 mb-1">Código copia e cola:</p>
        <div className="bg-white rounded p-2.5 text-xs font-mono break-all border">{pixQrCode}</div>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          onClick={() => {
            navigator.clipboard.writeText(pixQrCode);
            toast.success("Código copiado!");
          }}
        >
          Copiar código
        </Button>
      </div>
    </div>
  );
}
