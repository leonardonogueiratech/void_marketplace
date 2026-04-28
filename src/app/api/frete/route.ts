import { prisma } from "@/lib/prisma";
import { calcularFrete } from "@/lib/melhor-envio";
import type { ShippingOption } from "@/lib/melhor-envio";
import { NextResponse } from "next/server";

export interface ShippingBreakdown {
  artisanId: string;
  storeName: string;
  originUf: string;
  options: ShippingOption[];
}

export interface FreteResponse {
  options: ShippingOption[];
  breakdown: ShippingBreakdown[];
}

// GET /api/frete?cep=XXXXXXXX&productIds=id1,id2
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cep        = searchParams.get("cep")?.replace(/\D/g, "") ?? "";
  const productIds = (searchParams.get("productIds") ?? "").split(",").filter(Boolean);

  if (cep.length !== 8) {
    return NextResponse.json({ error: "CEP inválido." }, { status: 400 });
  }
  if (productIds.length === 0) {
    return NextResponse.json({ error: "Nenhum produto informado." }, { status: 400 });
  }

  // Busca produtos com artisanId e peso
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, weight: true, artisanId: true },
  });

  // Agrupa por artesão somando pesos
  const grouped = new Map<string, number>();
  for (const p of products) {
    const prev = grouped.get(p.artisanId) ?? 0;
    grouped.set(p.artisanId, prev + (p.weight ?? 0.3));
  }

  // Busca dados dos artesãos
  const artisans = await prisma.artisanProfile.findMany({
    where: { id: { in: [...grouped.keys()] } },
    select: { id: true, state: true, storeName: true },
  });
  const artisanMap = new Map(artisans.map((a) => [a.id, a]));

  // Calcula frete por artesão
  const breakdown: ShippingBreakdown[] = [];
  for (const [artisanId, weight] of grouped.entries()) {
    const artisan  = artisanMap.get(artisanId);
    const originUf = artisan?.state ?? "SP";
    const options  = await calcularFrete({ originUf, destinationCep: cep, weight });
    breakdown.push({
      artisanId,
      storeName: artisan?.storeName ?? "Artesão",
      originUf,
      options,
    });
  }

  if (breakdown.length === 0) {
    return NextResponse.json({ options: [], breakdown: [] });
  }

  // Combina opções: soma preços por modalidade (PAC, SEDEX, etc.)
  // Só inclui modalidades disponíveis em todos os artesãos
  const methodIds = [...new Set(breakdown.flatMap((b) => b.options.map((o) => o.id)))];

  const combined: ShippingOption[] = methodIds
    .map((id) => {
      let totalPrice = 0;
      let maxDays    = 0;
      let base: ShippingOption | undefined;

      for (const b of breakdown) {
        const opt = b.options.find((o) => o.id === id);
        if (!opt) return null; // modalidade indisponível nesse artesão
        totalPrice += opt.price;
        maxDays     = Math.max(maxDays, opt.days);
        base        = opt;
      }

      if (!base) return null;

      const daysLabel = maxDays <= 1
        ? "Entrega em 1 dia útil"
        : `Entrega em até ${maxDays} dias úteis`;

      return { ...base, price: totalPrice, days: maxDays, description: daysLabel };
    })
    .filter((o): o is ShippingOption => o !== null)
    .sort((a, b) => a.price - b.price);

  return NextResponse.json({ options: combined, breakdown } satisfies FreteResponse);
}
