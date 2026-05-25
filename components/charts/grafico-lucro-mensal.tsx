"use client";

import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { formatarMoeda, formatarPercent } from "@/lib/pricing";

interface MesData {
  mes: string;
  faturamento: number;
  lucro: number;
  margem: number;
}

type Metrica = "lucro" | "faturamento";

function TooltipCustom({ active, payload, label, metrica }: {
  active?: boolean;
  payload?: Array<{ payload: MesData }>;
  label?: string;
  metrica: Metrica;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-[#E4E4E7] bg-white p-3 text-sm shadow-md dark:border-[#27272A] dark:bg-[#18181B]">
      <p className="mb-1.5 font-semibold text-[#232021] dark:text-white">{label}</p>
      {metrica === "lucro" ? (
        <>
          <p className="text-[#047857]">Lucro: <span className="tabular-nums font-medium">{formatarMoeda(d.lucro)}</span></p>
          <p className="mt-0.5 text-[#71717A]">Margem: <span className="tabular-nums">{formatarPercent(d.margem)}</span></p>
          <p className="mt-0.5 text-[#71717A]">Fat.: <span className="tabular-nums">{formatarMoeda(d.faturamento)}</span></p>
        </>
      ) : (
        <>
          <p className="text-[#232021] dark:text-white">Fat.: <span className="tabular-nums font-medium">{formatarMoeda(d.faturamento)}</span></p>
          <p className="mt-0.5 text-[#047857]">Lucro: <span className="tabular-nums">{formatarMoeda(d.lucro)}</span></p>
        </>
      )}
    </div>
  );
}

export function GraficoLucroMensal({ dados }: { dados: MesData[] }) {
  const [metrica, setMetrica] = useState<Metrica>("lucro");
  const [nMeses, setNMeses] = useState(Math.min(6, dados.length));

  if (dados.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-[#A1A1AA]">
        Sem dados para exibir
      </div>
    );
  }

  const slice = dados.slice(-nMeses);
  const isLucro = metrica === "lucro";
  const cor = isLucro ? "#22c55e" : "#6366f1";
  const gradId = isLucro ? "grad-lucro" : "grad-fat";

  const tabCls = (active: boolean) =>
    `rounded px-3 py-1.5 text-xs font-medium transition-colors ${
      active
        ? "bg-[#232021] text-white dark:bg-white dark:text-[#232021]"
        : "text-[#71717A] hover:text-[#232021] dark:hover:text-white"
    }`;

  const mesCls = (active: boolean) =>
    `rounded px-2.5 py-1 text-xs font-medium transition-colors ${
      active
        ? "bg-[#F4F4F5] text-[#232021] dark:bg-[#27272A] dark:text-white"
        : "text-[#A1A1AA] hover:text-[#232021] dark:hover:text-white"
    }`;

  return (
    <div>
      {/* Controles */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        {/* Toggle Lucro / Faturamento */}
        <div className="flex rounded-md border border-[#E4E4E7] p-0.5 dark:border-[#27272A]">
          <button type="button" onClick={() => setMetrica("lucro")} className={tabCls(isLucro)}>
            Lucro
          </button>
          <button type="button" onClick={() => setMetrica("faturamento")} className={tabCls(!isLucro)}>
            Faturamento
          </button>
        </div>
        {/* Seletor de meses */}
        <div className="flex gap-1">
          {[3, 6, 12].filter((n) => n <= dados.length).map((n) => (
            <button key={n} type="button" onClick={() => setNMeses(n)} className={mesCls(nMeses === n)}>
              {n}m
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico de área */}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={slice} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={cor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={cor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 6" stroke="#E4E4E7" className="dark:stroke-[#27272A]" vertical={false} />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#71717A" }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11, fill: "#71717A" }}
            axisLine={false} tickLine={false} width={48}
          />
          <Tooltip content={(p: any) => <TooltipCustom {...p} metrica={metrica} />} cursor={{ stroke: "#E4E4E7", strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey={isLucro ? "lucro" : "faturamento"}
            stroke={cor}
            strokeWidth={2.5}
            strokeLinecap="round"
            fill={`url(#${gradId})`}
            dot={(props: any) => {
              const { cx, cy, payload, key } = props;
              const dotColor = isLucro
                ? (payload.margem >= 0.35 ? "#22c55e" : payload.margem >= 0.25 ? "#eab308" : "#ef4444")
                : cor;
              return (
                <circle key={key} cx={cx} cy={cy} r={5}
                  className="fill-white dark:fill-[#18181B]"
                  stroke={dotColor} strokeWidth={2.5}
                />
              );
            }}
            activeDot={{ r: 6, fill: cor, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legenda de cores (só para lucro) */}
      {isLucro && (
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#A1A1AA]">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-[#22c55e]" />Verde ≥35%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-[#eab308]" />Amarelo 25–35%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-[#ef4444]" />Vermelho &lt;25%
          </span>
        </div>
      )}
    </div>
  );
}
