import { NextRequest, NextResponse } from "next/server";
import { getSaldoMelhorEnvio } from "@/lib/melhor-envio";
import { sendAdminMelhorEnvioSaldoBaixo } from "@/lib/email";

const THRESHOLD = 50; // R$50

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  return req.headers.get("x-cron-secret") === secret;
}

async function checkSaldo(): Promise<NextResponse> {
  const saldo = await getSaldoMelhorEnvio();
  if (saldo === null) {
    return NextResponse.json({ ok: true, skipped: true, reason: "Não foi possível obter o saldo" });
  }

  if (saldo < THRESHOLD) {
    await sendAdminMelhorEnvioSaldoBaixo({ saldo });
    return NextResponse.json({ ok: true, alerted: true, saldo });
  }

  return NextResponse.json({ ok: true, alerted: false, saldo });
}

// GET para permitir chamada simples via curl/crontab no VPS
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  return checkSaldo();
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  return checkSaldo();
}
