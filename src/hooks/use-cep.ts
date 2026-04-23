"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

interface CepResult {
  street: string;
  district: string;
  city: string;
  state: string;
}

export function useCep(onFill: (data: CepResult) => void) {
  const [loading, setLoading] = useState(false);
  const lastCep = useRef("");

  const lookup = useCallback(async (raw: string) => {
    const cep = raw.replace(/\D/g, "");
    if (cep.length !== 8 || cep === lastCep.current) return;
    lastCep.current = cep;

    setLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();

      if (data.erro) {
        toast.error("CEP não encontrado.");
        return;
      }

      onFill({
        street:   data.logradouro ?? "",
        district: data.bairro     ?? "",
        city:     data.localidade ?? "",
        state:    data.uf         ?? "",
      });
    } catch {
      toast.error("Erro ao buscar CEP.");
    } finally {
      setLoading(false);
    }
  }, [onFill]);

  // Formata visualmente: 00000-000
  function format(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
  }

  return { lookup, loading, format };
}
