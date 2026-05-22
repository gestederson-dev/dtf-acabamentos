"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraficoSazonalidade } from "@/components/charts/grafico-sazonalidade";
import { GraficoPorProduto } from "@/components/charts/grafico-por-produto";
import {
  calcularPrecoPorPeca, calcularPrecoPorMetro,
  statusMargem, formatarMoeda, formatarPercent,
} from "@/lib/pricing";
import type { Configuracao, Produto } from "@prisma/client";

interface MesData { mes: string; faturamento: number; lucro: number; margem: number }
interface ClienteData { nome: string; faturamento: number; lucro: number; vendas: number; margem: number }
interface ProdutoData { label: string; metros: number; faturamento: number; vendas: number }

interface Props {
  sazonalidade: MesData[];
  clientes: ClienteData[];
  porProduto: ProdutoData[];
  config: Configuracao | null;
  produtos: Produto[];
}

const TABS = ["Sensibilidade", "Sazonalidade", "Por cliente", "Por produto"] as const;
type Tab = typeof TABS[number];

export function AnaliseClient({ sazonalidade, clientes, porProduto, config, produtos }: Props) {
  const [tab, setTab] = useState<Tab>("Sensibilidade");

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-1 bg-zinc-100 rounded-lg p-1 w-fit flex-wrap">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Sensibilidade" && <TabSensibilidade config={config} produtos={produtos} />}
      {tab === "Sazonalidade" && <TabSazonalidade dados={sazonalidade} />}
      {tab === "Por cliente" && <TabPorCliente clientes={clientes} />}
      {tab === "Por produto" && <TabPorProduto dados={porProduto} />}
    </div>
  );
}

/* ── Tab 1: Sensibilidade ── */
function TabSensibilidade({ config, produtos }: { config: Configuracao | null; produtos: Produto[] }) {
  const [lucro, setLucro] = useState(Math.round((config?.percentLucro ?? 0.4) * 100));
  const [comissao] = useState(Math.round((config?.percentComissao ?? 0.06) * 100));
  const [imposto] = useState(Math.round((config?.percentImposto ?? 0.08) * 100));
  const [custoEmb, setCustoEmb] = useState(config?.custoEmbalagem ?? 10);
  const [pecasCx] = useState(config?.pecasPorCaixa ?? 20);

  const pL = lucro / 100;
  const pC = comissao / 100;
  const pI = imposto / 100;
  const embPeca = custoEmb / pecasCx;
  const divisorOk = pL + pC + pI < 1;

  function calcRow(produto: Produto) {
    if (!divisorOk) return null;
    const pvComEmb = calcularPrecoPorPeca(produto.custoUnitario, embPeca, pL, pC, pI);
    const pvSemEmb = calcularPrecoPorPeca(produto.custoUnitario, 0, pL, pC, pI);
    return {
      pvmCom: calcularPrecoPorMetro(pvComEmb),
      pvmSem: calcularPrecoPorMetro(pvSemEmb),
    };
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Sliders de sensibilidade</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <SliderField
            label={`Lucro alvo: ${lucro}%`}
            value={lucro} min={5} max={70} step={1}
            onChange={setLucro}
          />
          <SliderField
            label={`Custo da caixa: ${formatarMoeda(custoEmb)}`}
            value={custoEmb} min={5} max={30} step={0.5}
            onChange={setCustoEmb}
          />

          <div className="text-xs text-zinc-400 space-y-0.5">
            <p>Comissão: {comissao}% · Imposto: {imposto}% · Total sobre venda: {lucro + comissao + imposto}%</p>
            {!divisorOk && <p className="text-red-600">⚠️ Percentuais somam ≥100%</p>}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de preços resultante */}
      {divisorOk && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Preços resultantes (R$/metro)</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left py-2 px-3 font-medium text-zinc-600">Produto</th>
                  <th className="text-right py-2 px-3 font-medium text-zinc-600 tabular-nums">c/ embalagem</th>
                  <th className="text-right py-2 px-3 font-medium text-zinc-600 tabular-nums">s/ embalagem</th>
                  <th className="text-left py-2 px-3 font-medium text-zinc-600">Semáforo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {produtos.map((p) => {
                  const r = calcRow(p);
                  const sm = r ? statusMargem(pL) : null;
                  return (
                    <tr key={p.id}>
                      <td className="py-2.5 px-3">{p.nome}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-medium">{r ? formatarMoeda(r.pvmCom) : "—"}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{r ? formatarMoeda(r.pvmSem) : "—"}</td>
                      <td className="py-2.5 px-3">
                        {sm && <span className="text-xs font-medium" style={{ color: sm.cor }}>{sm.emoji} {sm.label}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SliderField({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-zinc-700">{label}</label>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-zinc-200 rounded-full appearance-none cursor-pointer accent-zinc-900"
      />
      <div className="flex justify-between text-xs text-zinc-400">
        <span>{min}{typeof value === "number" && value > 5 ? "%" : ""}</span>
        <span>{max}{typeof value === "number" && value > 5 ? "%" : ""}</span>
      </div>
    </div>
  );
}

/* ── Tab 2: Sazonalidade ── */
function TabSazonalidade({ dados }: { dados: MesData[] }) {
  const totalFat = dados.reduce((s, d) => s + d.faturamento, 0);
  const totalLucro = dados.reduce((s, d) => s + d.lucro, 0);
  const margemMedia = totalFat > 0 ? totalLucro / totalFat : 0;
  const melhorMes = [...dados].sort((a, b) => b.lucro - a.lucro)[0];
  const piorMes = [...dados].filter((d) => d.faturamento > 0).sort((a, b) => a.margem - b.margem)[0];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <SummaryCard label="Faturamento 12m" value={formatarMoeda(totalFat)} />
        <SummaryCard label="Lucro 12m" value={formatarMoeda(totalLucro)} green />
        <SummaryCard label="Margem média" value={formatarPercent(margemMedia)} green={margemMedia >= 0.35} yellow={margemMedia < 0.35} />
        {melhorMes && <SummaryCard label="Melhor mês" value={`${melhorMes.mes} — ${formatarMoeda(melhorMes.lucro)}`} />}
        {piorMes && <SummaryCard label="Margem mais baixa" value={`${piorMes.mes} — ${formatarPercent(piorMes.margem)}`} />}
      </div>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Faturamento · Lucro · Margem — 12 meses</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <GraficoSazonalidade dados={dados} />
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Tab 3: Por cliente ── */
function TabPorCliente({ clientes }: { clientes: ClienteData[] }) {
  if (!clientes.length) return (
    <div className="text-center py-16 text-zinc-400 text-sm border border-dashed border-zinc-200 rounded-lg">
      Nenhuma venda com cliente cadastrado ainda.
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Top {clientes.length} clientes por faturamento</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="text-left py-2 px-3 font-medium text-zinc-600">Cliente</th>
              <th className="text-right py-2 px-3 font-medium text-zinc-600 tabular-nums">Faturamento</th>
              <th className="text-right py-2 px-3 font-medium text-zinc-600 tabular-nums hidden sm:table-cell">Lucro</th>
              <th className="text-right py-2 px-3 font-medium text-zinc-600 tabular-nums">Margem</th>
              <th className="text-right py-2 px-3 font-medium text-zinc-600 tabular-nums hidden md:table-cell">Vendas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {clientes.map((c, i) => {
              const sm = statusMargem(c.margem);
              return (
                <tr key={i} className="hover:bg-zinc-50">
                  <td className="py-2.5 px-3 font-medium">{c.nome}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{formatarMoeda(c.faturamento)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-[#065F46] hidden sm:table-cell">{formatarMoeda(c.lucro)}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-xs font-medium tabular-nums" style={{ color: sm.cor }}>
                      {formatarPercent(c.margem)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-zinc-500 hidden md:table-cell">{c.vendas}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

/* ── Tab 4: Por produto ── */
function TabPorProduto({ dados }: { dados: ProdutoData[] }) {
  const totalMetros = dados.reduce((s, d) => s + d.metros, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {dados.map((d) => (
          <SummaryCard
            key={d.label}
            label={d.label}
            value={`${d.metros.toFixed(1)} m`}
            sub={`${totalMetros > 0 ? formatarPercent(d.metros / totalMetros) : "0%"} do total · ${d.vendas} venda${d.vendas !== 1 ? "s" : ""}`}
          />
        ))}
      </div>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Metros vendidos por variação</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <GraficoPorProduto dados={dados} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Faturamento por variação</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="text-left py-2 px-3 font-medium text-zinc-600">Produto</th>
                <th className="text-right py-2 px-3 font-medium text-zinc-600 tabular-nums">Metros</th>
                <th className="text-right py-2 px-3 font-medium text-zinc-600 tabular-nums">Faturamento</th>
                <th className="text-right py-2 px-3 font-medium text-zinc-600 tabular-nums">Vendas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {dados.map((d) => (
                <tr key={d.label} className="hover:bg-zinc-50">
                  <td className="py-2.5 px-3 font-medium">{d.label}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{d.metros.toFixed(1)} m</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{formatarMoeda(d.faturamento)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-zinc-500">{d.vendas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value, sub, green, yellow }: {
  label: string; value: string; sub?: string; green?: boolean; yellow?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4 px-4">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</p>
        <p className={`text-lg font-bold tabular-nums mt-1 ${green ? "text-[#065F46]" : yellow ? "text-[#D97706]" : "text-zinc-900"}`}>{value}</p>
        {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}
