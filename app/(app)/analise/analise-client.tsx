"use client";

import { useState } from "react";
import { GraficoSazonalidade } from "@/components/charts/grafico-sazonalidade";
import { GraficoPorProduto } from "@/components/charts/grafico-por-produto";
import {
  calcularPrecoPorPeca, calcularPrecoPorMetro,
  statusMargem, formatarMoeda, formatarPercent,
} from "@/lib/pricing";
import type { Configuracao, Produto } from "@prisma/client";

interface MesData     { mes: string; faturamento: number; lucro: number; margem: number }
interface ClienteData { nome: string; faturamento: number; lucro: number; vendas: number; margem: number }
interface ProdutoData { label: string; metros: number; faturamento: number; vendas: number }
interface VendedorData { nome: string; faturamento: number; lucro: number; comissao: number; vendas: number; margem: number; ticketMedio: number }

interface Props {
  sazonalidade: MesData[];
  clientes: ClienteData[];
  porProduto: ProdutoData[];
  vendedores: VendedorData[];
  config: Configuracao | null;
  produtos: Produto[];
  isSocio: boolean;
}

const TABS_SOCIO    = ["Sensibilidade", "Sazonalidade", "Por cliente", "Por produto", "Por vendedor"] as const;
const TABS_VENDEDOR = ["Sazonalidade", "Por cliente", "Por produto"] as const;
type TabSocio    = typeof TABS_SOCIO[number];
type TabVendedor = typeof TABS_VENDEDOR[number];
type Tab = TabSocio | TabVendedor;

export function AnaliseClient({ sazonalidade, clientes, porProduto, vendedores, config, produtos, isSocio }: Props) {
  const tabs = isSocio ? TABS_SOCIO : TABS_VENDEDOR;
  const [tab, setTab] = useState<Tab>(isSocio ? "Sensibilidade" : "Sazonalidade");

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 border-b border-[#E4E4E7] dark:border-[#27272A]">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as Tab)}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t
                ? "text-[#232021] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#232021] dark:text-white dark:after:bg-white"
                : "text-[#71717A] hover:text-[#232021] dark:hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Sensibilidade"  && <TabSensibilidade config={config} produtos={produtos} />}
      {tab === "Sazonalidade"   && <TabSazonalidade dados={sazonalidade} isSocio={isSocio} />}
      {tab === "Por cliente"    && <TabPorCliente clientes={clientes} />}
      {tab === "Por produto"    && <TabPorProduto dados={porProduto} />}
      {tab === "Por vendedor"   && <TabPorVendedor vendedores={vendedores} />}
    </div>
  );
}

/* ── Tab 1: Sensibilidade ── */
function TabSensibilidade({ config, produtos }: { config: Configuracao | null; produtos: Produto[] }) {
  const [lucro, setLucro]       = useState(Math.round((config?.percentLucro ?? 0.4) * 100));
  const [comissao]              = useState(Math.round((config?.percentComissao ?? 0.06) * 100));
  const [imposto]               = useState(Math.round((config?.percentImposto ?? 0.08) * 100));
  const [custoEmb, setCustoEmb] = useState(config?.custoEmbalagem ?? 10);
  const [pecasCx]               = useState(config?.pecasPorCaixa ?? 20);

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
    <div className="space-y-4">
      <div className="rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
        <div className="border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272A]">
          <p className="text-sm font-semibold text-[#232021] dark:text-white">Sliders de sensibilidade</p>
        </div>
        <div className="space-y-5 px-5 py-4">
          <SliderField
            label={`Lucro alvo: ${lucro}%`}
            value={lucro} min={5} max={70} step={1}
            onChange={setLucro}
            configValue={Math.round((config?.percentLucro ?? 0.4) * 100)}
          />
          <SliderField
            label={`Custo da caixa: ${formatarMoeda(custoEmb)}`}
            value={custoEmb} min={5} max={30} step={0.5}
            onChange={setCustoEmb}
            configValue={config?.custoEmbalagem ?? 10}
          />
          <p className="text-xs text-[#A1A1AA]">
            Comissão: {comissao}% · Imposto: {imposto}% · Total sobre venda: {lucro + comissao + imposto}%
            {!divisorOk && <span className="ml-2 text-[#B91C1C]">— Percentuais somam ≥100%</span>}
          </p>
        </div>
      </div>

      {divisorOk && (
        <div className="overflow-hidden rounded-md border border-[#E4E4E7] dark:border-[#27272A]">
          <div className="border-b border-[#E4E4E7] px-5 py-4 bg-[#FAFAFA] dark:border-[#27272A] dark:bg-[#18181B]">
            <p className="text-sm font-semibold text-[#232021] dark:text-white">Preços resultantes (R$/metro)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#E4E4E7] dark:border-[#27272A]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#71717A]">Produto</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#71717A]">c/ embalagem</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#71717A]">s/ embalagem</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#71717A]">Semáforo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F4F5] dark:divide-[#27272A]">
                {produtos.map((p) => {
                  const r = calcRow(p);
                  const sm = r ? statusMargem(pL) : null;
                  return (
                    <tr key={p.id} className="hover:bg-[#FAFAFA] dark:hover:bg-[#27272A]/40">
                      <td className="px-4 py-3 text-[#232021] dark:text-white">{p.nome}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums font-medium text-[#232021] dark:text-white">{r ? formatarMoeda(r.pvmCom) : "—"}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-[#71717A]">{r ? formatarMoeda(r.pvmSem) : "—"}</td>
                      <td className="px-4 py-3">
                        {sm && <span className="text-xs font-medium" style={{ color: sm.cor }}>{sm.emoji} {sm.label}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SliderField({ label, value, min, max, step, onChange, configValue }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void;
  configValue?: number;
}) {
  const changed = configValue !== undefined && configValue !== value;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#232021] dark:text-white">{label}</label>
        {changed && (
          <span className="text-xs text-[#A1A1AA]">
            config atual: <span className="font-medium text-[#71717A]">{configValue}%</span>
          </span>
        )}
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer accent-[#232021] dark:accent-white"
      />
      <div className="flex justify-between text-xs text-[#A1A1AA]">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

/* ── Tab 2: Sazonalidade ── */
function TabSazonalidade({ dados, isSocio }: { dados: MesData[]; isSocio: boolean }) {
  const totalFat    = dados.reduce((s, d) => s + d.faturamento, 0);
  const totalLucro  = dados.reduce((s, d) => s + d.lucro, 0);
  const margemMedia = totalFat > 0 ? totalLucro / totalFat : 0;
  const melhorMes   = [...dados].sort((a, b) => b.lucro - a.lucro)[0];
  const piorMes     = [...dados].filter((d) => d.faturamento > 0).sort((a, b) => a.margem - b.margem)[0];
  const lucroLabel  = isSocio ? "Lucro 12m" : "Comissão 12m";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <SummaryCard label="Faturamento 12m" value={formatarMoeda(totalFat)} />
        <SummaryCard label={lucroLabel} value={formatarMoeda(totalLucro)} accent />
        {isSocio && <SummaryCard label="Margem média" value={formatarPercent(margemMedia)} accent={margemMedia >= 0.35} warning={margemMedia < 0.35} />}
        {melhorMes && <SummaryCard label="Melhor mês" value={`${melhorMes.mes}`} sub={formatarMoeda(melhorMes.lucro)} />}
        {isSocio && piorMes && <SummaryCard label="Margem mais baixa" value={piorMes.mes} sub={formatarPercent(piorMes.margem)} />}
      </div>
      <div className="rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
        <div className="border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272A]">
          <p className="text-sm font-semibold text-[#232021] dark:text-white">
            {isSocio ? "Faturamento · Lucro · Margem — 12 meses" : "Faturamento · Comissão — 12 meses"}
          </p>
        </div>
        <div className="p-5">
          <GraficoSazonalidade dados={dados} />
        </div>
      </div>
    </div>
  );
}

/* ── Tab 3: Por cliente ── */
function TabPorCliente({ clientes }: { clientes: ClienteData[] }) {
  if (!clientes.length) return (
    <div className="rounded-md border border-dashed border-[#E4E4E7] py-16 text-center dark:border-[#27272A]">
      <p className="text-sm text-[#71717A]">Nenhuma venda com cliente cadastrado ainda.</p>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-md border border-[#E4E4E7] dark:border-[#27272A]">
      <div className="border-b border-[#E4E4E7] px-5 py-4 bg-[#FAFAFA] dark:border-[#27272A] dark:bg-[#18181B]">
        <p className="text-sm font-semibold text-[#232021] dark:text-white">Top {clientes.length} clientes por faturamento</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-[#E4E4E7] dark:border-[#27272A]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#71717A]">Cliente</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#71717A]">Faturamento</th>
              <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#71717A] sm:table-cell">Lucro</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#71717A]">Margem</th>
              <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#71717A] md:table-cell">Vendas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F5] dark:divide-[#27272A]">
            {clientes.map((c, i) => {
              const sm = statusMargem(c.margem);
              return (
                <tr key={i} className="hover:bg-[#FAFAFA] dark:hover:bg-[#27272A]/40">
                  <td className="px-4 py-3 font-medium text-[#232021] dark:text-white">{c.nome}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#232021] dark:text-white">{formatarMoeda(c.faturamento)}</td>
                  <td className="hidden px-4 py-3 text-right font-mono tabular-nums text-[#047857] sm:table-cell">{formatarMoeda(c.lucro)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-medium tabular-nums" style={{ color: sm.cor }}>
                      {formatarPercent(c.margem)}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-right tabular-nums text-[#71717A] md:table-cell">{c.vendas}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Tab 4: Por produto ── */
function TabPorProduto({ dados }: { dados: ProdutoData[] }) {
  const totalMetros = dados.reduce((s, d) => s + d.metros, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {dados.map((d) => (
          <SummaryCard
            key={d.label}
            label={d.label}
            value={`${d.metros.toFixed(1)} m`}
            sub={`${totalMetros > 0 ? formatarPercent(d.metros / totalMetros) : "0%"} · ${d.vendas} venda${d.vendas !== 1 ? "s" : ""}`}
          />
        ))}
      </div>

      <div className="rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
        <div className="border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272A]">
          <p className="text-sm font-semibold text-[#232021] dark:text-white">Metros vendidos por variação</p>
        </div>
        <div className="p-5">
          <GraficoPorProduto dados={dados} />
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-[#E4E4E7] dark:border-[#27272A]">
        <div className="border-b border-[#E4E4E7] px-5 py-4 bg-[#FAFAFA] dark:border-[#27272A] dark:bg-[#18181B]">
          <p className="text-sm font-semibold text-[#232021] dark:text-white">Faturamento por variação</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#E4E4E7] dark:border-[#27272A]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#71717A]">Produto</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#71717A]">Metros</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#71717A]">Faturamento</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#71717A]">Vendas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F4F5] dark:divide-[#27272A]">
              {dados.map((d) => (
                <tr key={d.label} className="hover:bg-[#FAFAFA] dark:hover:bg-[#27272A]/40">
                  <td className="px-4 py-3 font-medium text-[#232021] dark:text-white">{d.label}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#71717A]">{d.metros.toFixed(1)} m</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[#232021] dark:text-white">{formatarMoeda(d.faturamento)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-[#71717A]">{d.vendas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Tab 5: Por vendedor ── */
function TabPorVendedor({ vendedores }: { vendedores: VendedorData[] }) {
  if (!vendedores.length) return (
    <div className="rounded-md border border-dashed border-[#E4E4E7] py-16 text-center dark:border-[#27272A]">
      <p className="text-sm text-[#71717A]">Nenhum dado de vendedor ainda.</p>
    </div>
  );

  const totalFat = vendedores.reduce((s, v) => s + v.faturamento, 0);
  const totalCom = vendedores.reduce((s, v) => s + v.comissao, 0);

  return (
    <div className="space-y-4">
      {/* Cards resumo */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <SummaryCard label="Vendedores ativos" value={String(vendedores.length)} />
        <SummaryCard label="Faturamento total" value={formatarMoeda(totalFat)} />
        <SummaryCard label="Comissão total" value={formatarMoeda(totalCom)} accent />
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-md border border-[#E4E4E7] dark:border-[#27272A]">
        <div className="border-b border-[#E4E4E7] bg-[#FAFAFA] px-5 py-4 dark:border-[#27272A] dark:bg-[#18181B]">
          <p className="text-sm font-semibold text-[#232021] dark:text-white">Desempenho por vendedor</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#E4E4E7] dark:border-[#27272A]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#71717A]">Vendedor</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#71717A]">Faturamento</th>
                <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#71717A] sm:table-cell">Lucro</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#71717A]">Comissão</th>
                <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#71717A] md:table-cell">Ticket médio</th>
                <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#71717A] lg:table-cell">Margem</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#71717A]">Vendas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F4F5] dark:divide-[#27272A]">
              {vendedores.map((v, i) => {
                const sm = statusMargem(v.margem);
                const share = totalFat > 0 ? v.faturamento / totalFat : 0;
                return (
                  <tr key={i} className="hover:bg-[#FAFAFA] dark:hover:bg-[#27272A]/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#232021] dark:text-white">{v.nome}</div>
                      <div className="mt-0.5 h-1.5 w-full max-w-[120px] overflow-hidden rounded-full bg-[#F4F4F5] dark:bg-[#27272A]">
                        <div className="h-full rounded-full bg-[#232021] dark:bg-white" style={{ width: `${share * 100}%` }} />
                      </div>
                      <div className="mt-0.5 text-[10px] text-[#A1A1AA]">{formatarPercent(share)} do total</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#232021] dark:text-white">{formatarMoeda(v.faturamento)}</td>
                    <td className="hidden px-4 py-3 text-right font-mono tabular-nums text-[#047857] sm:table-cell">{formatarMoeda(v.lucro)}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[#047857]">{formatarMoeda(v.comissao)}</td>
                    <td className="hidden px-4 py-3 text-right font-mono tabular-nums text-[#71717A] md:table-cell">{formatarMoeda(v.ticketMedio)}</td>
                    <td className="hidden px-4 py-3 text-right lg:table-cell">
                      <span className="text-xs font-medium tabular-nums" style={{ color: sm.cor }}>{formatarPercent(v.margem)}</span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-[#71717A]">{v.vendas}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, accent, warning }: {
  label: string; value: string; sub?: string; accent?: boolean; warning?: boolean;
}) {
  const valCls = accent
    ? "text-[#047857]"
    : warning
    ? "text-[#B45309]"
    : "text-[#232021] dark:text-white";

  return (
    <div className="relative overflow-hidden rounded-md border border-[#E4E4E7] bg-white p-4 dark:border-[#27272A] dark:bg-[#18181B]">
      <span className="absolute bottom-3 left-0 top-3 w-[3px] bg-[#232021] dark:bg-white" />
      <p className="text-[10px] font-medium uppercase tracking-wider text-[#71717A]">{label}</p>
      <p className={`mt-1.5 font-mono text-lg font-semibold tabular-nums ${valCls}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-[#A1A1AA]">{sub}</p>}
    </div>
  );
}
