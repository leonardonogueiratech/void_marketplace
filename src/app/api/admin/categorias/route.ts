import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  order: z.number().default(0),
});

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const categories = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true, artisanCategories: true } } },
  });

  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const slug = slugify(data.name);
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) return NextResponse.json({ error: "Já existe uma categoria com esse nome." }, { status: 400 });

    const category = await prisma.category.create({
      data: { name: data.name, slug, description: data.description, order: data.order, active: true },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    return NextResponse.json({ error: "Erro ao criar categoria." }, { status: 500 });
  }
}
