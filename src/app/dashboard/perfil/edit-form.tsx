"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Upload, Check } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Props {
  artisan: {
    storeName: string;
    bio: string | null;
    story?: string | null;
    location?: string | null;
    city?: string | null;
    state?: string | null;
    whatsapp?: string | null;
    instagram?: string | null;
    website?: string | null;
    logoImage?: string | null;
    bannerImage?: string | null;
    categories: { category: { id: string; name: string } }[];
  };
  allCategories: Category[];
}

async function uploadFile(file: File, folder: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Erro no upload.");
  return data.url as string;
}

export function EditProfileForm({ artisan, allCategories }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    storeName: artisan.storeName,
    bio: artisan.bio ?? "",
    story: artisan.story ?? "",
    location: artisan.location ?? "",
    city: artisan.city ?? "",
    state: artisan.state ?? "",
    whatsapp: artisan.whatsapp ?? "",
    instagram: artisan.instagram ?? "",
    website: artisan.website ?? "",
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    artisan.categories.map((c) => c.category.id)
  );

  const [logoUrl, setLogoUrl] = useState<string | null>(artisan.logoImage ?? null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(artisan.bannerImage ?? null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);

  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setLogoUploading(true);
    try {
      const url = await uploadFile(file, "artesao/logos");
      setLogoUrl(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar logo.");
    } finally {
      setLogoUploading(false);
    }
  }

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setBannerUploading(true);
    try {
      const url = await uploadFile(file, "artesao/banners");
      setBannerUrl(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar banner.");
    } finally {
      setBannerUploading(false);
    }
  }

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      selectedCategories.forEach((id) => fd.append("categoryIds", id));
      if (logoUrl) fd.append("logoUrl", logoUrl);
      if (bannerUrl) fd.append("bannerUrl", bannerUrl);

      const res = await fetch("/api/dashboard/perfil", { method: "PUT", body: fd });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Erro ao salvar.");
        return;
      }

      toast.success("Perfil atualizado com sucesso!");
      router.refresh();
    } catch {
      toast.error("Erro ao salvar perfil.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Imagens */}
      <Card className="border-[#1e3a5f]/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#1e3a5f] text-base">Imagens da loja</CardTitle>
          <CardDescription>Logo e banner exibidos no seu perfil público.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Banner */}
          <div>
            <Label className="text-[#1e3a5f] font-medium mb-2 block">Banner</Label>
            <div
              className="relative h-32 rounded-xl border-2 border-dashed border-[#1e3a5f]/20 bg-[#f7f3ed] overflow-hidden cursor-pointer hover:border-[#1e3a5f]/40 transition-colors"
              onClick={() => bannerRef.current?.click()}
            >
              {bannerUploading ? (
                <div className="flex flex-col items-center justify-center h-full gap-1.5">
                  <Loader2 className="size-6 text-[#1e3a5f] animate-spin" />
                  <span className="text-xs text-[#1e3a5f]">Enviando...</span>
                </div>
              ) : bannerUrl ? (
                <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-1.5 text-neutral-400">
                  <Upload className="size-6" />
                  <span className="text-xs">Clique para enviar (1200×300px)</span>
                </div>
              )}
            </div>
            <input
              ref={bannerRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerChange}
            />
          </div>

          {/* Logo */}
          <div>
            <Label className="text-[#1e3a5f] font-medium mb-2 block">Logo / Avatar da loja</Label>
            <div className="flex items-center gap-4">
              <div
                className="size-20 rounded-2xl border-2 border-dashed border-[#1e3a5f]/20 bg-[#f7f3ed] overflow-hidden cursor-pointer hover:border-[#1e3a5f]/40 transition-colors flex items-center justify-center"
                onClick={() => logoRef.current?.click()}
              >
                {logoUploading ? (
                  <Loader2 className="size-5 text-[#1e3a5f] animate-spin" />
                ) : logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="size-5 text-neutral-400" />
                )}
              </div>
              <div className="text-xs text-neutral-400 leading-relaxed">
                PNG ou JPG, mínimo 200×200px.<br />
                Exibida no card e perfil da loja.
              </div>
            </div>
            <input
              ref={logoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Informações básicas */}
      <Card className="border-[#1e3a5f]/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#1e3a5f] text-base">Informações básicas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-[#1e3a5f] font-medium">Nome da loja *</Label>
            <Input
              required
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              className="border-[#1e3a5f]/20 focus-visible:ring-[#27ae60]"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-[#1e3a5f] font-medium">Bio *</Label>
            <Textarea
              required
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Conte sobre seu artesanato, materiais e inspiração..."
              className="border-[#1e3a5f]/20 focus-visible:ring-[#27ae60]"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-[#1e3a5f] font-medium">
              História da marca <span className="text-neutral-400 font-normal">(opcional)</span>
            </Label>
            <Textarea
              rows={4}
              value={form.story}
              onChange={(e) => setForm({ ...form, story: e.target.value })}
              placeholder="Como tudo começou? Qual é a sua história com o artesanato?"
              className="border-[#1e3a5f]/20 focus-visible:ring-[#27ae60]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Localização e contato */}
      <Card className="border-[#1e3a5f]/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#1e3a5f] text-base">Localização e contato</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-[#1e3a5f] font-medium">Bairro / Região</Label>
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Ex: Centro, Vila Mariana..."
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
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-[#1e3a5f] font-medium">Site</Label>
            <Input
              type="url"
              placeholder="https://www.seusite.com.br"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="border-[#1e3a5f]/20 focus-visible:ring-[#27ae60]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categorias */}
      {allCategories.length > 0 && (
        <Card className="border-[#1e3a5f]/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#1e3a5f] text-base">Categorias de atuação</CardTitle>
            <CardDescription>Selecione as categorias do seu artesanato.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => {
                const active = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-all ${
                      active
                        ? "bg-[#27ae60] border-[#27ae60] text-white"
                        : "bg-white border-[#1e3a5f]/20 text-neutral-600 hover:border-[#27ae60]/50"
                    }`}
                  >
                    {active && <Check className="size-3" />}
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading || logoUploading || bannerUploading}
          className="bg-[#e07b2a] hover:bg-[#c96a1e] text-white font-semibold px-8 hover:scale-105 transition-all"
        >
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
          Salvar alterações
        </Button>
      </div>
    </form>
  );
}
