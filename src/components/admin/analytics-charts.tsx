"use client";

import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { BarChart2 } from "lucide-react";

// ── Tooltip compartilhado ─────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, currency }: {
  active?: boolean; payload?: any[]; label?: string; currency?: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#071a33]/10 rounded-xl shadow-lg px-3 py-2 text-xs min-w-[120px]">
      {label && <p className="text-neutral-400 mb-1.5 font-medium">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-semibold" style={{ color: p.color || p.fill }}>
          {p.name}:{" "}
          {currency || ["GMV", "Receita"].includes(p.name)
            ? `R$ ${Number(p.value).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : Number(p.value).toLocaleString("pt-BR")}
        </p>
      ))}
    </div>
  );
}

function EmptyChart({ message = "Sem dados suficientes ainda." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-52 text-neutral-300 gap-2">
      <BarChart2 className="size-10" />
      <p className="text-xs text-neutral-400">{message}</p>
    </div>
  );
}

// ── GMV Diário (30 dias) ──────────────────────────────────────────────────────

export interface DailyData { day: string; gmv: number; orders: number }

export function DailyGmvChart({ data }: { data: DailyData[] }) {
  if (!data.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7c9f61" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#7c9f61" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#17a2b8" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#17a2b8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#bbb" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis yAxisId="gmv" tick={{ fontSize: 10, fill: "#bbb" }} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} width={56} />
        <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 10, fill: "#bbb" }} tickLine={false} axisLine={false} width={28} />
        <Tooltip content={<ChartTooltip currency />} />
        <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
        <Area yAxisId="gmv" type="monotone" dataKey="gmv" name="GMV" stroke="#7c9f61" strokeWidth={2} fill="url(#gmvGrad)" dot={false} activeDot={{ r: 4, fill: "#7c9f61" }} />
        <Area yAxisId="orders" type="monotone" dataKey="orders" name="Pedidos" stroke="#17a2b8" strokeWidth={1.5} fill="url(#ordersGrad)" dot={false} activeDot={{ r: 3, fill: "#17a2b8" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── GMV Mensal (12 meses) ─────────────────────────────────────────────────────

export interface MonthlyData { month: string; gmv: number; orders: number }

export function MonthlyGmvChart({ data }: { data: MonthlyData[] }) {
  if (!data.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#bbb" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#bbb" }} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} width={56} />
        <Tooltip content={<ChartTooltip currency />} />
        <Bar dataKey="gmv" name="GMV" fill="#7c9f61" radius={[5, 5, 0, 0]} maxBarSize={44} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Pedidos por Status (Donut) ────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  PAYMENT_PENDING: "#c1652e",
  PAID: "#17a2b8",
  PROCESSING: "#071a33",
  SHIPPED: "#6366f1",
  DELIVERED: "#7c9f61",
  CANCELLED: "#ef4444",
  REFUNDED: "#94a3b8",
};

export interface StatusData { status: string; label: string; count: number }

export function OrderStatusChart({ data }: { data: StatusData[] }) {
  const filtered = data
    .filter(d => d.count > 0)
    .map(d => ({ ...d, fill: STATUS_COLORS[d.status] ?? "#ccc" }));
  if (!filtered.length) return <EmptyChart message="Nenhum pedido ainda." />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={filtered}
          cx="50%"
          cy="46%"
          innerRadius={60}
          outerRadius={88}
          dataKey="count"
          nameKey="label"
          paddingAngle={2}
        />
        <Tooltip formatter={(v, name) => [v, name]} />
        <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: "10px" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Crescimento de Usuários ───────────────────────────────────────────────────

export interface UserGrowthData { month: string; compradores: number; artesaos: number }

export function UserGrowthChart({ data }: { data: UserGrowthData[] }) {
  if (!data.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#bbb" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#bbb" }} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} />
        <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
        <Bar dataKey="compradores" name="Compradores" fill="#071a33" radius={[4, 4, 0, 0]} maxBarSize={22} />
        <Bar dataKey="artesaos" name="Artesãos" fill="#7c9f61" radius={[4, 4, 0, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Distribuição de Planos ────────────────────────────────────────────────────

const PLAN_COLORS: Record<string, string> = {
  FREE: "#94a3b8",
  BASIC: "#7c9f61",
  PRO: "#c1652e",
};

const PLAN_LABELS: Record<string, string> = {
  FREE: "Inicial",
  BASIC: "Profissional",
  PRO: "Ateliê",
};

export interface PlanData { plan: string; count: number }

export function PlanChart({ data }: { data: PlanData[] }) {
  const formatted = data.map(d => ({
    ...d,
    label: PLAN_LABELS[d.plan] ?? d.plan,
    fill: PLAN_COLORS[d.plan] ?? "#ccc",
  }));
  if (!formatted.length) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={formatted} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
        <XAxis type="number" tick={{ fontSize: 10, fill: "#bbb" }} tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "#555" }} tickLine={false} axisLine={false} width={56} />
        <Tooltip formatter={(v) => [v, "Artesãos"]} />
        <Bar dataKey="count" name="Artesãos" radius={[0, 5, 5, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
