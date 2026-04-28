import { prisma } from "@/lib/prisma";
import { calcularFrete } from "@/lib/melhor-envio";
import { NextResponse } from "next/server";

// GET /api/frete?cep=XXXXXXXX&artisanIds=id1,id2&productIds=id1,id2
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cep        = searchParams.get("cep")?.replace(/\D/g, "") ?? "";
  const artisanIds = (searchParams.get("artisanIds") ?? "").split(",").filter(Boolean);
  const productIds = (searchParams.get("productIds") ?? "").split(",").filter(Boolean);

  if (cep.length !== 8) {
    return NextResponse.json({ error: "CEP inválido." }, { status: 400 });
  }

  // UF do primeiro artesão com estado cadastrado
  let originUf = "SP";
  if (artisanIds.length > 0) {
    const artisan = await prisma.artisanProfile.findFirst({
      where: { id: { in: artisanIds }, state: { not: null } },
      select: { state: true },
    });
    if (artisan?.state) originUf = artisan.state;
  }

  // Peso total dos produtos no carrinho
  let weight = 0.3; // fallback 300g
  if (productIds.length > 0) {
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { weight: true },
    });
    const total = products.reduce((sum, p) => sum + (p.weight ?? 0.3), 0);
    if (total > 0) weight = total;
  }

  const options = await calcularFrete({ originUf, destinationCep: cep, weight });
  return NextResponse.json({ options, originUf });
}
