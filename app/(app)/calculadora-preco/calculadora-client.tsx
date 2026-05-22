"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const [custo21, setCusto21] = useState(
    String(produtos.find((p) => p.larguraCm === 21)?.custoUnitario ?? 8)
  );
  const [custo19, setCusto19] = useState(
    String(produtos.find((p) => p.larguraCm === 19)?.custoUnitario ?? 7.24)
  );
  const [custoEmb, setCustoEmb] = useState(String(config?.custoEmbalagem ?? 10));
  const [pecasCx, setPecasCx] = useState(String(config?.pecasPorCaixa ?? 20));
  const [lucro, setLucro] = useState(String(Math.round((config?.percentLucro ?? 0.4) * 100)));
  const [comissao, setComissao] = useState(String(Math.round((config?.percentComissao ?? 0.06) * 100)));
  const [imposto, setImposto] = useState(String(Math.round((config?.percentImposto ?? 0.08) * 100)));

  const pLucro = Number(lucro) / 100;
  const pComissao = Number(comissao) / 100;
  const pImposto = Number(imposto) / 100;
  const nPecasCx = Number(pecasCx) || 20;
  const nCustoEmb = Number(custoEmb) || 0;
  const embPorPeca = nCustoEmb / nPecasCx;

  const totalPct = pLucro + pComissao + pImposto;
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

  // Anatomia da 21 com embalagem
  const anatomia21 = pv21 ? calcularAnatomiaVenda({
    metros: 1,
    precoPorMetro: pv21.pvmComEmb,
    descontoPercent: 0,
    custoUnitario: Number(custo21),
    custoEmbalagemPeca: embPorPeca,
    comEmbalagem: true,
    percentImposto: pImposto,
    percentComissao: pComissao,
  }) : null;

  // Capacidade MEI
  const tetoMEI = config?.tetoMEIAnual ?? 81000;
  const metrosMEI = pv21 ? (tetoMEI / pv21.pvmComEmb).toFixed(0) : "—";

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Parâmetros</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InputField label="Custo P21 (R$/peça)" value={custo21} onChange={setCusto21} step="0.01" />
          <InputField label="Custo P19 (R$/peça)" value={custo19} onChange={setCusto19} step="0.01" />
          <InputField label="Custo caixa (R$)" value={custoEmb} onChange={setCustoEmb} step="0.01" />
          <InputField label="Peças/caixa" value={pecasCx} onChange={setPecasCx} step="1" />
          <InputField label="Lucro alvo (%)" value={lucro} onChange={setLucro} step="1" />
          <InputField label="Comissão (%)" value={comissao} onChange={setComissao} step="1" />
          <InputField label="Imposto (%)" value={imposto} onChange={setImposto} step="1" />
          <div className="flex items-end">
            <div className={`text-sm font-medium px-3 py-2 rounded-md w-full text-center ${!divisorValido ? "bg-red-50 text-red-700" : "bg-green-50 text-[#065F46]"}`}>
              Total: {formatarPercent(totalPct)}
            </div>
          </div>
        </CardContent>
      </Card>

      {!divisorValido && (
        <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 text-sm text-red-700">
          ❌ Percentuais somam {formatarPercent(totalPct)} — deve ser menor que 100%
        </div>
      )}

      {/* Tabela de preços */}
      {divisorValido && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Tabela de Preços</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left py-2 px-3 font-medium text-zinc-600">Produto</th>
                  <th className="text-right py-2 px-3 font-medium text-zinc-600 tabular-nums">R$/peça</th>
                  <th className="text-right py-2 px-3 font-medium text-zinc-600 tabular-nums">R$/metro</th>
                  <th className="text-right py-2 px-3 font-medium text-zinc-600 tabular-nums">R$/caixa (5m)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <PVRow label="Pingadeira 21 cm — c/ embalagem" pv={pv21} field="pvComEmb" pvmField="pvmComEmb" pvcxField="pvCxComEmb" />
                <PVRow label="Pingadeira 21 cm — s/ embalagem" pv={pv21} field="pvSemEmb" pvmField="pvmSemEmb" pvcxField="pvCxSemEmb" />
                <PVRow label="Pingadeira 19 cm — c/ embalagem" pv={pv19} field="pvComEmb" pvmField="pvmComEmb" pvcxField="pvCxComEmb" />
                <PVRow label="Pingadeira 19 cm — s/ embalagem" pv={pv19} field="pvSemEmb" pvmField="pvmSemEmb" pvcxField="pvCxSemEmb" />
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Anatomia + MEI */}
      {divisorValido && anatomia21 && pv21 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Anatomia — P21 c/ embalagem (por metro)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <AnatRow label="Custo produto" value={anatomia21.custoProduto * 4} total={anatomia21.valorVenda} />
              <AnatRow label="Custo embalagem" value={anatomia21.custoEmbalagem * 4} total={anatomia21.valorVenda} />
              <AnatRow label="Imposto ({pct})" value={anatomia21.custoImposto} total={anatomia21.valorVenda} pct={pImposto} />
              <AnatRow label="Comissão ({pct})" value={anatomia21.custoComissao} total={anatomia21.valorVenda} pct={pComissao} />
              <div className="border-t border-zinc-200 pt-2 mt-2">
                <AnatRow label="💰 Lucro líquido" value={anatomia21.lucroLimpo} total={anatomia21.valorVenda} highlight />
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="font-semibold">Preço de venda</span>
                <span className="font-bold tabular-nums text-base">{formatarMoeda(pv21.pvmComEmb)}</span>
              </div>
              <div className="mt-1">
                {(() => { const sm = statusMargem(anatomia21.margemReal); return <span className="text-xs font-medium" style={{ color: sm.cor }}>{sm.emoji} {sm.label} ({formatarPercent(anatomia21.margemReal)})</span>; })()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Capacidade MEI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Teto MEI anual</span>
                <span className="tabular-nums font-medium">{formatarMoeda(tetoMEI)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Metros/ano até o teto (P21 c/emb)</span>
                <span className="tabular-nums font-medium">{metrosMEI} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Metros/mês médio</span>
                <span className="tabular-nums font-medium">{pv21 ? (Number(metrosMEI) / 12).toFixed(0) : "—"} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Caixas/mês médio</span>
                <span className="tabular-nums font-medium">{pv21 ? (Number(metrosMEI) / 12 / 5).toFixed(0) : "—"} cx</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function InputField({ label, value, onChange, step }: { label: string; value: string; onChange: (v: string) => void; step?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-zinc-600">{label}</label>
      <Input type="number" step={step} min="0" value={value} onChange={(e) => onChange(e.target.value)} className="tabular-nums" />
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
    <tr className="hover:bg-zinc-50">
      <td className="py-2.5 px-3 text-zinc-700">{label}</td>
      <td className="py-2.5 px-3 text-right tabular-nums">{pv ? formatarMoeda(pv[field]) : "—"}</td>
      <td className="py-2.5 px-3 text-right tabular-nums font-medium">{pv ? formatarMoeda(pv[pvmField]) : "—"}</td>
      <td className="py-2.5 px-3 text-right tabular-nums">{pv ? formatarMoeda(pv[pvcxField]) : "—"}</td>
    </tr>
  );
}

function AnatRow({ label, value, total, pct, highlight }: {
  label: string; value: number; total: number; pct?: number; highlight?: boolean;
}) {
  const share = total > 0 ? value / total : 0;
  const labelFmt = pct ? label.replace("{pct}", formatarPercent(pct)) : label;
  return (
    <div className={`flex justify-between items-center ${highlight ? "font-semibold text-[#065F46]" : ""}`}>
      <span className="text-zinc-600">{labelFmt}</span>
      <span className="tabular-nums">
        {formatarMoeda(value)} <span className="text-zinc-400 text-xs">({formatarPercent(share)})</span>
      </span>
    </div>
  );
}
