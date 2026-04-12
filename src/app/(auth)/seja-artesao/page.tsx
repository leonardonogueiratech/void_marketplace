"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { SUBSCRIPTION_PRICES } from "@/lib/utils";

const PLANS = [
  {
    id: "FREE",
    name: "Grátis",
    price: 0,
    features: ["Até 5 produtos", "Perfil público", "Suporte por email"],
    highlight: false,
  },
  {
    id: "BASIC",
    name: "Básico",
    price: SUBSCRIPTION_PRICES.BASIC,
    features: ["Até 50 produtos", "Perfil em destaque", "Comissão reduzida", "Chat com clientes"],
    highlight: true,
  },
  {
    id: "PRO",
    name: "Pro",
    price: SUBSCRIPTION_PRICES.PRO,
    features: ["Produtos ilimitados", "Destaque na home", "Comissão mínima", "Suporte prioritário"],
    highlight: false,
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
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Venda no Feito de Gente</h1>
        <p className="text-muted-foreground mt-2">
          Alcance clientes que valorizam o artesanato autêntico
        </p>
      </div>

      {step === 1 && (
        <div>
          <h2 className="text-center text-lg font-semibold mb-6">Escolha seu plano</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-6 rounded-xl border-2 text-left transition-all ${
                  selectedPlan === plan.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-neutral-300"
                } ${plan.highlight ? "ring-2 ring-amber-400 ring-offset-2" : ""}`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-0.5 rounded-full">
                    Mais popular
                  </span>
                )}
                <div className="font-bold text-lg mb-1">{plan.name}</div>
                <div className="text-2xl font-bold mb-4">
                  {plan.price === 0 ? (
                    "Grátis"
                  ) : (
                    <>
                      R$ {plan.price.toFixed(2).replace(".", ",")}
                      <span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </>
                  )}
                </div>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
          <div className="text-center">
            <Button size="lg" onClick={() => setStep(2)}>
              Continuar com o plano {PLANS.find((p) => p.id === selectedPlan)?.name}
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Dados do cadastro</CardTitle>
            <CardDescription>
              Preencha seus dados. Nossa equipe irá analisar e aprovar em até 2 dias úteis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <Label>Nome completo</Label>
                  <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>Email</Label>
                  <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>Senha</Label>
                  <Input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>Nome da sua loja / ateliê</Label>
                  <Input required value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Cidade</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Estado (UF)</Label>
                  <Input maxLength={2} placeholder="SP" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} />
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
                  <Label>Fale um pouco sobre você e seu trabalho</Label>
                  <Textarea
                    rows={3}
                    required
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Conte sobre seu artesanato, materiais que usa, de onde vem sua inspiração..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  Voltar
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
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
