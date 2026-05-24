import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + "…";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Comissão padrão (fallback) */
export const COMMISSION_RATE = 0.12;

/** Nomes de exibição dos planos */
export const PLAN_NAMES: Record<string, string> = {
  FREE:  "Inicial",
  BASIC: "Profissional",
  PRO:   "Ateliê",
};

/** Perfil do público-alvo por plano */
export const PLAN_PROFILES: Record<string, string> = {
  FREE:  "Artesão / Pessoa Física",
  BASIC: "MEI / Vendedor Ativo",
  PRO:   "Pequena Marca / Ateliê",
};

/** Comissão regular por plano (após período de lançamento) */
export const COMMISSION_BY_PLAN: Record<string, number> = {
  FREE:  0.12,   // 12%
  BASIC: 0.08,   // 8%
  PRO:   0.05,   // 5%
};

/** Comissão promocional de lançamento (primeiros 3 meses) */
export const COMMISSION_LAUNCH_BY_PLAN: Record<string, number> = {
  FREE:  0.10,   // 10%
  BASIC: 0.06,   // 6%
  PRO:   0.03,   // 3%
};

/** Taxa de processamento de pagamento (cobrada pelo gateway, igual para todos) */
export const PAYMENT_PROCESSING_FEE = 0.0299;  // 2,99%
export const PAYMENT_PROCESSING_FIXED = 0.39;  // R$ 0,39 por transação

/** Mensalidade regular por plano */
export const SUBSCRIPTION_PRICES: Record<string, number> = {
  FREE:   29.90,  // Inicial
  BASIC:  69.90,  // Profissional
  PRO:   139.90,  // Ateliê
};

/** Mensalidade promocional de lançamento (50% off por 3 meses) */
export const SUBSCRIPTION_LAUNCH_PRICES: Record<string, number> = {
  FREE:  14.90,
  BASIC: 34.90,
  PRO:   69.90,
};

/** Limite de produtos ativos por plano */
export const SUBSCRIPTION_LIMITS: Record<string, number> = {
  FREE:  5,
  BASIC: 20,
  PRO:   999,
};

/** Limite de fotos por produto por plano */
export const PHOTO_LIMITS: Record<string, number> = {
  FREE:  4,
  BASIC: 6,
  PRO:   10,
};

export const HIGHLIGHT_PRICE = 29.9;
