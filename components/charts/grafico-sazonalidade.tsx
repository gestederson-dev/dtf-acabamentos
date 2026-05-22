"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { formatarMoeda, formatarPercent } from "@/lib/pricing";

interface MesData { mes: string; faturamento: number; lucro: number; margem: number }
interface Props { dados: MesData[] }

function TooltipCustom({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-3 shadow-sm text-sm space-y-1">
      <p className="font-semibold text-zinc-700">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="tabular-nums font-medium">
            {p.name === "Margem" ? formatarPercent(p.value) : formatarMoeda(p.value)}
          </span>
        </p>
      ))}
    </div>
  );
}

export function GraficoSazonalidade({ dados }: Props) {
  if (!dados.length) return <div className="flex items-center justify-center h-48 text-zinc-400 text-sm">Sem dados</div>;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={dados} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" vertical={false} />
        <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#71717A" }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="left" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#71717A" }} axisLine={false} tickLine={false} width={48} />
        <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 11, fill: "#71717A" }} axisLine={false} tickLine={false} width={40} />
        <Tooltip content={<TooltipCustom />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Line yAxisId="left" type="monotone" dataKey="faturamento" name="Faturamento" stroke="#18181B" strokeWidth={2} dot={false} />
        <Line yAxisId="left" type="monotone" dataKey="lucro" name="Lucro" stroke="#065F46" strokeWidth={2} dot={{ r: 3, fill: "#065F46" }} />
        <Line yAxisId="right" type="monotone" dataKey="margem" name="Margem" stroke="#D97706" strokeWidth={2} strokeDasharray="4 2" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
