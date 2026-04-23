const ASAAS_BASE = process.env.ASAAS_SANDBOX === "true"
  ? "https://sandbox.asaas.com/api/v3"
  : "https://api.asaas.com/v3";

const API_KEY = process.env.ASAAS_API_KEY ?? "";
const isMock = !API_KEY;

function headers() {
  return {
    "Content-Type": "application/json",
    access_token: API_KEY,
  };
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${ASAAS_BASE}${path}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Asaas ${path} → ${res.status}: ${err}`);
  }
  return res.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${ASAAS_BASE}${path}`, { headers: headers() });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Asaas ${path} → ${res.status}: ${err}`);
  }
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type AsaasPaymentStatus =
  | "PENDING"
  | "RECEIVED"
  | "CONFIRMED"
  | "OVERDUE"
  | "REFUNDED"
  | "RECEIVED_IN_CASH"
  | "REFUND_REQUESTED"
  | "CHARGEBACK_REQUESTED"
  | "CHARGEBACK_DISPUTE"
  | "AWAITING_CHARGEBACK_REVERSAL"
  | "DUNNING_REQUESTED"
  | "DUNNING_RECEIVED"
  | "AWAITING_RISK_ANALYSIS";

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
}

export interface AsaasPayment {
  id: string;
  status: AsaasPaymentStatus;
  value: number;
  billingType: "PIX" | "BOLETO" | "CREDIT_CARD" | "UNDEFINED";
  invoiceUrl?: string;
  bankSlipUrl?: string;
  externalReference?: string;
}

export interface AsaasPixQrCode {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

// ─── Mock (development without credentials) ───────────────────────────────────

function mockCustomerId() {
  return `mock_cus_${Date.now()}`;
}

function mockPixPayment(orderId: string): AsaasPayment & { _pix?: AsaasPixQrCode } {
  return {
    id: `mock_pay_${Date.now()}`,
    status: "PENDING",
    value: 0,
    billingType: "PIX",
    externalReference: orderId,
    _pix: {
      encodedImage: "",
      payload:
        "00020126580014br.gov.bcb.pix0136mock-pix-key-artesao-marketplace5204000053039865802BR5925Feito de Gente Mock6009SAO PAULO62070503***6304MOCK",
      expirationDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    },
  };
}

function mockBoletoPayment(orderId: string): AsaasPayment {
  return {
    id: `mock_pay_${Date.now()}`,
    status: "PENDING",
    value: 0,
    billingType: "BOLETO",
    externalReference: orderId,
    bankSlipUrl: "https://sandbox.asaas.com/b/mock-boleto",
    invoiceUrl: "https://sandbox.asaas.com/i/mock-boleto",
  };
}

function mockCardPayment(orderId: string): AsaasPayment {
  return {
    id: `mock_pay_${Date.now()}`,
    status: "CONFIRMED",
    value: 0,
    billingType: "CREDIT_CARD",
    externalReference: orderId,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function findOrCreateCustomer(params: {
  name: string;
  email: string;
  cpfCnpj?: string;
}): Promise<string> {
  if (isMock) return mockCustomerId();

  const customer = await post<AsaasCustomer>("/customers", {
    name: params.name,
    email: params.email,
    cpfCnpj: params.cpfCnpj,
    notificationDisabled: true,
  });
  return customer.id;
}

export async function createPixPayment(params: {
  customerId: string;
  value: number;
  description: string;
  orderId: string;
  dueDate: string;
}): Promise<{ payment: AsaasPayment; pix: AsaasPixQrCode }> {
  if (isMock) {
    const payment = mockPixPayment(params.orderId);
    return { payment, pix: payment._pix! };
  }

  const payment = await post<AsaasPayment>("/payments", {
    customer: params.customerId,
    billingType: "PIX",
    value: params.value,
    dueDate: params.dueDate,
    description: params.description,
    externalReference: params.orderId,
  });

  const pix = await get<AsaasPixQrCode>(`/payments/${payment.id}/pixQrCode`);
  return { payment, pix };
}

export async function createBoletoPayment(params: {
  customerId: string;
  value: number;
  description: string;
  orderId: string;
  dueDate: string;
  name: string;
}): Promise<AsaasPayment> {
  if (isMock) return mockBoletoPayment(params.orderId);

  return post<AsaasPayment>("/payments", {
    customer: params.customerId,
    billingType: "BOLETO",
    value: params.value,
    dueDate: params.dueDate,
    description: params.description,
    externalReference: params.orderId,
  });
}

export async function createCreditCardPayment(params: {
  customerId: string;
  value: number;
  description: string;
  orderId: string;
  dueDate: string;
  installmentCount?: number;
  card: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  cardHolderInfo: {
    name: string;
    email: string;
    cpfCnpj?: string;
  };
}): Promise<AsaasPayment> {
  if (isMock) return mockCardPayment(params.orderId);

  return post<AsaasPayment>("/payments", {
    customer: params.customerId,
    billingType: "CREDIT_CARD",
    value: params.value,
    dueDate: params.dueDate,
    description: params.description,
    externalReference: params.orderId,
    installmentCount: params.installmentCount ?? 1,
    installmentValue: params.installmentCount ? params.value / params.installmentCount : undefined,
    creditCard: {
      holderName: params.card.holderName,
      number: params.card.number,
      expiryMonth: params.card.expiryMonth,
      expiryYear: params.card.expiryYear,
      ccv: params.card.ccv,
    },
    creditCardHolderInfo: {
      name: params.cardHolderInfo.name,
      email: params.cardHolderInfo.email,
      cpfCnpj: params.cardHolderInfo.cpfCnpj,
    },
  });
}

export async function getPayment(id: string): Promise<AsaasPayment> {
  if (isMock) {
    return { id, status: "CONFIRMED", value: 0, billingType: "PIX" };
  }
  return get<AsaasPayment>(`/payments/${id}`);
}

export function isApproved(status: AsaasPaymentStatus): boolean {
  return status === "RECEIVED" || status === "CONFIRMED" || status === "RECEIVED_IN_CASH";
}

export function isCancelled(status: AsaasPaymentStatus): boolean {
  return status === "REFUNDED" || status === "CHARGEBACK_REQUESTED";
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export interface AsaasSubscription {
  id: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  nextDueDate: string;
  cycle: string;
  value: number;
  description: string;
  externalReference?: string;
}

export async function createAsaasSubscription(params: {
  customerId: string;
  value: number;
  description: string;
  artisanId: string;
  nextDueDate: string;
}): Promise<AsaasSubscription> {
  if (isMock) {
    return {
      id: `mock_sub_${Date.now()}`,
      status: "ACTIVE",
      nextDueDate: params.nextDueDate,
      cycle: "MONTHLY",
      value: params.value,
      description: params.description,
      externalReference: `sub_${params.artisanId}`,
    };
  }

  return post<AsaasSubscription>("/subscriptions", {
    customer: params.customerId,
    billingType: "BOLETO",
    value: params.value,
    nextDueDate: params.nextDueDate,
    cycle: "MONTHLY",
    description: params.description,
    externalReference: `sub_${params.artisanId}`,
  });
}

export async function cancelAsaasSubscription(subscriptionId: string): Promise<void> {
  if (isMock) return;

  const res = await fetch(`${ASAAS_BASE}/subscriptions/${subscriptionId}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Asaas cancel subscription → ${res.status}: ${err}`);
  }
}
