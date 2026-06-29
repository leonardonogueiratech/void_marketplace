import { NextRequest, NextResponse } from "next/server";
import { getSaldoMelhorEnvio } from "@/lib/melhor-envio";
import { sendAdminMelhorEnvioSaldoBaixo } from "@/lib/email";

const THRESHOLD = 50; // R$50

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("x-cron-secret") !== secret) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

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
