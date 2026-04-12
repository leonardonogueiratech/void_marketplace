import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeartHandshake, Leaf, Store, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre",
};

const pillars = [
  {
    title: "Feito à mão com identidade",
    description: "Cada peça nasce de um processo autoral, com tempo, técnica e história.",
    icon: HeartHandshake,
  },
  {
    title: "Artesãos no centro",
    description: "A plataforma existe para ampliar visibilidade, vendas e autonomia de quem produz.",
    icon: Users,
  },
  {
    title: "Consumo mais consciente",
    description: "Queremos aproximar pessoas de produtos com origem clara e produção em escala humana.",
    icon: Leaf,
  },
  {
    title: "Um marketplace com curadoria",
    description: "Organizamos descoberta, vitrine e confiança para a compra acontecer com mais facilidade.",
    icon: Store,
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <section className="rounded-[2rem] bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 px-6 py-12 sm:px-10">
        <Badge variant="secondary" className="mb-4">
          Sobre o Feito de Gente
        </Badge>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-neutral-900">
          Um marketplace pensado para valorizar o artesanato brasileiro.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-neutral-600">
          Estamos construindo uma vitrine digital inspirada em modelos como a Elo7,
          mas com foco em descoberta, identidade de marca e relacionamento mais próximo
          entre artesãos e clientes.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/produtos">Explorar produtos</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/seja-artesao">Quero vender</Link>
          </Button>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        {pillars.map(({ title, description, icon: Icon }) => (
          <Card key={title} className="border-border/70">
            <CardContent className="flex gap-4 p-6">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Icon className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-neutral-900">O que queremos entregar</h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>Uma experiência de compra acolhedora, com cara de feira criativa bem organizada.</p>
              <p>Ferramentas para o artesão cadastrar produtos, receber pedidos, acompanhar finanças e construir reputação.</p>
              <p>Mais contexto para o cliente entender quem fez, como foi feito e por que aquela peça é especial.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-neutral-900">Próximos focos</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Melhorar descoberta por busca, filtros e categorias.</li>
              <li>Evoluir perfis de loja com mais prova social e storytelling.</li>
              <li>Refinar jornada de compra, pagamento e acompanhamento do pedido.</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
