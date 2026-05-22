"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { formatarMoeda } from "@/lib/pricing";

interface MesData {
  mes: string;
  faturamento: number;
  lucro: number;
  margem: number;
}

interface Props { dados: MesData[] }

function TooltipCustom({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-3 shadow-sm text-sm">
      <p className="font-semibold text-zinc-700 mb-1">{label}</p>
      <p className="text-[#065F46]">Lucro: <span className="tabular-nums font-medium">{formatarMoeda(d.value)}</span></p>
      {payload[1] && (
        <p className="text-zinc-500">Fat: <span className="tabular-nums">{formatarMoeda(payload[1].value)}</span></p>
      )}
    </div>
  );
}

export function GraficoLucroMensal({ dados }: Props) {
  if (dados.length === 0) return (
    <div className="flex items-center justify-center h-48 text-zinc-400 text-sm">Sem dados para exibir</div>
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={dados} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" vertical={false} />
        <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#71717A" }} axisLine={false} tickLine={false} />
        <YAxis
          tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11, fill: "#71717A" }}
          axisLine={false} tickLine={false} width={48}
        />
        <Tooltip content={<TooltipCustom />} cursor={{ fill: "#F4F4F5" }} />
        <Bar dataKey="lucro" name="Lucro" radius={[3, 3, 0, 0]} maxBarSize={40}>
          {dados.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.margem >= 0.35 ? "#065F46" : entry.margem >= 0.25 ? "#D97706" : "#DC2626"}
            />
          ))}
        </Bar>
        <Bar dataKey="faturamento" name="Faturamento" fill="#E4E4E7" radius={[3, 3, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
