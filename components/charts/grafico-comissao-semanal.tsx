"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { formatarMoeda } from "@/lib/pricing";

interface SemanaData { semana: string; comissao: number }
interface Props { dados: SemanaData[] }

function TooltipCustom({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-[#E4E4E7] bg-white p-3 text-sm shadow-sm">
      <p className="font-semibold text-[#232021] mb-1">{label}</p>
      <p className="text-[#047857]">Comissão: <span className="tabular-nums font-medium">{formatarMoeda(payload[0].value)}</span></p>
    </div>
  );
}

export function GraficoComissaoSemanal({ dados }: Props) {
  if (dados.length === 0) return (
    <div className="flex items-center justify-center h-48 text-[#A1A1AA] text-sm">Sem dados para exibir</div>
  );

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={dados} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradComissao" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#047857" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#047857" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" vertical={false} />
        <XAxis dataKey="semana" tick={{ fontSize: 11, fill: "#71717A" }} axisLine={false} tickLine={false} />
        <YAxis
          tickFormatter={(v) => `R$${v.toFixed(0)}`}
          tick={{ fontSize: 11, fill: "#71717A" }}
          axisLine={false} tickLine={false} width={52}
        />
        <Tooltip content={<TooltipCustom />} />
        <Area
          type="monotone" dataKey="comissao" stroke="#047857" strokeWidth={2}
          fill="url(#gradComissao)" dot={{ fill: "#047857", r: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
