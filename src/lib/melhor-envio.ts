const BASE_URL = process.env.MELHOR_ENVIO_SANDBOX === "true"
  ? "https://sandbox.melhorenvio.com.br/api/v2"
  : "https://melhorenvio.com.br/api/v2";

const TOKEN = process.env.MELHOR_ENVIO_TOKEN ?? "";
const isMock = !TOKEN;

// CEP das capitais por estado — usado como origem quando artesão não tem CEP
const STATE_CEPS: Record<string, string> = {
  SP: "01310100", RJ: "20040020", MG: "30112020", ES: "29010300",
  PR: "80010010", SC: "88010001", RS: "90010280",
  DF: "70040020", GO: "74010010", MT: "78010300", MS: "79010050", TO: "77010020",
  BA: "40010000", SE: "49010480", PE: "50010030", AL: "57020480",
  PB: "58010160", RN: "59010005", CE: "60010050", PI: "64000260", MA: "65010000",
  PA: "66010000", AM: "69010000", AP: "68900073", RR: "69301030",
  AC: "69900160", RO: "76801068",
};

export interface ShippingOption {
  id: string;
  label: string;
  description: string;
  price: number;
  days: number;
  company: string;
}

interface MelhorEnvioService {
  id: number;
  name: string;
  price?: string | null;
  delivery_range?: { min: number; max: number };
  company?: { name: string };
  error?: string;
}

export function cepByState(uf: string): string {
  return STATE_CEPS[uf.toUpperCase()] ?? "01310100";
}

// Tabela estática — fallback quando sem token
import { calcShipping as calcStatic } from "./shipping";

export async function calcularFrete(params: {
  originUf: string;
  destinationCep: string;
  weight: number;
}): Promise<ShippingOption[]> {
  if (isMock) {
    return calcStatic(params.originUf, params.destinationCep).map((o) => ({
      id: o.id,
      label: o.label,
      description: o.description,
      price: o.price,
      days: o.days,
      company: "Correios",
    }));
  }

  const fromCep = cepByState(params.originUf).replace(/\D/g, "");
  const toCep = params.destinationCep.replace(/\D/g, "");
  const weight = Math.max(params.weight, 0.1);

  try {
    const res = await fetch(`${BASE_URL}/me/shipment/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
        "User-Agent": "FeitoDeGente/1.0 (contato@feitodegente.com.br)",
      },
      body: JSON.stringify({
        from: { postal_code: fromCep },
        to: { postal_code: toCep },
        package: { height: 10, width: 15, length: 20, weight },
        options: { receipt: false, own_hand: false },
      }),
    });

    if (!res.ok) throw new Error(`Melhor Envio ${res.status}`);

    const services: MelhorEnvioService[] = await res.json();

    return services
      .filter((s) => s.price && !s.error)
      .map((s) => {
        const maxDays = s.delivery_range?.max ?? 7;
        const minDays = s.delivery_range?.min ?? 1;
        const days = maxDays;
        return {
          id: String(s.id),
          label: `${s.name} — ${s.company?.name ?? ""}`.trim().replace(/ —$/, ""),
          description: minDays === maxDays
            ? `Entrega em ${days} dia${days !== 1 ? "s" : ""} útil`
            : `Entrega em ${minDays}–${maxDays} dias úteis`,
          price: parseFloat(s.price!),
          days,
          company: s.company?.name ?? "",
        };
      })
      .sort((a, b) => a.price - b.price);
  } catch {
    // fallback para tabela estática em caso de erro da API
    return calcStatic(params.originUf, params.destinationCep).map((o) => ({
      id: o.id,
      label: o.label,
      description: o.description,
      price: o.price,
      days: o.days,
      company: "Correios",
    }));
  }
}
