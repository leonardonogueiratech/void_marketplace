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
  user: { name: string | null; email: string; phone: string | null; createdAt: Date };
}

export function ProfileForm({ user }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user.name ?? "",
    phone: user.phone ?? "",
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
      <Card className="border-[#1e3a5f]/10 bg-[#f7f3ed]/50">
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Mail className="size-4 text-[#1e3a5f]/40" />
            <span>{user.email}</span>
            <span className="ml-auto text-xs bg-[#4a7c3f]/10 text-[#4a7c3f] px-2 py-0.5 rounded-full">verificado</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Calendar className="size-4 text-[#1e3a5f]/40" />
            <span>Membro desde {formatDate(user.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Editable form */}
      <Card className="border-[#1e3a5f]/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#1e3a5f]">Editar dados</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[#1e3a5f] font-medium">Nome completo</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border-[#1e3a5f]/20 focus-visible:ring-[#4a7c3f]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#1e3a5f] font-medium">
                Telefone <span className="text-neutral-400 font-normal">(opcional)</span>
              </Label>
              <Input
                placeholder="11999999999"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border-[#1e3a5f]/20 focus-visible:ring-[#4a7c3f]"
              />
            </div>
            <div className="pt-1">
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#e07b2a] hover:bg-[#c96a1e] text-white font-semibold hover:scale-105 transition-all"
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
