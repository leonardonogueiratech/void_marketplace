"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, MapPin, Trash2, Star, X, Search } from "lucide-react";
import { useCep } from "@/hooks/use-cep";

interface Address {
  id: string;
  label: string | null;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

const emptyForm = {
  label: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
  zipCode: "",
  isDefault: false,
};

export function AddressManager({ initialAddresses }: { initialAddresses: Address[] }) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const numberRef = useRef<HTMLInputElement>(null);

  const { lookup: lookupCep, loading: cepLoading, format: formatCep } = useCep((data) => {
    setForm((prev) => ({ ...prev, ...data }));
    setTimeout(() => numberRef.current?.focus(), 50);
  });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/conta/enderecos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao salvar."); return; }

      if (form.isDefault) {
        setAddresses((prev) => [
          { ...data },
          ...prev.map((a) => ({ ...a, isDefault: false })),
        ]);
      } else {
        setAddresses((prev) => [...prev, data]);
      }

      toast.success("Endereço adicionado!");
      setForm(emptyForm);
      setShowForm(false);
      router.refresh();
    } catch {
      toast.error("Erro ao salvar endereço.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/conta/enderecos/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Erro ao remover."); return; }
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success("Endereço removido.");
    } catch {
      toast.error("Erro ao remover endereço.");
    } finally {
      setDeleting(null);
    }
  }

  async function handleSetDefault(id: string) {
    try {
      const res = await fetch(`/api/conta/enderecos/${id}`, { method: "PATCH" });
      if (!res.ok) { toast.error("Erro ao atualizar."); return; }
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );
      toast.success("Endereço padrão atualizado.");
    } catch {
      toast.error("Erro ao atualizar.");
    }
  }

  return (
    <div className="space-y-4 max-w-lg">
      {/* Address list */}
      {addresses.length === 0 && !showForm && (
        <Card className="border-[#1e3a5f]/10 border-dashed">
          <CardContent className="py-10 text-center">
            <MapPin className="size-8 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-400">Nenhum endereço cadastrado.</p>
          </CardContent>
        </Card>
      )}

      {addresses.map((addr) => (
        <Card key={addr.id} className={`border-[#1e3a5f]/10 ${addr.isDefault ? "ring-1 ring-[#4a7c3f]/30" : ""}`}>
          <CardContent className="py-4 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="size-8 rounded-lg bg-[#f7f3ed] flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="size-4 text-[#1e3a5f]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  {addr.label && (
                    <span className="text-sm font-semibold text-[#1e3a5f]">{addr.label}</span>
                  )}
                  {addr.isDefault && (
                    <span className="text-xs bg-[#4a7c3f]/10 text-[#4a7c3f] px-2 py-0.5 rounded-full font-medium">
                      Padrão
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-600">
                  {addr.street}, {addr.number}
                  {addr.complement ? `, ${addr.complement}` : ""}
                </p>
                <p className="text-xs text-neutral-400">
                  {addr.district} — {addr.city}/{addr.state} · CEP {addr.zipCode}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  title="Definir como padrão"
                  className="size-8 rounded-lg flex items-center justify-center text-neutral-300 hover:text-[#4a7c3f] hover:bg-[#4a7c3f]/8 transition-colors"
                >
                  <Star className="size-4" />
                </button>
              )}
              <button
                onClick={() => handleDelete(addr.id)}
                disabled={deleting === addr.id}
                title="Remover"
                className="size-8 rounded-lg flex items-center justify-center text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                {deleting === addr.id
                  ? <Loader2 className="size-4 animate-spin" />
                  : <Trash2 className="size-4" />}
              </button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add form */}
      {showForm ? (
        <Card className="border-[#1e3a5f]/10">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-[#1e3a5f]">Novo endereço</p>
              <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label className="text-[#1e3a5f] font-medium text-xs">
                  Identificação <span className="text-neutral-400 font-normal">(ex: Casa, Trabalho)</span>
                </Label>
                <Input
                  placeholder="Casa"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="border-[#1e3a5f]/20 focus-visible:ring-[#4a7c3f] h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label className="text-[#1e3a5f] font-medium text-xs">CEP *</Label>
                <div className="relative">
                  <Input
                    required
                    placeholder="00000-000"
                    value={formatCep(form.zipCode)}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
                      setForm({ ...form, zipCode: digits });
                      lookupCep(digits);
                    }}
                    maxLength={9}
                    className="border-[#1e3a5f]/20 focus-visible:ring-[#4a7c3f] h-9 text-sm pr-8"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400">
                    {cepLoading
                      ? <Loader2 className="size-3.5 animate-spin" />
                      : <Search className="size-3.5" />}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label className="text-[#1e3a5f] font-medium text-xs">Rua *</Label>
                <Input
                  required
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  className="border-[#1e3a5f]/20 focus-visible:ring-[#4a7c3f] h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[#1e3a5f] font-medium text-xs">Número *</Label>
                <Input
                  ref={numberRef}
                  required
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  className="border-[#1e3a5f]/20 focus-visible:ring-[#4a7c3f] h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[#1e3a5f] font-medium text-xs">Complemento</Label>
                <Input
                  placeholder="Apto, bloco..."
                  value={form.complement}
                  onChange={(e) => setForm({ ...form, complement: e.target.value })}
                  className="border-[#1e3a5f]/20 focus-visible:ring-[#4a7c3f] h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label className="text-[#1e3a5f] font-medium text-xs">Bairro *</Label>
                <Input
                  required
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  className="border-[#1e3a5f]/20 focus-visible:ring-[#4a7c3f] h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[#1e3a5f] font-medium text-xs">Cidade *</Label>
                <Input
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="border-[#1e3a5f]/20 focus-visible:ring-[#4a7c3f] h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[#1e3a5f] font-medium text-xs">UF *</Label>
                <Input
                  required
                  maxLength={2}
                  placeholder="SP"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })}
                  className="border-[#1e3a5f]/20 focus-visible:ring-[#4a7c3f] h-9 text-sm"
                />
              </div>
              <div className="col-span-2 flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="accent-[#4a7c3f]"
                />
                <label htmlFor="isDefault" className="text-sm text-neutral-600 cursor-pointer">
                  Definir como endereço padrão
                </label>
              </div>
              <div className="col-span-2 flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowForm(false)}
                  className="border-[#1e3a5f]/20 text-[#1e3a5f]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading}
                  className="bg-[#e07b2a] hover:bg-[#c96a1e] text-white font-semibold"
                >
                  {loading && <Loader2 className="mr-2 size-3.5 animate-spin" />}
                  Salvar endereço
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          onClick={() => setShowForm(true)}
          className="w-full border-dashed border-[#1e3a5f]/20 text-[#1e3a5f] hover:bg-[#1e3a5f]/4"
        >
          <Plus className="mr-2 size-4" /> Adicionar endereço
        </Button>
      )}
    </div>
  );
}
