"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  SUBSCRIPTION_PRICES,
  SUBSCRIPTION_LIMITS,
  COMMISSION_BY_PLAN,
} from "@/lib/utils";

const PLANS = [
  {
    id: "FREE",
    name: "Grátis",
    color: "#27ae60",
    price: SUBSCRIPTION_PRICES.FREE,
    commission: COMMISSION_BY_PLAN.FREE,
    description: "Para quem quer testar antes de se comprometer.",
    features: [
      `Até ${SUBSCRIPTION_LIMITS.FREE} produtos ativos`,
      "Perfil público da loja",
      "Painel básico de pedidos",
      "Suporte por e-mail",
    ],
    highlight: false,
    badge: null,
    cta: "Começar grátis",
  },
  {
    id: "BASIC",
    name: "Básico",
    color: "#1e3a5f",
    price: SUBSCRIPTION_PRICES.BASIC,
    commission: COMMISSION_BY_PLAN.BASIC,
    description: "Para artesãos que querem crescer com visibilidade e ferramentas reais.",
    features: [
      `Até ${SUBSCRIPTION_LIMITS.BASIC} produtos ativos`,
      "Perfil em destaque nas buscas",
      "Chat com clientes",
      "Analytics de vendas",
    ],
    highlight: true,
    badge: "Mais popular",
    cta: "Assinar Básico",
  },
  {
    id: "PRO",
    name: "Pro",
    color: "#e07b2a",
    price: SUBSCRIPTION_PRICES.PRO,
    commission: COMMISSION_BY_PLAN.PRO,
    description: "Máxima exposição, recursos completos e menor comissão da plataforma.",
    features: [
      "Produtos ilimitados",
      "Destaque garantido na página inicial",
      "Analytics avançado + exportação",
      "Suporte prioritário 24h",
    ],
    highlight: false,
    badge: "Menor comissão",
    cta: "Assinar Pro",
  },
];

export default function BeArtisanPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("FREE");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    storeName: "",
    bio: "",
    city: "",
    state: "",
    whatsapp: "",
    instagram: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/artesaos/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plan: selectedPlan }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erro ao enviar cadastro.");
        return;
      }
      toast.success("Cadastro enviado! Nossa equipe irá analisar em breve.");
      router.push("/login");
    } catch {
      toast.error("Erro ao enviar cadastro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#1e3a5f]">
          Abra sua vitrine.{" "}
          <span className="text-[#e07b2a]">O Brasil está esperando.</span>
        </h1>
        <p className="text-neutral-500 mt-2 max-w-md mx-auto">
          Você faz a parte mais difícil. A gente cuida do resto.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className={`flex items-center gap-2 text-sm font-medium ${step === 1 ? "text-[#1e3a5f]" : "text-[#27ae60]"}`}>
          <div className={`size-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step === 1 ? "border-[#1e3a5f] bg-[#1e3a5f] text-white" : "border-[#27ae60] bg-[#27ae60] text-white"}`}>
            {step > 1 ? <CheckCircle2 className="size-4" /> : "1"}
          </div>
          Escolha o plano
        </div>
        <div className="h-px w-10 bg-neutral-200" />
        <div className={`flex items-center gap-2 text-sm font-medium ${step === 2 ? "text-[#1e3a5f]" : "text-neutral-400"}`}>
          <div className={`size-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step === 2 ? "border-[#1e3a5f] bg-[#1e3a5f] text-white" : "border-neutral-200 bg-white text-neutral-400"}`}>
            2
          </div>
          Seus dados
        </div>
      </div>

      {/* Step 1 — Plan selection */}
      {step === 1 && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative pt-8 pb-6 px-6 rounded-2xl border-2 text-left transition-all ${
                  selectedPlan === plan.id
                    ? "border-[#1e3a5f] bg-[#1e3a5f]/5 shadow-md"
                    : "border-[#1e3a5f]/15 bg-white hover:border-[#1e3a5f]/30 hover:shadow-sm"
                }`}
              >
                {plan.badge && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-3 py-0.5 rounded-full whitespace-nowrap"
                    style={{ background: plan.color }}
                  >
                    {plan.badge}
                  </span>
                )}

                <div className="font-bold text-lg text-[#1e3a5f] mb-0.5">{plan.name}</div>
                <div className="text-2xl font-bold text-[#1e3a5f] mb-1">
                  {plan.price === 0 ? (
                    <span>Grátis</span>
                  ) : (
                    <>R$ {plan.price.toFixed(2).replace(".", ",")}
                      <span className="text-sm font-normal text-neutral-400">/mês</span>
                    </>
                  )}
                </div>

                {/* Comissão em destaque */}
                <div
                  className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
                  style={{ background: `${plan.color}15`, color: plan.color }}
                >
                  {(plan.commission * 100).toFixed(0)}% de comissão por venda
                </div>

                <p className="text-xs text-neutral-400 mb-4 leading-relaxed">{plan.description}</p>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-neutral-600">
                      <CheckCircle2 className="size-4 text-[#27ae60] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => setStep(2)}
              className="bg-[#e07b2a] hover:bg-[#c96a1e] text-white font-semibold px-8 hover:scale-105 transition-all"
            >
              {PLANS.find((p) => p.id === selectedPlan)?.cta} <ArrowRight className="ml-2 size-4" />
            </Button>
            <p className="text-xs text-neutral-400 mt-3">
              Sem cartão de crédito. Cancele quando quiser.{" "}
              <a href="/planos" className="underline hover:text-[#1e3a5f] transition-colors">
                Ver comparativo completo →
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Step 2 — Registration form */}
      {step === 2 && (
        <Card className="w-full max-w-lg mx-auto border-[#1e3a5f]/15 shadow-lg rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-[#1e3a5f]">Dados do cadastro</CardTitle>
            <CardDescription>
              Nossa equipe irá analisar e aprovar em até 2 dias úteis.
              Então você já pode começar a vender.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-[#1e3a5f] font-medium">Nome completo</Label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="border-[#1e3a5f]/20 focus-visible:ring-[#27ae60]"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-[#1e3a5f] font-medium">Email</Label>
                  <Input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="border-[#1e3a5f]/20 focus-visible:ring-[#27ae60]"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-[#1e3a5f] font-medium">Senha</Label>
                  <Input
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="border-[#1e3a5f]/20 focus-visible:ring-[#27ae60]"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-[#1e3a5f] font-medium">Nome da sua loja / ateliê</Label>
                  <Input
                    required
                    value={form.storeName}
                    placeholder="Ex: Ateliê das Mãos de Ouro"
                    onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                    className="border-[#1e3a5f]/20 focus-visible:ring-[#27ae60]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#1e3a5f] font-medium">Cidade</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="border-[#1e3a5f]/20 focus-visible:ring-[#27ae60]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#1e3a5f] font-medium">Estado (UF)</Label>
                  <Input
                    maxLength={2}
                    placeholder="SP"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })}
                    className="border-[#1e3a5f]/20 focus-visible:ring-[#27ae60]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#1e3a5f] font-medium">WhatsApp</Label>
                  <Input
                    placeholder="11999999999"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    className="border-[#1e3a5f]/20 focus-visible:ring-[#27ae60]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[#1e3a5f] font-medium">Instagram (sem @)</Label>
                  <Input
                    placeholder="seuuser"
                    value={form.instagram}
                    onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                    className="border-[#1e3a5f]/20 focus-visible:ring-[#27ae60]"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label className="text-[#1e3a5f] font-medium">Fale sobre você e seu trabalho</Label>
                  <Textarea
                    rows={3}
                    required
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Conte sobre seu artesanato, materiais que usa, de onde vem sua inspiração..."
                    className="border-[#1e3a5f]/20 focus-visible:ring-[#27ae60]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="border-[#1e3a5f]/20 text-[#1e3a5f]"
                >
                  <ArrowLeft className="mr-1 size-4" /> Voltar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#e07b2a] hover:bg-[#c96a1e] text-white font-semibold"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Enviar cadastro
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
