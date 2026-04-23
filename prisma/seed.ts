import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed...");

  // ─── Categorias ────────────────────────────────────────────────────────────

  const categories = [
    { name: "Cerâmica e Barro", slug: "ceramica-barro", description: "Peças em argila, barro e cerâmica artesanal", order: 1 },
    { name: "Bordado e Tecido", slug: "bordado-tecido", description: "Bordados, rendas, tapeçarias e peças têxteis", order: 2 },
    { name: "Madeira e Marcenaria", slug: "madeira-marcenaria", description: "Esculturas, móveis e objetos em madeira", order: 3 },
    { name: "Joias e Bijuterias", slug: "joias-bijuterias", description: "Anéis, colares, brincos e pulseiras artesanais", order: 4 },
    { name: "Couro e Couroaria", slug: "couro-couroaria", description: "Bolsas, carteiras, cintos e acessórios em couro", order: 5 },
    { name: "Pintura e Arte", slug: "pintura-arte", description: "Quadros, telas, aquarelas e arte visual", order: 6 },
    { name: "Cestaria e Palha", slug: "cestaria-palha", description: "Cestos, chapéus e objetos trançados", order: 7 },
    { name: "Pedra e Cristal", slug: "pedra-cristal", description: "Esculturas e objetos em pedra sabão, quartzo e gemas", order: 8 },
    { name: "Papel e Origami", slug: "papel-origami", description: "Arte em papel, origami, quilling e cartonagem", order: 9 },
    { name: "Velas e Aromaterapia", slug: "velas-aromaterapia", description: "Velas artesanais, sabonetes e produtos de bem-estar", order: 10 },
    { name: "Decoração", slug: "decoracao", description: "Objetos decorativos para casa e ambientes", order: 11 },
    { name: "Moda e Vestuário", slug: "moda-vestuario", description: "Roupas, acessórios e moda artesanal", order: 12 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, active: true },
    });
  }
  console.log(`✅ ${categories.length} categorias criadas`);

  // ─── Usuário Admin ─────────────────────────────────────────────────────────

  const adminPassword = await bcrypt.hash("Admin@2024!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@feitodegente.com.br" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@feitodegente.com.br",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin criado: ${admin.email}`);

  // ─── Artesão Demo 1 (Cerâmica) ─────────────────────────────────────────────

  const artisanPassword = await bcrypt.hash("Artesao@2024!", 10);
  const artisanUser = await prisma.user.upsert({
    where: { email: "maria.ceramica@feitodegente.com.br" },
    update: {},
    create: {
      name: "Maria das Graças",
      email: "maria.ceramica@feitodegente.com.br",
      password: artisanPassword,
      role: "ARTISAN",
    },
  });

  const ceramicaCat = await prisma.category.findUnique({ where: { slug: "ceramica-barro" } });
  const decorCat = await prisma.category.findUnique({ where: { slug: "decoracao" } });

  const artisan = await prisma.artisanProfile.upsert({
    where: { userId: artisanUser.id },
    update: {},
    create: {
      userId: artisanUser.id,
      storeName: "Ateliê Maria Barro",
      slug: "atelie-maria-barro",
      bio: "Ceramista mineira com 20 anos de experiência. Cada peça é moldada à mão com argila da região, trazendo a cultura do Vale do Jequitinhonha para sua casa.",
      story: "Aprendi a trabalhar com barro aos 8 anos, na oficina do meu avô. Desde então, mantenho viva a tradição da cerâmica popular brasileira.",
      location: "Diamantina, MG",
      city: "Diamantina",
      state: "MG",
      whatsapp: "31999990000",
      instagram: "@maria.barro",
      status: "APPROVED",
      featured: true,
      rating: 4.8,
    },
  });

  if (ceramicaCat) {
    await prisma.artisanCategory.upsert({
      where: { artisanId_categoryId: { artisanId: artisan.id, categoryId: ceramicaCat.id } },
      update: {},
      create: { artisanId: artisan.id, categoryId: ceramicaCat.id },
    });
  }
  if (decorCat) {
    await prisma.artisanCategory.upsert({
      where: { artisanId_categoryId: { artisanId: artisan.id, categoryId: decorCat.id } },
      update: {},
      create: { artisanId: artisan.id, categoryId: decorCat.id },
    });
  }

  await prisma.subscription.upsert({
    where: { artisanId: artisan.id },
    update: {},
    create: { artisanId: artisan.id, plan: "FREE", status: "ACTIVE" },
  });

  const products1 = [
    {
      name: "Vaso de Cerâmica Rústico",
      slug: "vaso-ceramica-rustico",
      description: "Vaso artesanal em cerâmica de alta temperatura, com acabamento rústico e esmaltado à mão. Perfeito para flores secas ou como objeto decorativo.",
      story: "Modelado em torno manual usando argila extraída do Rio Jequitinhonha. O esmalte azul-cinza imita o céu do sertão mineiro ao amanhecer.",
      price: 89.90,
      comparePrice: 120.00,
      stock: 8,
      tags: ["vaso", "cerâmica", "decoração", "rústico"],
      materials: ["Argila", "Esmalte cerâmico"],
      categoryId: ceramicaCat?.id ?? null,
      status: "ACTIVE" as const,
      featured: true,
      image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80",
    },
    {
      name: "Tigela de Barro para Servir",
      slug: "tigela-barro-servir",
      description: "Tigela utilitária em barro cozido, ideal para servir caldos, sopas e petiscos. Vai ao forno e micro-ondas.",
      story: "Feita com a mesma técnica dos utensílios domésticos tradicionais do Vale do Jequitinhonha, usados há gerações.",
      price: 45.00,
      comparePrice: null,
      stock: 15,
      tags: ["tigela", "barro", "cozinha"],
      materials: ["Barro", "Verniz natural"],
      categoryId: ceramicaCat?.id ?? null,
      status: "ACTIVE" as const,
      featured: false,
      image: "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&q=80",
    },
    {
      name: "Conjunto Porta-Temperos (4 peças)",
      slug: "conjunto-porta-temperos-ceramica",
      description: "Kit com 4 porta-temperos em cerâmica artesanal com tampas de madeira. Capacidade de 150ml cada.",
      story: "A inspiração veio da cozinha da minha avó, onde cada pote tinha um tempero diferente do quintal.",
      price: 135.00,
      comparePrice: 160.00,
      stock: 5,
      tags: ["cozinha", "temperos", "conjunto", "cerâmica"],
      materials: ["Cerâmica", "Madeira de reflorestamento"],
      categoryId: ceramicaCat?.id ?? null,
      status: "ACTIVE" as const,
      featured: true,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    },
    {
      name: "Boneca do Jequitinhonha",
      slug: "escultura-boneca-jequitinhonha",
      description: "Boneca de barro pintada à mão, representando a figura feminina do povo do Vale do Jequitinhonha. Peça única.",
      story: "As bonecas do Vale são um patrimônio cultural imaterial. Cada feição, roupa e cor tem um significado na história desta região.",
      price: 220.00,
      comparePrice: null,
      stock: 3,
      tags: ["escultura", "boneca", "jequitinhonha", "arte"],
      materials: ["Barro", "Tinta atóxica"],
      categoryId: decorCat?.id ?? null,
      status: "ACTIVE" as const,
      featured: false,
      image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&q=80",
    },
  ];

  for (const p of products1) {
    const { image, ...data } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        artisanId: artisan.id,
        ...data,
        images: { create: [{ url: image, alt: p.name, order: 0 }] },
      },
    });
  }

  console.log(`✅ Artesão 1 criado: ${artisan.storeName} (${products1.length} produtos)`);

  // ─── Artesão Demo 2 (Bordado) ──────────────────────────────────────────────

  const bordadoCat = await prisma.category.findUnique({ where: { slug: "bordado-tecido" } });

  const artisanUser2 = await prisma.user.upsert({
    where: { email: "ana.bordados@feitodegente.com.br" },
    update: {},
    create: {
      name: "Ana Souza",
      email: "ana.bordados@feitodegente.com.br",
      password: await bcrypt.hash("Artesao@2024!", 10),
      role: "ARTISAN",
    },
  });

  const artisan2 = await prisma.artisanProfile.upsert({
    where: { userId: artisanUser2.id },
    update: {},
    create: {
      userId: artisanUser2.id,
      storeName: "Bordados da Ana",
      slug: "bordados-da-ana",
      bio: "Bordadeira nordestina com 15 anos de experiência. Especializada em bordado livre, ponto cruz e renda de bilro.",
      location: "Caruaru, PE",
      city: "Caruaru",
      state: "PE",
      whatsapp: "81999880000",
      instagram: "@bordados.ana",
      status: "APPROVED",
      featured: false,
      rating: 4.6,
    },
  });

  if (bordadoCat) {
    await prisma.artisanCategory.upsert({
      where: { artisanId_categoryId: { artisanId: artisan2.id, categoryId: bordadoCat.id } },
      update: {},
      create: { artisanId: artisan2.id, categoryId: bordadoCat.id },
    });
  }

  await prisma.subscription.upsert({
    where: { artisanId: artisan2.id },
    update: {},
    create: { artisanId: artisan2.id, plan: "BASIC", status: "ACTIVE" },
  });

  const products2 = [
    {
      name: "Caminho de Mesa Bordado Floral",
      slug: "caminho-mesa-bordado-floral",
      description: "Caminho de mesa em linho natural com bordado floral feito à mão. 40x180cm.",
      price: 185.00,
      comparePrice: null,
      stock: 4,
      tags: ["bordado", "mesa", "decoração", "floral"],
      materials: ["Linho natural", "Linha de algodão"],
      status: "ACTIVE" as const,
      featured: true,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
    },
    {
      name: "Guardanapo Bordado Ponto Cruz (kit 6)",
      slug: "guardanapo-bordado-ponto-cruz",
      description: "Kit com 6 guardanapos de algodão com bordado em ponto cruz. Lavável e durável.",
      price: 98.00,
      comparePrice: null,
      stock: 10,
      tags: ["guardanapo", "ponto cruz", "cozinha", "kit"],
      materials: ["Algodão", "Linha de bordado"],
      status: "ACTIVE" as const,
      featured: false,
      image: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=800&q=80",
    },
  ];

  for (const p of products2) {
    const { image, ...data } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        artisanId: artisan2.id,
        categoryId: bordadoCat?.id ?? null,
        ...data,
        images: { create: [{ url: image, alt: p.name, order: 0 }] },
      },
    });
  }

  console.log(`✅ Artesão 2 criado: ${artisan2.storeName} (${products2.length} produtos)`);

  console.log("\n🎉 Seed concluído!");
  console.log("\n📋 Credenciais:");
  console.log("   Admin:     admin@feitodegente.com.br  /  Admin@2024!");
  console.log("   Artesão 1: maria.ceramica@feitodegente.com.br  /  Artesao@2024!");
  console.log("   Artesão 2: ana.bordados@feitodegente.com.br  /  Artesao@2024!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
