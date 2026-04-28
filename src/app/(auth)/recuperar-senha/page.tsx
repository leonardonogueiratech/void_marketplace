"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/recuperar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Erro ao enviar e-mail.");
        return;
      }
      setSent(true);
    } catch {
      toast.error("Erro ao processar solicitação.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="size-16 rounded-full bg-[#4a7c3f]/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="size-8 text-[#4a7c3f]" />
          </div>
          <h2 className="text-xl font-bold text-[#1e3a5f]">E-mail enviado!</h2>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Se existe uma conta com o e-mail <strong className="text-[#1e3a5f]">{email}</strong>,
            você receberá um link para redefinir sua senha em instantes.
          </p>
          <p className="text-xs text-neutral-400">Verifique também a pasta de spam.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1e3a5f] hover:text-[#e07b2a] transition-colors"
          >
            <ArrowLeft className="size-4" /> Voltar ao login
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="size-10 rounded-xl bg-[#1e3a5f]/8 flex items-center justify-center mb-2">
          <Mail className="size-5 text-[#1e3a5f]" />
        </div>
        <CardTitle className="text-xl">Esqueceu a senha?</CardTitle>
        <CardDescription>
          Informe seu e-mail e enviaremos um link para criar uma nova senha.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white" disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Enviar link de redefinição
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-5">
          <Link href="/login" className="inline-flex items-center gap-1 hover:text-[#1e3a5f] transition-colors">
            <ArrowLeft className="size-3.5" /> Voltar ao login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
