"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Props {
  user: { name: string | null; email: string; phone: string | null; cpfCnpj: string | null; createdAt: Date };
}

export function ProfileForm({ user }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user.name ?? "",
    phone: user.phone ?? "",
    cpfCnpj: user.cpfCnpj ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/conta/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao salvar."); return; }
      toast.success("Dados atualizados!");
      router.refresh();
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 max-w-lg">
      {/* Info readonly */}
      <Card className="border-[#071a33]/10 bg-[#f2ede0]/50">
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Mail className="size-4 text-[#071a33]/40" />
            <span>{user.email}</span>
            <span className="ml-auto text-xs bg-[#7c9f61]/10 text-[#7c9f61] px-2 py-0.5 rounded-full">verificado</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Calendar className="size-4 text-[#071a33]/40" />
            <span>Membro desde {formatDate(user.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Editable form */}
      <Card className="border-[#071a33]/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#071a33]">Editar dados</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[#071a33] font-medium">Nome completo</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border-[#071a33]/20 focus-visible:ring-[#7c9f61]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#071a33] font-medium">
                Telefone <span className="text-neutral-400 font-normal">(opcional)</span>
              </Label>
              <Input
                placeholder="11999999999"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border-[#071a33]/20 focus-visible:ring-[#7c9f61]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#071a33] font-medium">CPF ou CNPJ</Label>
              <Input
                placeholder="000.000.000-00 ou 00.000.000/0001-00"
                value={form.cpfCnpj}
                onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value.replace(/\D/g, "") })}
                className="border-[#071a33]/20 focus-visible:ring-[#7c9f61]"
              />
              <p className="text-[11px] text-neutral-400">Necessário para concluir pagamentos via PIX, boleto ou cartão.</p>
            </div>
            <div className="pt-1">
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#c1652e] hover:bg-[#9a5125] text-white font-semibold hover:scale-105 transition-all"
              >
                {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Salvar alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
