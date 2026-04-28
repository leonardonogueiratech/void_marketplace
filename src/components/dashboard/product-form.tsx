"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ProductFormProps {
  artisanId: string;
  categories: { id: string; name: string }[];
  product?: {
    id: string;
    name: string;
    description?: string | null;
    story?: string | null;
    price: number;
    comparePrice?: number | null;
    stock: number;
    sku?: string | null;
    weight?: number | null;
    categoryId?: string | null;
    status: string;
    tags: string[];
    materials: string[];
    images?: { url: string }[];
  };
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

export function ProductForm({ artisanId, categories, product }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;
  const [loading, setLoading] = useState(false);

  // Existing images (edit mode) + newly uploaded URLs
  const [imageUrls, setImageUrls] = useState<string[]>(
    product?.images?.map((i) => i.url) ?? []
  );
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    story: product?.story ?? "",
    price: product?.price?.toString() ?? "",
    comparePrice: product?.comparePrice?.toString() ?? "",
    stock: product?.stock?.toString() ?? "1",
    sku: product?.sku ?? "",
    weight: product?.weight?.toString() ?? "",
    categoryId: product?.categoryId ?? "",
    status: product?.status ?? "DRAFT",
    tags: (product?.tags ?? []).join(", "),
    materials: (product?.materials ?? []).join(", "),
  });

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = "";
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        files.map((f) => uploadFile(f, `artesao/${artisanId}/produtos`))
      );
      setImageUrls((prev) => [...prev, ...uploaded]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro no upload das imagens.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        ...form,
        artisanId,
        imageUrls,
      };

      const url = isEditing ? `/api/produtos/${product!.id}` : "/api/produtos";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Erro ao salvar produto.");
        return;
      }

      toast.success(isEditing ? "Produto atualizado!" : "Produto criado!");
      router.push("/dashboard/produtos");
      router.refresh();
    } catch {
      toast.error("Erro ao salvar produto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1.5">
            <Label>Nome do produto *</Label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea rows={3} placeholder="Descreva o produto, características, dimensões..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>História da peça</Label>
            <Textarea rows={3} placeholder="Conte a história por trás desta peça, sua inspiração..." value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Preço (R$) *</Label>
              <Input type="number" required step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Preço original (riscar)</Label>
              <Input type="number" step="0.01" min="0" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Estoque *</Label>
              <Input type="number" required min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Peso (kg)</Label>
              <Input type="number" step="0.1" min="0" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>SKU</Label>
            <Input placeholder="Código interno (opcional)" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="DRAFT">Rascunho</option>
              <option value="ACTIVE">Ativo (visível na loja)</option>
              <option value="INACTIVE">Inativo</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1.5">
            <Label>Tags (separadas por vírgula)</Label>
            <Input placeholder="ex: cerâmica, decoração, feito à mão" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Materiais (separados por vírgula)</Label>
            <Input placeholder="ex: argila, tinta acrílica, verniz" value={form.materials} onChange={(e) => setForm({ ...form, materials: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Label className="mb-3 block">Fotos do produto</Label>

          <label className={`flex flex-col items-center justify-center h-28 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${uploading ? "border-primary/40 bg-primary/5" : "border-border hover:bg-neutral-50"}`}>
            {uploading ? (
              <>
                <Loader2 className="size-6 text-primary animate-spin mb-1.5" />
                <span className="text-sm text-primary font-medium">Enviando...</span>
              </>
            ) : (
              <>
                <Upload className="size-7 text-muted-foreground mb-1.5" />
                <span className="text-sm text-muted-foreground">Clique para adicionar fotos</span>
                <span className="text-xs text-muted-foreground/60 mt-0.5">PNG, JPG ou WebP · máx. 10MB por foto</span>
              </>
            )}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} disabled={uploading} />
          </label>

          {imageUrls.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative size-20 group">
                  <div className="size-20 rounded-lg overflow-hidden border border-border bg-neutral-50">
                    <Image src={url} alt="" fill unoptimized className="object-cover" sizes="80px" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageUrls((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -right-1.5 size-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="size-3" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-0.5 left-0.5 text-[10px] bg-black/60 text-white px-1 rounded">Capa</span>
                  )}
                </div>
              ))}

              <label className="size-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-neutral-50 transition-colors">
                <ImageIcon className="size-5 text-muted-foreground" />
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} disabled={uploading} />
              </label>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" className="flex-1" disabled={loading || uploading}>
          {(loading || uploading) && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isEditing ? "Salvar alterações" : "Criar produto"}
        </Button>
      </div>
    </form>
  );
}
