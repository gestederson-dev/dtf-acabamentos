"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calcularPrecoPorPeca, calcularPrecoPorMetro, calcularAnatomiaVenda,
  arredondarMetragem, sugerirEmpacotamento, statusMargem,
  formatarMoeda, formatarPercent,
} from "@/lib/pricing";
import { salvarVenda } from "@/lib/actions/vendas";
import { FormaPagamento, StatusVenda } from "@prisma/client";
import type { Configuracao, Produto, Cliente } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";

const FORMAS = [
  { value: FormaPagamento.PIX, label: "PIX" },
  { value: FormaPagamento.DINHEIRO, label: "Dinheiro" },
  { value: FormaPagamento.BOLETO, label: "Boleto" },
  { value: FormaPagamento.CARTAO_1X, label: "Cartão 1x" },
  { value: FormaPagamento.CARTAO_2X, label: "Cartão 2x" },
  { value: FormaPagamento.CARTAO_3X, label: "Cartão 3x" },
];

interface Props {
  config: Configuracao | null;
  produtos: Produto[];
  clientes: Cliente[];
  isSocio: boolean;
}

export function OrcamentoClient({ config, produtos, clientes, isSocio }: Props) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [produtoId, setProdutoId] = useState(produtos[0]?.id ?? "");
  const [comEmbalagem, setComEmbalagem] = useState(true);
  const [metros, setMetros] = useState("10");
  const [desconto, setDesconto] = useState("0");
  const [forma, setForma] = useState<FormaPagamento>(FormaPagamento.PIX);
  const [clienteId, setClienteId] = useState("");
  const [clienteAvulso, setClienteAvulso] = useState("");
  const [observacao, setObservacao] = useState("");
  const [copiado, setCopiado] = useState(false);

  const produto = produtos.find((p) => p.id === produtoId);
  const clienteSel = clientes.find((c) => c.id === clienteId);
  const nomeCliente = clienteSel?.nome || clienteAvulso || "Cliente";

  const c = config;
  const pLucro = c?.percentLucro ?? 0.4;
  const pComissao = c?.percentComissao ?? 0.06;
  const pImposto = c?.percentImposto ?? 0.08;
  const embPorPeca = comEmbalagem ? ((c?.custoEmbalagem ?? 10) / (c?.pecasPorCaixa ?? 20)) : 0;
  const descontoMaxLivre = c?.descontoMaximoLivre ?? 0.05;
  const freteGratisCx = c?.freteGratisAcimaCx ?? 5;

  const nMetros = arredondarMetragem(Number(metros) || 0);
  const nDesconto = Number(desconto) / 100;
  const pecas = nMetros * 4;
  const empack = sugerirEmpacotamento(pecas, c?.pecasPorCaixa ?? 20);

  const pvPeca = produto
    ? calcularPrecoPorPeca(produto.custoUnitario, embPorPeca, pLucro, pComissao, pImposto)
    : 0;
  const pvMetro = calcularPrecoPorMetro(pvPeca);

  const anatomia = produto && nMetros > 0
    ? calcularAnatomiaVenda({
        metros: nMetros, precoPorMetro: pvMetro, descontoPercent: nDesconto,
        custoUnitario: produto.custoUnitario, custoEmbalagemPeca: embPorPeca,
        comEmbalagem, percentImposto: pImposto, percentComissao: pComissao,
      })
    : null;

  const sm = anatomia ? statusMargem(anatomia.margemReal) : null;
  const descontoAlto = nDesconto > descontoMaxLivre;
  const margemBaixa = anatomia && anatomia.margemReal < 0.25 && anatomia.margemReal >= 0;
  const prejuizo = anatomia && anatomia.margemReal < 0;
  const freteGratis = empack.caixas >= freteGratisCx;

  const nomeProduto = produto
    ? `${produto.nome}${comEmbalagem ? " c/ embalagem" : " s/ embalagem"}`
    : "";

  const textoWhatsApp = `*Orçamento DTF Acabamentos*
Cliente: ${nomeCliente}

Produto: ${nomeProduto}
Metragem: ${nMetros} m (${pecas} peças)
Preço por metro: ${formatarMoeda(pvMetro)}

Subtotal: ${formatarMoeda(anatomia?.faturamentoBruto ?? 0)}${nDesconto > 0 ? `\nDesconto: -${formatarMoeda(anatomia?.desconto ?? 0)}` : ""}

*TOTAL: ${formatarMoeda(anatomia?.valorVenda ?? 0)}*
Pagamento: ${FORMAS.find((f) => f.value === forma)?.label ?? forma}${freteGratis ? "\n✅ Frete grátis incluído" : ""}`;

  function copiarTexto() {
    navigator.clipboard.writeText(textoWhatsApp);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function salvar(status: StatusVenda) {
    if (prejuizo) { toast({ title: "Venda em prejuízo — não é possível salvar", variant: "destructive" }); return; }
    if (descontoAlto && !isSocio) { toast({ title: "Desconto acima do limite — solicite autorização do sócio", variant: "destructive" }); return; }

    startTransition(async () => {
      const fd = new FormData();
      fd.set("produtoId", produtoId);
      fd.set("comEmbalagem", String(comEmbalagem));
      fd.set("metros", String(nMetros));
      fd.set("descontoPercent", String(nDesconto * 100));
      fd.set("formaPagamento", forma);
      fd.set("status", status);
      fd.set("observacao", observacao);
      if (clienteId) fd.set("clienteId", clienteId);
      if (clienteAvulso) fd.set("clienteNomeAvulso", clienteAvulso);
      try {
        await salvarVenda(fd);
      } catch (e: unknown) {
        toast({ title: e instanceof Error ? e.message : "Erro ao salvar", variant: "destructive" });
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Dados do Orçamento</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {/* Cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-600">Cliente cadastrado</label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full h-9 rounded-md border border-zinc-200 px-3 text-sm bg-white"
              >
                <option value="">— Sem cadastro —</option>
                {clientes.map((cl) => <option key={cl.id} value={cl.id}>{cl.nome}</option>)}
              </select>
            </div>
            {!clienteId && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-600">Nome avulso</label>
                <Input placeholder="Nome do cliente" value={clienteAvulso} onChange={(e) => setClienteAvulso(e.target.value)} />
              </div>
            )}
          </div>

          {/* Produto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-600">Produto</label>
              <select
                value={produtoId}
                onChange={(e) => setProdutoId(e.target.value)}
                className="w-full h-9 rounded-md border border-zinc-200 px-3 text-sm bg-white"
              >
                {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-600">Embalagem</label>
              <div className="flex gap-2 h-9 items-center">
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    onClick={() => setComEmbalagem(v)}
                    className={`flex-1 h-9 rounded-md border text-sm font-medium transition-colors ${comEmbalagem === v ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-600 hover:border-zinc-400"}`}
                  >
                    {v ? "Com caixa" : "Sem caixa"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Metragem e desconto */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="text-xs font-medium text-zinc-600">Metragem (m)</label>
              <div className="flex gap-1">
                <Input
                  type="number" step="0.25" min="0.25" value={metros}
                  onChange={(e) => setMetros(e.target.value)}
                  className="tabular-nums"
                />
                {Number(metros) !== nMetros && (
                  <Button type="button" onClick={() => setMetros(String(nMetros))} className="shrink-0 text-xs px-2 h-9">
                    ↑{nMetros}m
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-600">Desconto (%)</label>
              <Input
                type="number" step="0.5" min="0" max="100" value={desconto}
                onChange={(e) => setDesconto(e.target.value)}
                className={`tabular-nums ${descontoAlto ? "border-yellow-400" : ""}`}
              />
            </div>
            <div className="space-y-1 col-span-2 sm:col-span-2">
              <label className="text-xs font-medium text-zinc-600">Forma de pagamento</label>
              <select
                value={forma}
                onChange={(e) => setForma(e.target.value as FormaPagamento)}
                className="w-full h-9 rounded-md border border-zinc-200 px-3 text-sm bg-white"
              >
                {FORMAS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>

          {/* Observação */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-600">Observação (opcional)</label>
            <Input placeholder="Ex: Entregar na obra da Rua X" value={observacao} onChange={(e) => setObservacao(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      {descontoAlto && !isSocio && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md px-4 py-2.5 text-sm text-yellow-800">
          ⚠️ Desconto acima de {formatarPercent(descontoMaxLivre)} — precisa autorização do sócio
        </div>
      )}
      {margemBaixa && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md px-4 py-2.5 text-sm text-yellow-800">
          ⚠️ Margem baixa ({formatarPercent(anatomia!.margemReal)}) — verifique antes de confirmar
        </div>
      )}
      {prejuizo && (
        <div className="bg-red-50 border border-red-200 rounded-md px-4 py-2.5 text-sm text-red-800">
          ❌ Venda em prejuízo — não é possível salvar
        </div>
      )}

      {/* Resultado */}
      {anatomia && produto && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Resumo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                Resumo
                {sm && <span className="text-xs font-normal" style={{ color: sm.cor }}>{sm.emoji} {sm.label}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Metragem" value={`${nMetros} m`} />
              <Row label="Peças" value={`${pecas} peças`} />
              <Row label="Caixas + avulsas" value={`${empack.caixas} cx + ${empack.avulsas} avulsas`} />
              {freteGratis && <Row label="Frete" value="✅ Grátis" />}
              <div className="border-t border-zinc-100 pt-2 mt-2">
                <Row label="Preço/metro" value={formatarMoeda(pvMetro)} />
                {nDesconto > 0 && <Row label={`Desconto (${formatarPercent(nDesconto)})`} value={`-${formatarMoeda(anatomia.desconto)}`} />}
                <Row label="TOTAL" value={formatarMoeda(anatomia.valorVenda)} bold />
              </div>
              {!isSocio && (
                <Row label="Sua comissão" value={formatarMoeda(anatomia.custoComissao)} highlight />
              )}
            </CardContent>
          </Card>

          {/* Anatomia (só sócio) */}
          {isSocio && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Anatomia financeira</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Faturamento bruto" value={formatarMoeda(anatomia.faturamentoBruto)} />
                <Row label="Desconto" value={`-${formatarMoeda(anatomia.desconto)}`} />
                <div className="border-t border-zinc-100 pt-2 mt-1 space-y-1.5">
                  <Row label="Custo produto" value={`-${formatarMoeda(anatomia.custoProduto)}`} />
                  <Row label="Custo embalagem" value={`-${formatarMoeda(anatomia.custoEmbalagem)}`} />
                  <Row label="Imposto" value={`-${formatarMoeda(anatomia.custoImposto)}`} />
                  <Row label="Comissão" value={`-${formatarMoeda(anatomia.custoComissao)}`} />
                </div>
                <div className="border-t border-zinc-100 pt-2 mt-1">
                  <Row label="💰 Lucro líquido" value={formatarMoeda(anatomia.lucroLimpo)} highlight />
                  <Row label="Margem real" value={formatarPercent(anatomia.margemReal)} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Texto WhatsApp */}
      {anatomia && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              Texto para WhatsApp
              <Button type="button" onClick={copiarTexto} className="h-7 text-xs px-3">
                {copiado ? "✅ Copiado!" : "Copiar"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-zinc-700 whitespace-pre-wrap font-mono bg-zinc-50 rounded-md p-3 border border-zinc-200 leading-relaxed">
              {textoWhatsApp}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      {anatomia && !prejuizo && (
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={() => salvar(StatusVenda.ORCAMENTO)}
            disabled={pending || (descontoAlto && !isSocio)}
            className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
          >
            {pending ? "Salvando..." : "Salvar como Orçamento"}
          </Button>
          <Button
            onClick={() => salvar(StatusVenda.CONFIRMADO)}
            disabled={pending || (descontoAlto && !isSocio)}
          >
            {pending ? "Salvando..." : "Salvar como Confirmado"}
          </Button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold, highlight }: { label: string; value: string; bold?: boolean; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-zinc-500">{label}</span>
      <span className={`tabular-nums ${bold ? "font-bold text-base" : ""} ${highlight ? "font-semibold text-[#065F46]" : ""}`}>{value}</span>
    </div>
  );
}
