const BASE_URL = process.env.MELHOR_ENVIO_SANDBOX === "true"
  ? "https://sandbox.melhorenvio.com.br/api/v2"
  : "https://melhorenvio.com.br/api/v2";

const TOKEN = process.env.MELHOR_ENVIO_TOKEN ?? "";
const isMock = !TOKEN;

const ME_HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${TOKEN}`,
  "User-Agent": "FeitoDeGente/1.0 (contato@feitodegente.com.br)",
};

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

export interface LabelResult {
  melhorEnvioOrderId: string;
  labelUrl: string;
  trackingCode: string | null;
}

interface MelhorEnvioService {
  id: number;
  name: string;
  price?: string | null;
  delivery_range?: { min: number; max: number };
  company?: { name: string };
  error?: string;
}

interface MelhorEnvioCartItem {
  id: string;
  protocol?: string;
  tracking?: string;
}

interface MelhorEnvioOrder {
  id: string;
  protocol?: string;
  tracking?: string;
  label?: { url?: string };
  status?: string;
}

export function cepByState(uf: string): string {
  return STATE_CEPS[uf.toUpperCase()] ?? "01310100";
}

// Tabela estática — fallback quando sem token
import { calcShipping as calcStatic } from "./shipping";

// ─── Cálculo de frete ─────────────────────────────────────────────────────────

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
      headers: ME_HEADERS,
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
        return {
          id: String(s.id),
          label: `${s.name} — ${s.company?.name ?? ""}`.trim().replace(/ —$/, ""),
          description: minDays === maxDays
            ? `Entrega em ${maxDays} dia${maxDays !== 1 ? "s" : ""} útil`
            : `Entrega em ${minDays}–${maxDays} dias úteis`,
          price: parseFloat(s.price!),
          days: maxDays,
          company: s.company?.name ?? "",
        };
      })
      .sort((a, b) => a.price - b.price);
  } catch {
    return calcStatic(params.originUf, params.destinationCep).map((o) => ({
      id: o.id, label: o.label, description: o.description,
      price: o.price, days: o.days, company: "Correios",
    }));
  }
}

// ─── Geração de etiqueta ──────────────────────────────────────────────────────

export async function gerarEtiqueta(params: {
  serviceId: number;
  from: {
    name: string;
    email: string;
    phone?: string;
    postalCode: string;
  };
  to: {
    name: string;
    email: string;
    phone?: string;
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    postalCode: string;
  };
  products: Array<{ name: string; quantity: number; unitaryValue: number }>;
  volume: { height: number; width: number; length: number; weight: number };
  insuranceValue: number;
}): Promise<LabelResult> {
  if (isMock) {
    return {
      melhorEnvioOrderId: `mock_me_${Date.now()}`,
      labelUrl: "https://sandbox.melhorenvio.com.br/etiqueta/mock.pdf",
      trackingCode: `BR${Date.now().toString().slice(-9)}BR`,
    };
  }

  // 1. Add to cart
  const cartRes = await fetch(`${BASE_URL}/me/cart`, {
    method: "POST",
    headers: ME_HEADERS,
    body: JSON.stringify({
      service: params.serviceId,
      from: {
        name: params.from.name,
        email: params.from.email,
        phone: params.from.phone,
        postal_code: params.from.postalCode.replace(/\D/g, ""),
      },
      to: {
        name: params.to.name,
        email: params.to.email,
        phone: params.to.phone,
        address: params.to.street,
        number: params.to.number,
        complement: params.to.complement,
        district: params.to.district,
        city: params.to.city,
        state_abbr: params.to.state,
        postal_code: params.to.postalCode.replace(/\D/g, ""),
        country_id: "BR",
      },
      products: params.products.map((p) => ({
        name: p.name,
        quantity: p.quantity,
        unitary_value: p.unitaryValue,
      })),
      volumes: [{
        height: params.volume.height,
        width: params.volume.width,
        length: params.volume.length,
        weight: params.volume.weight,
      }],
      options: {
        insurance_value: params.insuranceValue,
        receipt: false,
        own_hand: false,
        reverse: false,
        non_commercial: false,
      },
    }),
  });

  if (!cartRes.ok) {
    const err = await cartRes.text();
    throw new Error(`Melhor Envio cart → ${cartRes.status}: ${err}`);
  }

  const cartItem = await cartRes.json() as MelhorEnvioCartItem;
  const meOrderId = cartItem.id;

  // 2. Checkout (pay from wallet)
  const checkoutRes = await fetch(`${BASE_URL}/me/shipment/checkout`, {
    method: "POST",
    headers: ME_HEADERS,
    body: JSON.stringify({ orders: [meOrderId] }),
  });

  if (!checkoutRes.ok) {
    const err = await checkoutRes.text();
    throw new Error(`Melhor Envio checkout → ${checkoutRes.status}: ${err}`);
  }

  // 3. Generate label — returns redirect URL to PDF
  const generateUrl = `${BASE_URL}/me/shipment/generate?orders[]=${meOrderId}`;
  const generateRes = await fetch(generateUrl, {
    headers: ME_HEADERS,
    redirect: "manual",
  });

  // Melhor Envio returns 302 redirect to PDF URL
  const labelUrl = generateRes.headers.get("location")
    ?? `${BASE_URL}/me/shipment/generate?orders[]=${meOrderId}`;

  // 4. Get tracking code from order details
  let trackingCode: string | null = null;
  try {
    const orderRes = await fetch(`${BASE_URL}/me/orders/${meOrderId}`, { headers: ME_HEADERS });
    if (orderRes.ok) {
      const order = await orderRes.json() as MelhorEnvioOrder;
      trackingCode = order.tracking ?? cartItem.tracking ?? null;
    }
  } catch {
    // tracking will be null, updated via webhook later
  }

  return { melhorEnvioOrderId: meOrderId, labelUrl, trackingCode };
}
