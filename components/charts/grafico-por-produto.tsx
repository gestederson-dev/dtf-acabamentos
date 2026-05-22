"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatarMoeda } from "@/lib/pricing";

interface ProdutoData { label: string; metros: number; faturamento: number; vendas: number }
interface Props { dados: ProdutoData[] }

function TooltipCustom({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-3 shadow-sm text-sm space-y-1">
      <p className="font-semibold text-zinc-700">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-zinc-600">
          {p.name}: <span className="tabular-nums font-medium">
            {p.name === "Faturamento" ? formatarMoeda(p.value) : `${p.value.toFixed(1)} m`}
          </span>
        </p>
      ))}
    </div>
  );
}

export function GraficoPorProduto({ dados }: Props) {
  if (!dados.length) return <div className="flex items-center justify-center h-48 text-zinc-400 text-sm">Sem dados</div>;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={dados} layout="vertical" margin={{ top: 4, right: 16, left: 60, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "#71717A" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}m`} />
        <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: "#71717A" }} axisLine={false} tickLine={false} width={58} />
        <Tooltip content={<TooltipCustom />} />
        <Bar dataKey="metros" name="Metros" fill="#065F46" radius={[0, 3, 3, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
