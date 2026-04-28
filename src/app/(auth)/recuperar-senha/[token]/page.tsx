"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, ShieldCheck, XCircle, ArrowLeft } from "lucide-react";

export default function ConfirmarRecuperacaoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ password: "", confirm: "" });

  useEffect(() => {
    params.then(({ token: t }) => {
      setToken(t);
      fetch(`/api/auth/recuperar-senha/${t}`)
        .then((r) => r.json())
        .then((data) => setValid(data.valid === true))
        .catch(() => setValid(false))
        .finally(() => setValidating(false));
    });
  }, [params]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/recuperar-senha/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erro ao redefinir senha.");
        return;
      }
      toast.success("Senha redefinida! Faça login com a nova senha.");
      router.push("/login");
    } catch {
      toast.error("Erro ao processar solicitação.");
    } finally {
      setLoading(false);
    }
  }

  if (validating) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="py-12 flex flex-col items-center gap-3">
          <Loader2 className="size-8 text-[#1e3a5f] animate-spin" />
          <p className="text-sm text-neutral-500">Validando link...</p>
        </CardContent>
      </Card>
    );
  }

  if (!valid) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="py-10 text-center space-y-4">
          <div className="size-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <XCircle className="size-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-[#1e3a5f]">Link inválido ou expirado</h2>
          <p className="text-sm text-neutral-500">
            Este link de redefinição não é mais válido. Solicite um novo.
          </p>
          <Button asChild className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white">
            <Link href="/recuperar-senha">Solicitar novo link</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="size-10 rounded-xl bg-[#4a7c3f]/10 flex items-center justify-center mb-2">
          <ShieldCheck className="size-5 text-[#4a7c3f]" />
        </div>
        <CardTitle className="text-xl">Criar nova senha</CardTitle>
        <CardDescription>Escolha uma senha segura com pelo menos 6 caracteres.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">Nova senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirmar nova senha</Label>
            <div className="relative">
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="Repita a senha"
                required
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {form.confirm && form.password !== form.confirm && (
              <p className="text-xs text-red-500">As senhas não coincidem.</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-[#e07b2a] hover:bg-[#c96a1e] text-white font-semibold"
            disabled={loading || form.password !== form.confirm}
          >
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Salvar nova senha
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
