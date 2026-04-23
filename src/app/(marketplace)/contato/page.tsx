import { ContactForm } from "./contact-form";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f7f3ed]">
      {/* Hero */}
      <section className="bg-[#1e3a5f] py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Fale com a gente
          </h1>
          <p className="text-white/70 text-lg">
            Tem uma dúvida, sugestão ou quer ser parceiro? Estamos aqui para ajudar.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-5 gap-10 items-start">
          {/* Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#1e3a5f] mb-4">Informações</h2>
              <div className="space-y-4">
                {[
                  {
                    icon: Mail,
                    label: "E-mail",
                    value: "contato@feitodegente.com.br",
                  },
                  {
                    icon: Phone,
                    label: "WhatsApp",
                    value: "(11) 99999-0000",
                  },
                  {
                    icon: MapPin,
                    label: "Localização",
                    value: "Brasil — atendimento online",
                  },
                  {
                    icon: Clock,
                    label: "Horário",
                    value: "Seg–Sex, 9h às 18h",
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="size-9 rounded-xl bg-[#1e3a5f]/8 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="size-4 text-[#1e3a5f]" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 font-medium">{label}</p>
                      <p className="text-sm text-[#1e3a5f] font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#e07b2a]/8 border border-[#e07b2a]/15 p-5">
              <p className="text-sm font-semibold text-[#e07b2a] mb-1">Quer vender no Feito de Gente?</p>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Cadastre-se como artesão e alcance compradores em todo o Brasil. É rápido e fácil.
              </p>
              <a
                href="/seja-artesao"
                className="inline-block mt-3 text-xs font-semibold text-[#e07b2a] underline underline-offset-2 hover:text-[#c96a1e] transition-colors"
              >
                Saiba mais →
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
