import { prisma } from "@/lib/prisma";
import { calcShipping } from "@/lib/shipping";
import { NextResponse } from "next/server";

// GET /api/frete?cep=XXXXXXXX&artisanIds=id1,id2
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cep = searchParams.get("cep")?.replace(/\D/g, "") ?? "";
  const ids  = (searchParams.get("artisanIds") ?? "").split(",").filter(Boolean);

  if (cep.length !== 8) {
    return NextResponse.json({ error: "CEP inválido." }, { status: 400 });
  }

  // Pega o estado do primeiro artesão com estado cadastrado
  let originUf = "SP"; // fallback padrão
  if (ids.length > 0) {
    const artisan = await prisma.artisanProfile.findFirst({
      where: { id: { in: ids }, state: { not: null } },
      select: { state: true },
    });
    if (artisan?.state) originUf = artisan.state;
  }

  const options = calcShipping(originUf, cep);
  return NextResponse.json({ options, originUf });
}
