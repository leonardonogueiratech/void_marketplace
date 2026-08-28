"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle2, Store, Clock, ArrowRight, CreditCard } from "lucide-react";
import {
  SUBSCRIPTION_PRICES, SUBSCRIPTION_LAUNCH_PRICES,
  SUBSCRIPTION_LIMITS, COMMISSION_BY_PLAN,
  PHOTO_LIMITS,
} from "@/lib/utils";

const PLANS = [
  {
    id: "FREE",
    name: "Inicial",
    color: "#7c9f61",
    price: SUBSCRIPTION_PRICES.FREE,
    launchPrice: SUBSCRIPTION_LAUNCH_PRICES.FREE,
    commission: COMMISSION_BY_PLAN.FREE,
    features: [`Até ${SUBSCRIPTION_LIMITS.FREE} produtos`, `${PHOTO_LIMITS.FREE} fotos/produto`, "Loja básica"],
    badge: null as string | null,
  },
  {
    id: "BASIC",
    name: "Profissional",
    color: "#071a33",
    price: SUBSCRIPTION_PRICES.BASIC,
    launchPrice: SUBSCRIPTION_LAUNCH_PRICES.BASIC,
    commission: COMMISSION_BY_PLAN.BASIC,
    features: [`Até ${SUBSCRIPTION_LIMITS.BASIC} produtos`, `${PHOTO_LIMITS.BASIC} fotos/produto`, "Destaque na busca"],
    badge: "Recomendado" as string | null,
  },
  {
    id: "PRO",
    name: "Ateliê",
    color: "#c1652e",
    price: SUBSCRIPTION_PRICES.PRO,
    launchPrice: SUBSCRIPTION_LAUNCH_PRICES.PRO,
    commission: COMMISSION_BY_PLAN.PRO,
    features: ["Produtos ilimitados", `${PHOTO_LIMITS.PRO} fotos/produto`, "Suporte prioritário"],
    badge: null as string | null,
  },
];

export default function ContaSejaArtesaoPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("FREE");
  const [form, setForm] = useState({
    storeName: "",
    bio: "",
    city: "",
    state: "",
    cpfCnpj: "",
    whatsapp: "",
    instagram: "",
  });
  const [card, setCard] = useState({
    holderName: "",
    number: "",
    expiryMonth: "",
    expiryYear: "",
    ccv: "",
  });

  const isPaidPlan = selectedPlan !== "FREE";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/conta/seja-artesao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          plan: selectedPlan,
          termsAccepted,
          card: isPaidPlan ? card : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao enviar."); return; }
      setStep(3);
    } catch {
      toast.error("Erro ao enviar cadastro.");
    } finally {
      setLoading(false);
    }
  }

  if (step === 3) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-5">
        <div className="size-20 rounded-full bg-[#7c9f61]/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="size-10 text-[#7c9f61]" />
        </div>
        <h1 className="text-2xl font-bold text-[#071a33]">Cadastro enviado!</h1>
        <p className="text-neutral-500">
          Nossa equipe vai analisar seu perfil em até <strong>2 dias úteis</strong>.
          Você receberá um e-mail assim que for aprovado e poderá começar a vender.
        </p>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700 text-left flex gap-3">
          <Clock className="size-4 shrink-0 mt-0.5" />
          <p>Enquanto aguarda, você ainda pode navegar como comprador normalmente. Quando aprovado, o painel de artesão aparecerá automaticamente.</p>
        </div>
        <div className="bg-[#071a33]/5 border border-[#071a33]/15 rounded-xl p-4 text-sm text-[#071a33] text-left">
          <p className="font-semibold mb-1">Use o tempo de espera bem:</p>
          <a
            href="/guia-do-vendedor"
            className="inline-flex items-center gap-1.5 text-[#c1652e] font-medium underline hover:text-[#9a5125] transition-colors"
          >
            Leia o Guia do Vendedor →
          </a>
          <p className="text-neutral-500 text-xs mt-1">
            Explica como funciona o Asaas, como enviar pelos Correios e tudo mais.
          </p>
        </div>
        <Button
          onClick={() => router.push("/")}
          className="bg-[#071a33] hover:bg-[#051224] text-white"
        >
          Voltar para o início
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="size-10 rounded-xl bg-[#c1652e]/10 flex items-center justify-center">
            <Store className="size-5 text-[#c1652e]" />
          </div>
          <h1 className="text-2xl font-bold text-[#071a33]">Quero ser artesão</h1>
        </div>
        <p className="text-neutral-500 text-sm">
          Transforme sua conta em uma loja. Sua conta de comprador continua funcionando normalmente.
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {[{ n: 1, label: "Plano" }, { n: 2, label: "Sua loja" }].map(({ n, label }, idx) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 text-xs font-medium ${step >= n ? "text-[#071a33]" : "text-neutral-400"}`}>
              <div className={`size-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                step > n ? "bg-[#7c9f61] border-[#7c9f61] text-white" :
                step === n ? "bg-[#071a33] border-[#071a33] text-white" :
                "bg-white border-neutral-200 text-neutral-400"
              }`}>
                {step > n ? "✓" : n}
              </div>
              {label}
            </div>
            {idx === 0 && <div className="h-px w-8 bg-neutral-200" />}
          </div>
        ))}
      </div>

      {/* Step 1 — Plan */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative pt-7 pb-5 px-5 rounded-2xl border-2 text-left transition-all ${
                  selectedPlan === plan.id
                    ? "border-[#071a33] bg-[#071a33]/4 shadow-md"
                    : "border-[#071a33]/12 bg-white hover:border-[#071a33]/25"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap" style={{ background: plan.color }}>
                    {plan.badge}
                  </span>
                )}
                <p className="font-bold text-[#071a33] mb-0.5">{plan.name}</p>
                <div className="mb-1">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xl font-bold text-[#7c9f61]">Grátis</span>
                    <span className="text-[11px] text-neutral-400">3 meses ★</span>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    depois R$ {plan.launchPrice.toFixed(2).replace(".", ",")}/mês · depois{" "}
                    <span className="line-through">R$ {plan.price.toFixed(2).replace(".", ",")}</span>/mês
                  </p>
                </div>
                <div className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full mb-3" style={{ background: `${plan.color}15`, color: plan.color }}>
                  {(plan.commission * 100).toFixed(0)}% de comissão sempre
                </div>
                <ul className="space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <CheckCircle2 className="size-3 text-[#7c9f61] shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
          <Button onClick={() => setStep(2)} className="bg-[#c1652e] hover:bg-[#9a5125] text-white font-semibold w-full sm:w-auto">
            Continuar <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      )}

      {/* Step 2 — Store info */}
      {step === 2 && (
        <Card className="border-[#071a33]/12">
          <CardHeader className="pb-4">
            <CardTitle className="text-[#071a33]">Dados da sua loja</CardTitle>
            <CardDescription>Nossa equipe irá analisar e aprovar em até 2 dias úteis.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <Label>Nome da loja / ateliê *</Label>
                  <Input
                    required
                    placeholder="Ex: Ateliê das Mãos de Ouro"
                    value={form.storeName}
                    onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Cidade</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Estado (UF)</Label>
                  <Input maxLength={2} placeholder="SP" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>CPF ou CNPJ</Label>
                  <Input
                    placeholder="000.000.000-00 ou 00.000.000/0001-00"
                    value={form.cpfCnpj}
                    onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value.replace(/\D/g, "") })}
                  />
                  <p className="text-[11px] text-neutral-400">Necessário para criar sua conta de recebimentos no Asaas.</p>
                </div>
                <div className="space-y-1.5">
                  <Label>WhatsApp</Label>
                  <Input placeholder="11999999999" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Instagram (sem @)</Label>
                  <Input placeholder="seuuser" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>Fale sobre você e seu trabalho *</Label>
                  <Textarea
                    required
                    rows={4}
                    placeholder="Conte sobre seu artesanato, materiais, inspiração..."
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  />
                </div>
              </div>

              {/* Cartão de crédito — obrigatório pra planos pagos */}
              {isPaidPlan && (
                <div className="space-y-3 p-4 rounded-xl bg-[#071a33]/4 border border-[#071a33]/15">
                  <div className="flex items-center gap-2">
                    <CreditCard className="size-4 text-[#071a33]" />
                    <p className="text-sm font-semibold text-[#071a33]">Dados do cartão de crédito</p>
                  </div>
                  <p className="text-xs text-neutral-500 -mt-1">
                    A cobrança da mensalidade começa só depois da aprovação do seu cadastro.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5 col-span-2">
                      <Label>Nome impresso no cartão *</Label>
                      <Input
                        required
                        placeholder="Como está no cartão"
                        value={card.holderName}
                        onChange={(e) => setCard({ ...card, holderName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <Label>Número do cartão *</Label>
                      <Input
                        required
                        placeholder="0000 0000 0000 0000"
                        value={card.number}
                        onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, "") })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Validade (MM/AAAA) *</Label>
                      <div className="flex gap-2">
                        <Input
                          required
                          placeholder="MM"
                          maxLength={2}
                          value={card.expiryMonth}
                          onChange={(e) => setCard({ ...card, expiryMonth: e.target.value.replace(/\D/g, "") })}
                        />
                        <Input
                          required
                          placeholder="AAAA"
                          maxLength={4}
                          value={card.expiryYear}
                          onChange={(e) => setCard({ ...card, expiryYear: e.target.value.replace(/\D/g, "") })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>CVV *</Label>
                      <Input
                        required
                        placeholder="000"
                        maxLength={4}
                        value={card.ccv}
                        onChange={(e) => setCard({ ...card, ccv: e.target.value.replace(/\D/g, "") })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Termo de adesão */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#071a33]/5 border border-[#071a33]/15">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 size-4 accent-[#071a33] cursor-pointer"
                />
                <label htmlFor="terms" className="text-sm text-neutral-600 cursor-pointer leading-relaxed">
                  Li e concordo com os{" "}
                  <a
                    href="/termos-do-vendedor"
                    target="_blank"
                    className="text-[#071a33] font-medium underline hover:text-[#c1652e] transition-colors"
                  >
                    Termos de Adesão do Vendedor
                  </a>
                  , incluindo as políticas de comissão, envio e pagamento via Asaas.
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>← Voltar</Button>
                <Button type="submit" disabled={loading || !termsAccepted} className="flex-1 bg-[#c1652e] hover:bg-[#9a5125] text-white font-semibold">
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
