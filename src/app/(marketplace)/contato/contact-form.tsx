"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Loader2, CheckCircle2 } from "lucide-react";

const SUBJECTS = [
  "Dúvida geral",
  "Problema com pedido",
  "Problema com pagamento",
  "Quero ser artesão",
  "Parceria / imprensa",
  "Sugestão",
  "Outro",
];

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao enviar."); return; }
      setSent(true);
    } catch {
      toast.error("Erro ao enviar mensagem.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="bg-white rounded-2xl border border-[#1e3a5f]/10 p-10 text-center">
        <div className="size-14 rounded-full bg-[#27ae60]/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="size-7 text-[#27ae60]" />
        </div>
        <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">Mensagem enviada!</h3>
        <p className="text-sm text-neutral-500 mb-6">
          Recebemos sua mensagem e responderemos em até 1 dia útil para <strong>{form.email}</strong>.
        </p>
        <button
          onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
          className="text-xs font-medium text-[#1e3a5f] underline underline-offset-2 hover:text-[#1e3a5f]/70 transition-colors"
        >
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#1e3a5f]/10 p-7 space-y-5">
      <h2 className="text-lg font-bold text-[#1e3a5f]">Envie uma mensagem</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Nome *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Seu nome completo"
            className="w-full rounded-xl border border-[#1e3a5f]/15 px-3.5 py-2.5 text-sm text-[#1e3a5f] placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/40 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1.5">E-mail *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="seu@email.com"
            className="w-full rounded-xl border border-[#1e3a5f]/15 px-3.5 py-2.5 text-sm text-[#1e3a5f] placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/40 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Assunto *</label>
        <select
          value={form.subject}
          onChange={(e) => set("subject", e.target.value)}
          className="w-full rounded-xl border border-[#1e3a5f]/15 px-3.5 py-2.5 text-sm text-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/40 transition-all bg-white"
        >
          <option value="">Selecione um assunto</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Mensagem *</label>
        <textarea
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Descreva sua dúvida ou mensagem com o máximo de detalhes..."
          rows={5}
          className="w-full rounded-xl border border-[#1e3a5f]/15 px-3.5 py-2.5 text-sm text-[#1e3a5f] placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/40 transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#1e3a5f] text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-[#1e3a5f]/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {loading ? "Enviando..." : "Enviar mensagem"}
      </button>
    </form>
  );
}
