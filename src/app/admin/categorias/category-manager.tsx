"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Pencil, Trash2, Check, X, Tag, ToggleLeft, ToggleRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  order: number;
  _count: { products: number; artisanCategories: number };
}

interface Props {
  initialCategories: Category[];
}

export function CategoryManager({ initialCategories }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  // New category form
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao criar."); return; }
      toast.success("Categoria criada!");
      setNewName("");
      setNewDesc("");
      setShowNew(false);
      router.refresh();
    } catch {
      toast.error("Erro ao criar categoria.");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDesc(cat.description ?? "");
  }

  async function handleSaveEdit(id: string) {
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/categorias/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), description: editDesc.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao salvar."); return; }
      setCategories((prev) => prev.map((c) => c.id === id ? { ...c, name: data.name, description: data.description } : c));
      setEditingId(null);
      toast.success("Categoria atualizada!");
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(null);
    }
  }

  async function handleToggleActive(cat: Category) {
    setSaving(cat.id);
    try {
      const res = await fetch(`/api/admin/categorias/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !cat.active }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro."); return; }
      setCategories((prev) => prev.map((c) => c.id === cat.id ? { ...c, active: data.active } : c));
    } catch {
      toast.error("Erro ao atualizar.");
    } finally {
      setSaving(null);
    }
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Excluir "${cat.name}"? Esta ação não pode ser desfeita.`)) return;
    setSaving(cat.id);
    try {
      const res = await fetch(`/api/admin/categorias/${cat.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao excluir."); return; }
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      toast.success("Categoria excluída.");
    } catch {
      toast.error("Erro ao excluir.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header action */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowNew((v) => !v)}
          className="bg-[#1e3a5f] hover:bg-[#163050] text-white"
        >
          <Plus className="size-4 mr-2" /> Nova categoria
        </Button>
      </div>

      {/* New category form */}
      {showNew && (
        <Card className="border-[#1e3a5f]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1e3a5f]">Nova categoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input
                placeholder="Ex: Cerâmica e Barro"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Input
                placeholder="Breve descrição da categoria"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={creating || !newName.trim()} className="bg-[#4a7c3f] hover:bg-[#3d6835] text-white">
                {creating && <Loader2 className="size-4 mr-2 animate-spin" />}
                Criar
              </Button>
              <Button variant="outline" onClick={() => { setShowNew(false); setNewName(""); setNewDesc(""); }}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories list */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-neutral-100">
            {categories.length === 0 && (
              <div className="py-12 text-center text-neutral-400 text-sm">
                Nenhuma categoria encontrada.
              </div>
            )}
            {categories.map((cat) => {
              const isEditing = editingId === cat.id;
              const isSaving = saving === cat.id;

              return (
                <div key={cat.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="size-8 rounded-lg bg-[#1e3a5f]/8 flex items-center justify-center shrink-0">
                    <Tag className="size-4 text-[#1e3a5f]" />
                  </div>

                  {isEditing ? (
                    <div className="flex-1 flex items-center gap-3">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8 text-sm"
                        autoFocus
                      />
                      <Input
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Descrição"
                        className="h-8 text-sm"
                      />
                      <button
                        onClick={() => handleSaveEdit(cat.id)}
                        disabled={isSaving}
                        className="text-[#4a7c3f] hover:text-[#3d6835] shrink-0"
                      >
                        {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-neutral-400 hover:text-neutral-600 shrink-0">
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${cat.active ? "text-neutral-900" : "text-neutral-400 line-through"}`}>
                          {cat.name}
                        </p>
                        {!cat.active && (
                          <span className="text-xs bg-neutral-100 text-neutral-400 px-1.5 py-0.5 rounded">Inativa</span>
                        )}
                      </div>
                      {cat.description && (
                        <p className="text-xs text-neutral-400 truncate">{cat.description}</p>
                      )}
                      <p className="text-xs text-neutral-300 mt-0.5">
                        {cat._count.products} produto(s) · {cat._count.artisanCategories} artesão(s)
                      </p>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleActive(cat)}
                        disabled={isSaving}
                        title={cat.active ? "Desativar" : "Ativar"}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                      >
                        {isSaving ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : cat.active ? (
                          <ToggleRight className="size-4 text-[#4a7c3f]" />
                        ) : (
                          <ToggleLeft className="size-4" />
                        )}
                      </button>
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-[#1e3a5f] transition-colors"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        disabled={isSaving || cat._count.products > 0}
                        title={cat._count.products > 0 ? "Possui produtos vinculados" : "Excluir"}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
