const BASE_URL = process.env.MELHOR_ENVIO_SANDBOX === "true"
  ? "https://sandbox.melhorenvio.com.br/api/v2"
  : "https://melhorenvio.com.br/api/v2";

const TOKEN = process.env.MELHOR_ENVIO_TOKEN ?? "";
const isMock = !TOKEN;

const ME_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
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
  files?: Record<string, { pdf?: string }>;
}

// URLs de PDF vêm pré-assinadas da AWS e expiram em ~30min — sempre buscar uma nova
// na hora do download em vez de reutilizar um link salvo.
export async function getLabelDownloadUrl(meOrderId: string): Promise<{ url: string; tracking: string | null } | null> {
  try {
    const res = await fetch(`${BASE_URL}/me/orders/${meOrderId}`, { headers: ME_HEADERS });
    if (!res.ok) return null;
    const order = await res.json() as MelhorEnvioOrder;
    const url = order.files?.["1"]?.pdf;
    if (!url) return null;
    return { url, tracking: order.tracking ?? null };
  } catch {
    return null;
  }
}

export function cepByState(uf: string): string {
  return STATE_CEPS[uf.toUpperCase()] ?? "01310100";
}

interface CepAddress {
  street: string;
  district: string;
  city: string;
  state: string;
}

// Resolve rua/bairro/cidade/UF a partir do CEP — o Melhor Envio exige endereço completo
// na origem, mas o perfil do artesão só guarda CEP (sem campo de rua/bairro).
async function resolveAddressFromCep(cep: string): Promise<CepAddress | null> {
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return null;
    return {
      street: data.logradouro ?? "",
      district: data.bairro ?? "",
      city: data.localidade ?? "",
      state: data.uf ?? "",
    };
  } catch {
    return null;
  }
}

// ─── Saldo da carteira ────────────────────────────────────────────────────────

export async function getSaldoMelhorEnvio(): Promise<number | null> {
  if (isMock) return null;
  try {
    const res = await fetch(`${BASE_URL}/me`, { headers: ME_HEADERS });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data?.accounts?.[0]?.balance ?? data?.wallet?.balance ?? data?.balance ?? null;
    if (raw === null) return null;
    const val = typeof raw === "number" ? raw : parseFloat(raw);
    return isNaN(val) ? null : val;
  } catch {
    return null;
  }
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
    number: string;
    postalCode: string;
  };
  to: {
    name: string;
    email: string;
    phone?: string;
    document: string;
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

  // Fail fast if wallet balance is zero or negative
  const saldo = await getSaldoMelhorEnvio();
  if (saldo !== null && saldo <= 0) {
    throw new Error(
      `Saldo insuficiente na carteira Melhor Envio (R$ ${saldo.toFixed(2)}). Recarregue em melhorenvio.com.br para continuar gerando etiquetas.`
    );
  }

  // Melhor Envio exige endereço completo na origem (rua/bairro/cidade/UF), mas o
  // perfil do artesão só guarda o CEP — resolve o resto via ViaCEP.
  const fromCep = params.from.postalCode.replace(/\D/g, "");
  const fromAddress = await resolveAddressFromCep(fromCep);
  if (!fromAddress) {
    throw new Error(
      `Não foi possível identificar o endereço de origem a partir do CEP ${params.from.postalCode}. Verifique o CEP cadastrado no perfil do artesão.`
    );
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
        address: fromAddress.street || "Endereço não informado",
        number: params.from.number,
        district: fromAddress.district || "Centro",
        city: fromAddress.city,
        state_abbr: fromAddress.state,
        postal_code: fromCep,
        country_id: "BR",
      },
      to: {
        name: params.to.name,
        email: params.to.email,
        phone: params.to.phone,
        document: params.to.document.replace(/\D/g, ""),
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
  if (!(cartRes.headers.get("content-type") ?? "").includes("application/json")) {
    throw new Error(
      `Melhor Envio cart retornou uma resposta inesperada (status ${cartRes.status}, não é JSON). Tente novamente ou verifique os dados do pedido.`
    );
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
    if (/saldo|insuficiente|balance|insufficient/i.test(err)) {
      throw new Error("Saldo insuficiente na carteira Melhor Envio. Recarregue em melhorenvio.com.br.");
    }
    throw new Error(`Melhor Envio checkout → ${checkoutRes.status}: ${err}`);
  }

  // 3. Generate label (async job on Melhor Envio's side)
  const generateRes = await fetch(`${BASE_URL}/me/shipment/generate`, {
    method: "POST",
    headers: ME_HEADERS,
    body: JSON.stringify({ orders: [meOrderId] }),
  });

  if (!generateRes.ok) {
    const err = await generateRes.text();
    throw new Error(`Melhor Envio generate → ${generateRes.status}: ${err}`);
  }

  // 4. "generate" is processed async on their side — poll order details until the
  // PDF is ready. The PDF URL (files["1"].pdf) is a presigned AWS link that expires
  // in ~30min; getLabelDownloadUrl() should be called again for later downloads
  // instead of reusing the one returned here.
  let labelResult: { url: string; tracking: string | null } | null = null;
  for (let attempt = 0; attempt < 3 && !labelResult; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 2000));
    labelResult = await getLabelDownloadUrl(meOrderId);
  }
  if (!labelResult) {
    throw new Error("Etiqueta gerada, mas o PDF ainda não está pronto. Tente baixar novamente em alguns instantes.");
  }

  return {
    melhorEnvioOrderId: meOrderId,
    labelUrl: labelResult.url,
    trackingCode: labelResult.tracking ?? cartItem.tracking ?? null,
  };
}
