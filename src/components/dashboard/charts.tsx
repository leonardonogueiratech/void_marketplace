"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Shared tooltip ───────────────────────────────────────────────────────────

function CurrencyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#1e3a5f]/10 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="text-neutral-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name === "vendas" || p.name === "receita"
            ? `R$ ${Number(p.value).toFixed(2).replace(".", ",")}`
            : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Revenue area chart (last 30 days) ───────────────────────────────────────

interface DailyData {
  day: string;
  receita: number;
  pedidos: number;
}

export function RevenueChart({ data }: { data: DailyData[] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-neutral-400">
        Sem vendas nos últimos 30 dias.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="receitaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#aaa" }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "#aaa" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `R$${v}`}
          width={52}
        />
        <Tooltip content={<CurrencyTooltip />} />
        <Area
          type="monotone"
          dataKey="receita"
          name="receita"
          stroke="#1e3a5f"
          strokeWidth={2}
          fill="url(#receitaGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#1e3a5f" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Monthly bar chart ────────────────────────────────────────────────────────

interface MonthlyData {
  month: string;
  receita: number;
}

export function MonthlyBarChart({ data }: { data: MonthlyData[] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-neutral-400">
        Sem dados mensais disponíveis.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#aaa" }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "#aaa" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `R$${v}`}
          width={52}
        />
        <Tooltip content={<CurrencyTooltip />} />
        <Bar dataKey="receita" name="receita" fill="#4a7c3f" radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
