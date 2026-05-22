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
    <div className="rounded-md border border-[#E4E4E7] bg-white p-3 text-sm shadow-sm">
      <p className="mb-1 font-semibold text-[#232021]">{label}</p>
      <p className="text-[#047857]">Lucro: <span className="tabular-nums font-medium">{formatarMoeda(d.value)}</span></p>
      {payload[1] && (
        <p className="text-[#71717A]">Fat: <span className="tabular-nums">{formatarMoeda(payload[1].value)}</span></p>
      )}
    </div>
  );
}

export function GraficoLucroMensal({ dados }: Props) {
  if (dados.length === 0) return (
    <div className="flex items-center justify-center h-48 text-[#A1A1AA] text-sm">Sem dados para exibir</div>
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
              fill={entry.margem >= 0.35 ? "#047857" : entry.margem >= 0.25 ? "#D97706" : "#DC2626"}
            />
          ))}
        </Bar>
        <Bar dataKey="faturamento" name="Faturamento" fill="#E4E4E7" radius={[3, 3, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
