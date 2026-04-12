import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

const isMock = !process.env.MERCADOPAGO_ACCESS_TOKEN;

// ─── Mock para desenvolvimento sem credenciais ────────────────────────────────

function createMockPayment() {
  return {
    async get({ id }: { id: string }) {
      return {
        id,
        status: "approved",
        external_reference: null as string | null,
      };
    },
    async create({ body }: { body: { payment_method_id?: string; [key: string]: unknown } }) {
      const id = `mock_${Date.now()}`;
      const method = body.payment_method_id ?? "";

      if (method === "pix") {
        return {
          id,
          status: "approved",
          point_of_interaction: {
            transaction_data: {
              qr_code: "00020126580014br.gov.bcb.pix0136mock-pix-key-artesao-marketplace5204000053039865802BR5925Artesao Marketplace Mock6009SAO PAULO62070503***6304MOCK",
              qr_code_base64: "",
            },
          },
        };
      }

      if (method === "bolbradesco") {
        return {
          id,
          status: "approved",
          transaction_details: {
            external_resource_url: "https://www.mercadopago.com.br/payments/mock/boleto",
          },
          barcode: {
            content: "23793.38128 60007.827136 95000.063305 1 10010000045000",
          },
        };
      }

      return { id, status: "approved" };
    },
  };
}

function createMockPreference() {
  return {
    async create({ body }: { body: unknown }) {
      return {
        id: `mock_pref_${Date.now()}`,
        init_point: "https://www.mercadopago.com.br/checkout/v1/redirect?mock=true",
      };
    },
  };
}

// ─── Exportações ──────────────────────────────────────────────────────────────

let mpPayment: ReturnType<typeof createMockPayment> | Payment;
let mpPreference: ReturnType<typeof createMockPreference> | Preference;

if (isMock) {
  mpPayment = createMockPayment();
  mpPreference = createMockPreference();
} else {
  const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    options: { timeout: 5000 },
  });
  mpPayment = new Payment(client);
  mpPreference = new Preference(client);
}

export { mpPayment, mpPreference };
