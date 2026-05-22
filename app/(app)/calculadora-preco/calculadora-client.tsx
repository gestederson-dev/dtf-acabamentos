"use client";

import { useState } from "react";
import {
  calcularPrecoPorPeca, calcularPrecoPorMetro, calcularAnatomiaVenda,
  statusMargem, formatarMoeda, formatarPercent,
} from "@/lib/pricing";
import type { Configuracao, Produto } from "@prisma/client";

interface Props {
  config: Configuracao | null;
  produtos: Produto[];
}

export function CalculadoraClient({ config, produtos }: Props) {
  const [custo21, setCusto21]   = useState(String(produtos.find((p) => p.larguraCm === 21)?.custoUnitario ?? 8));
  const [custo19, setCusto19]   = useState(String(produtos.find((p) => p.larguraCm === 19)?.custoUnitario ?? 7.24));
  const [custoEmb, setCustoEmb] = useState(String(config?.custoEmbalagem ?? 10));
  const [pecasCx, setPecasCx]   = useState(String(config?.pecasPorCaixa ?? 20));
  const [lucro, setLucro]       = useState(String(Math.round((config?.percentLucro ?? 0.4) * 100)));
  const [comissao, setComissao] = useState(String(Math.round((config?.percentComissao ?? 0.06) * 100)));
  const [imposto, setImposto]   = useState(String(Math.round((config?.percentImposto ?? 0.08) * 100)));

  const pLucro    = Number(lucro) / 100;
  const pComissao = Number(comissao) / 100;
  const pImposto  = Number(imposto) / 100;
  const nPecasCx  = Number(pecasCx) || 20;
  const nCustoEmb = Number(custoEmb) || 0;
  const embPorPeca = nCustoEmb / nPecasCx;

  const totalPct    = pLucro + pComissao + pImposto;
  const divisorValido = totalPct < 1;

  function calcPVs(custo: number) {
    if (!divisorValido || custo <= 0) return null;
    const pvComEmb = calcularPrecoPorPeca(custo, embPorPeca, pLucro, pComissao, pImposto);
    const pvSemEmb = calcularPrecoPorPeca(custo, 0, pLucro, pComissao, pImposto);
    return {
      pvComEmb,
      pvSemEmb,
      pvmComEmb: calcularPrecoPorMetro(pvComEmb),
      pvmSemEmb: calcularPrecoPorMetro(pvSemEmb),
      pvCxComEmb: calcularPrecoPorMetro(pvComEmb) * 5,
      pvCxSemEmb: calcularPrecoPorMetro(pvSemEmb) * 5,
    };
  }

  const pv21 = calcPVs(Number(custo21));
  const pv19 = calcPVs(Number(custo19));

  const anatomia21 = pv21 ? calcularAnatomiaVenda({
    metros: 1, precoPorMetro: pv21.pvmComEmb, descontoPercent: 0,
    custoUnitario: Number(custo21), custoEmbalagemPeca: embPorPeca,
    comEmbalagem: true, percentImposto: pImposto, percentComissao: pComissao,
  }) : null;

  const tetoMEI  = config?.tetoMEIAnual ?? 81000;
  const metrosMEI = pv21 ? (tetoMEI / pv21.pvmComEmb).toFixed(0) : "—";

  return (
    <div className="space-y-5">

      {/* Parâmetros */}
      <div className="rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
        <div className="border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272A]">
          <p className="text-sm font-semibold text-[#232021] dark:text-white">Parâmetros</p>
        </div>
        <div className="grid grid-cols-2 gap-4 px-5 py-4 sm:grid-cols-4">
          <InputField label="Custo P21 (R$/peça)" value={custo21} onChange={setCusto21} step="0.01" />
          <InputField label="Custo P19 (R$/peça)" value={custo19} onChange={setCusto19} step="0.01" />
          <InputField label="Custo caixa (R$)"    value={custoEmb} onChange={setCustoEmb} step="0.01" />
          <InputField label="Peças/caixa"         value={pecasCx} onChange={setPecasCx} step="1" />
          <InputField label="Lucro alvo (%)"      value={lucro}    onChange={setLucro}    step="1" />
          <InputField label="Comissão (%)"        value={comissao} onChange={setComissao} step="1" />
          <InputField label="Imposto (%)"         value={imposto}  onChange={setImposto}  step="1" />
          <div className="flex items-end">
            <div className={`flex h-10 w-full items-center justify-center rounded-md text-sm font-medium ${
              !divisorValido
                ? "border border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]"
                : "border border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]"
            }`}>
              Total: {formatarPercent(totalPct)}
            </div>
          </div>
        </div>
      </div>

      {!divisorValido && (
        <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
          Percentuais somam {formatarPercent(totalPct)} — deve ser menor que 100%
        </div>
      )}

      {/* Tabela de preços */}
      {divisorValido && (
        <div className="overflow-hidden rounded-md border border-[#E4E4E7] dark:border-[#27272A]">
          <div className="border-b border-[#E4E4E7] px-5 py-4 bg-[#FAFAFA] dark:border-[#27272A] dark:bg-[#18181B]">
            <p className="text-sm font-semibold text-[#232021] dark:text-white">Tabela de Preços</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#E4E4E7] dark:border-[#27272A]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#71717A]">Produto</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#71717A]">R$/peça</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#71717A]">R$/metro</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#71717A]">R$/caixa (5m)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F4F5] dark:divide-[#27272A]">
                <PVRow label="Pingadeira 21 cm — c/ embalagem" pv={pv21} field="pvComEmb" pvmField="pvmComEmb" pvcxField="pvCxComEmb" />
                <PVRow label="Pingadeira 21 cm — s/ embalagem" pv={pv21} field="pvSemEmb" pvmField="pvmSemEmb" pvcxField="pvCxSemEmb" />
                <PVRow label="Pingadeira 19 cm — c/ embalagem" pv={pv19} field="pvComEmb" pvmField="pvmComEmb" pvcxField="pvCxComEmb" />
                <PVRow label="Pingadeira 19 cm — s/ embalagem" pv={pv19} field="pvSemEmb" pvmField="pvmSemEmb" pvcxField="pvCxSemEmb" />
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Anatomia + MEI */}
      {divisorValido && anatomia21 && pv21 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* Anatomia */}
          <div className="rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
            <div className="border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272A]">
              <p className="text-sm font-semibold text-[#232021] dark:text-white">Anatomia — P21 c/ embalagem (por metro)</p>
            </div>
            <div className="space-y-3 px-5 py-4 text-sm">
              <AnatRow label="Custo produto"    value={anatomia21.custoProduto * 4}   total={anatomia21.valorVenda} />
              <AnatRow label="Custo embalagem"  value={anatomia21.custoEmbalagem * 4} total={anatomia21.valorVenda} />
              <AnatRow label={`Imposto (${formatarPercent(pImposto)})`}   value={anatomia21.custoImposto}  total={anatomia21.valorVenda} />
              <AnatRow label={`Comissão (${formatarPercent(pComissao)})`} value={anatomia21.custoComissao} total={anatomia21.valorVenda} />
              <div className="border-t border-[#E4E4E7] pt-3 dark:border-[#27272A]">
                <AnatRow label="Lucro líquido" value={anatomia21.lucroLimpo} total={anatomia21.valorVenda} accent />
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-semibold text-[#232021] dark:text-white">Preço de venda</span>
                <span className="font-mono font-bold tabular-nums text-[#232021] dark:text-white">{formatarMoeda(pv21.pvmComEmb)}</span>
              </div>
              <div>
                {(() => {
                  const sm = statusMargem(anatomia21.margemReal);
                  return <span className="text-xs font-medium" style={{ color: sm.cor }}>{sm.emoji} {sm.label} ({formatarPercent(anatomia21.margemReal)})</span>;
                })()}
              </div>
            </div>
          </div>

          {/* MEI */}
          <div className="rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
            <div className="border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272A]">
              <p className="text-sm font-semibold text-[#232021] dark:text-white">Capacidade MEI</p>
            </div>
            <div className="space-y-3 px-5 py-4 text-sm">
              <MeiRow label="Teto MEI anual"                   value={formatarMoeda(tetoMEI)} />
              <MeiRow label="Metros/ano até o teto (P21 c/emb)" value={`${metrosMEI} m`} />
              <MeiRow label="Metros/mês médio"                 value={`${pv21 ? (Number(metrosMEI) / 12).toFixed(0) : "—"} m`} />
              <MeiRow label="Caixas/mês médio"                 value={`${pv21 ? (Number(metrosMEI) / 12 / 5).toFixed(0) : "—"} cx`} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InputField({ label, value, onChange, step }: {
  label: string; value: string; onChange: (v: string) => void; step?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[#71717A]">{label}</label>
      <input type="number" step={step} min="0" value={value} onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-md border border-[#E4E4E7] bg-white px-3 text-sm tabular-nums text-[#232021] focus:outline-none focus:ring-1 focus:ring-[#232021] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white" />
    </div>
  );
}

type PVData = { pvComEmb: number; pvSemEmb: number; pvmComEmb: number; pvmSemEmb: number; pvCxComEmb: number; pvCxSemEmb: number } | null;

function PVRow({ label, pv, field, pvmField, pvcxField }: {
  label: string; pv: PVData;
  field: "pvComEmb" | "pvSemEmb";
  pvmField: "pvmComEmb" | "pvmSemEmb";
  pvcxField: "pvCxComEmb" | "pvCxSemEmb";
}) {
  return (
    <tr className="hover:bg-[#FAFAFA] dark:hover:bg-[#27272A]/40">
      <td className="px-4 py-3 text-[#52525B] dark:text-[#A1A1AA]">{label}</td>
      <td className="px-4 py-3 text-right font-mono tabular-nums text-[#71717A]">{pv ? formatarMoeda(pv[field]) : "—"}</td>
      <td className="px-4 py-3 text-right font-mono tabular-nums font-medium text-[#232021] dark:text-white">{pv ? formatarMoeda(pv[pvmField]) : "—"}</td>
      <td className="px-4 py-3 text-right font-mono tabular-nums text-[#71717A]">{pv ? formatarMoeda(pv[pvcxField]) : "—"}</td>
    </tr>
  );
}

function AnatRow({ label, value, total, accent }: {
  label: string; value: number; total: number; accent?: boolean;
}) {
  const share = total > 0 ? value / total : 0;
  return (
    <div className={`flex items-center justify-between gap-4 ${accent ? "font-semibold" : ""}`}>
      <span className={accent ? "text-[#047857]" : "text-[#71717A]"}>{label}</span>
      <span className={`font-mono tabular-nums ${accent ? "text-[#047857]" : "text-[#232021] dark:text-[#FAFAFA]"}`}>
        {formatarMoeda(value)}{" "}
        <span className="text-xs text-[#A1A1AA]">({formatarPercent(share)})</span>
      </span>
    </div>
  );
}

function MeiRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[#71717A]">{label}</span>
      <span className="font-mono tabular-nums font-medium text-[#232021] dark:text-white">{value}</span>
    </div>
  );
}
