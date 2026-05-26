"use client";

import { useState, useTransition } from "react";
import {
  calcularPrecoPorPeca, calcularPrecoPorMetro, calcularAnatomiaVenda,
  arredondarMetragem, sugerirEmpacotamento, statusMargem,
  formatarMoeda, formatarPercent,
} from "@/lib/pricing";
import { editarVenda } from "@/lib/actions/vendas";
import { FormaPagamento } from "@prisma/client";
import type { Configuracao, Produto, Cliente } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";

const FORMAS = [
  { value: FormaPagamento.PIX,       label: "PIX" },
  { value: FormaPagamento.DINHEIRO,  label: "Dinheiro" },
  { value: FormaPagamento.BOLETO,    label: "Boleto" },
  { value: FormaPagamento.CARTAO_1X, label: "Cartão 1x" },
  { value: FormaPagamento.CARTAO_2X, label: "Cartão 2x" },
  { value: FormaPagamento.CARTAO_3X, label: "Cartão 3x" },
];

const fieldCls = "h-10 w-full rounded-md border border-[#E4E4E7] bg-white px-3 text-sm text-[#232021] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-[#232021] focus:border-[#232021] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white";
const labelCls = "mb-1 block text-xs font-medium text-[#71717A]";

interface Inicial {
  produtoId: string;
  comEmbalagem: boolean;
  metros: string;
  desconto: string;
  forma: FormaPagamento;
  clienteId: string;
  clienteAvulso: string;
  observacao: string;
}

interface Props {
  vendaId: string;
  config: Configuracao | null;
  produtos: Produto[];
  clientes: Cliente[];
  inicial: Inicial;
}

export function EditarVendaClient({ vendaId, config, produtos, clientes, inicial }: Props) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [produtoId, setProdutoId]         = useState(inicial.produtoId);
  const [comEmbalagem, setComEmbalagem]   = useState(inicial.comEmbalagem);
  const [metros, setMetros]               = useState(inicial.metros);
  const [desconto, setDesconto]           = useState(inicial.desconto);
  const [forma, setForma]                 = useState<FormaPagamento>(inicial.forma);
  const [clienteId, setClienteId]         = useState(inicial.clienteId);
  const [clienteAvulso, setClienteAvulso] = useState(inicial.clienteAvulso);
  const [observacao, setObservacao]       = useState(inicial.observacao);

  const produto = produtos.find((p) => p.id === produtoId);

  const c            = config;
  const pLucro       = c?.percentLucro ?? 0.4;
  const pComissao    = c?.percentComissao ?? 0.06;
  const pImposto     = c?.percentImposto ?? 0.08;
  const embPorPeca   = comEmbalagem ? ((c?.custoEmbalagem ?? 10) / (c?.pecasPorCaixa ?? 20)) : 0;
  const freteGratisCx = c?.freteGratisAcimaCx ?? 5;

  const nMetros   = arredondarMetragem(Number(metros.replace(",", ".")) || 0);
  const nDesconto = Number(String(desconto).replace(",", ".")) / 100;
  const pecas     = nMetros * 4;
  const empack    = sugerirEmpacotamento(pecas, c?.pecasPorCaixa ?? 20);

  const pvPeca  = produto ? calcularPrecoPorPeca(produto.custoUnitario, embPorPeca, pLucro, pComissao, pImposto) : 0;
  const pvMetro = calcularPrecoPorMetro(pvPeca);

  const anatomia = produto && nMetros > 0
    ? calcularAnatomiaVenda({
        metros: nMetros, precoPorMetro: pvMetro, descontoPercent: nDesconto,
        custoUnitario: produto.custoUnitario, custoEmbalagemPeca: embPorPeca,
        comEmbalagem, percentImposto: pImposto, percentComissao: pComissao,
      })
    : null;

  const sm         = anatomia ? statusMargem(anatomia.margemReal) : null;
  const margemBaixa = anatomia && anatomia.margemReal < 0.25 && anatomia.margemReal >= 0;
  const prejuizo    = anatomia && anatomia.margemReal < 0;
  const freteGratis = freteGratisCx > 0 && empack.caixas >= freteGratisCx;

  function salvar() {
    if (prejuizo) { toast({ title: "Venda em prejuízo — não é possível salvar", variant: "destructive" }); return; }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("produtoId", produtoId);
      fd.set("comEmbalagem", String(comEmbalagem));
      fd.set("metros", String(nMetros));
      fd.set("descontoPercent", String(nDesconto * 100));
      fd.set("formaPagamento", forma);
      fd.set("observacao", observacao);
      if (clienteId) fd.set("clienteId", clienteId);
      if (clienteAvulso) fd.set("clienteNomeAvulso", clienteAvulso);
      try {
        await editarVenda(vendaId, fd);
      } catch (e: unknown) {
        toast({ title: e instanceof Error ? e.message : "Erro ao salvar", variant: "destructive" });
      }
    });
  }

  return (
    <div className="space-y-5">

      {/* Formulário */}
      <div className="rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
        <div className="border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272A]">
          <p className="text-sm font-semibold text-[#232021] dark:text-white">Dados do Orçamento</p>
        </div>
        <div className="space-y-4 px-5 py-4">

          {/* Cliente */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Cliente cadastrado</label>
              <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} className={fieldCls}>
                <option value="">— Sem cadastro —</option>
                {clientes.map((cl) => <option key={cl.id} value={cl.id}>{cl.nome}</option>)}
              </select>
            </div>
            {!clienteId && (
              <div>
                <label className={labelCls}>Nome avulso</label>
                <input
                  type="text" placeholder="Nome do cliente"
                  value={clienteAvulso} onChange={(e) => setClienteAvulso(e.target.value)}
                  className={fieldCls}
                />
              </div>
            )}
          </div>

          {/* Produto + Embalagem */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Produto</label>
              <select value={produtoId} onChange={(e) => setProdutoId(e.target.value)} className={fieldCls}>
                {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Embalagem</label>
              <div className="flex gap-2">
                {([true, false] as const).map((v) => (
                  <button
                    key={String(v)} type="button" onClick={() => setComEmbalagem(v)}
                    className={`flex-1 h-10 rounded-md border text-sm font-medium transition-colors ${
                      comEmbalagem === v
                        ? "border-[#232021] bg-[#232021] text-white dark:border-white dark:bg-white dark:text-[#232021]"
                        : "border-[#E4E4E7] text-[#52525B] hover:border-[#A1A1AA] dark:border-[#27272A] dark:text-[#A1A1AA]"
                    }`}
                  >
                    {v ? "Com caixa" : "Sem caixa"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Metragem + Desconto + Forma */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <label className={labelCls}>Metragem (m)</label>
              <div className="flex gap-1">
                <input
                  type="number" step="0.25" min="0.25" value={metros}
                  inputMode="decimal"
                  onChange={(e) => setMetros(e.target.value)}
                  className={`${fieldCls} tabular-nums`}
                />
                {Number(metros) !== nMetros && (
                  <button
                    type="button" onClick={() => setMetros(String(nMetros))}
                    className="shrink-0 h-10 rounded-md border border-[#E4E4E7] bg-white px-2 text-xs text-[#232021] hover:bg-[#F4F4F5] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white"
                  >
                    ↑{nMetros}m
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className={labelCls}>Desconto (%)</label>
              <input
                type="number" step="0.5" min="0" max="100" value={desconto}
                inputMode="decimal"
                onChange={(e) => setDesconto(e.target.value)}
                className={`${fieldCls} tabular-nums`}
              />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Forma de pagamento</label>
              <select value={forma} onChange={(e) => setForma(e.target.value as FormaPagamento)} className={fieldCls}>
                {FORMAS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>

          {/* Observação */}
          <div>
            <label className={labelCls}>Observação (opcional)</label>
            <input
              type="text" placeholder="Ex: Entregar na obra da Rua X"
              value={observacao} onChange={(e) => setObservacao(e.target.value)}
              className={fieldCls}
            />
          </div>
        </div>
      </div>

      {/* Alertas */}
      {margemBaixa && (
        <div className="rounded-md border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm text-[#B45309]">
          Margem baixa ({formatarPercent(anatomia!.margemReal)}) — verifique antes de salvar
        </div>
      )}
      {prejuizo && (
        <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
          Venda em prejuízo — não é possível salvar
        </div>
      )}

      {/* Resumo */}
      {anatomia && produto && (
        <div className="rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
          <div className="border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272A]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#232021] dark:text-white">Resumo</p>
              {sm && <span className="text-xs font-medium" style={{ color: sm.cor }}>{sm.emoji} {sm.label}</span>}
            </div>
          </div>
          <div className="space-y-3 px-5 py-4 text-sm">
            <Row label="Metragem" value={`${nMetros} m (${pecas} peças)`} />
            <Row label="Caixas + avulsas" value={`${empack.caixas} cx + ${empack.avulsas} avulsas`} />
            {freteGratis && <Row label="Frete" value="Grátis" accent />}
            <div className="border-t border-[#E4E4E7] pt-3 dark:border-[#27272A]">
              <Row label="Preço/metro" value={formatarMoeda(pvMetro)} mono />
              {nDesconto > 0 && <Row label={`Desconto (${formatarPercent(nDesconto)})`} value={`-${formatarMoeda(anatomia.desconto)}`} mono />}
              <div className="mt-3">
                <Row label="TOTAL" value={formatarMoeda(anatomia.valorVenda)} mono bold />
              </div>
            </div>
            <div className="border-t border-[#E4E4E7] pt-3 space-y-3 dark:border-[#27272A]">
              <Row label="Custo produto" value={`-${formatarMoeda(anatomia.custoProduto)}`} mono />
              <Row label="Custo embalagem" value={`-${formatarMoeda(anatomia.custoEmbalagem)}`} mono />
              <Row label="Imposto" value={`-${formatarMoeda(anatomia.custoImposto)}`} mono />
              <Row label="Comissão" value={`-${formatarMoeda(anatomia.custoComissao)}`} mono />
              <Row label="Lucro líquido" value={formatarMoeda(anatomia.lucroLimpo)} mono accent />
            </div>
          </div>
        </div>
      )}

      {/* Ação */}
      {anatomia && !prejuizo && (
        <div className="flex gap-3">
          <a
            href={`/vendas/${vendaId}`}
            className="h-10 rounded-md border border-[#E4E4E7] bg-white px-4 text-sm font-medium text-[#232021] inline-flex items-center hover:bg-[#F4F4F5] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white"
          >
            Cancelar
          </a>
          <button
            type="button"
            onClick={salvar}
            disabled={pending}
            className="h-10 rounded-md bg-[#232021] px-6 text-sm font-medium text-white transition-colors hover:bg-[#3F3F46] disabled:opacity-40 dark:bg-white dark:text-[#232021]"
          >
            {pending ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono, bold, accent }: {
  label: string; value: string; mono?: boolean; bold?: boolean; accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[#71717A]">{label}</span>
      <span className={[
        mono ? "font-mono tabular-nums" : "",
        bold ? "font-semibold text-[#232021] dark:text-white" : "text-[#52525B] dark:text-[#A1A1AA]",
        accent ? "!text-[#047857] font-semibold" : "",
      ].join(" ")}>
        {value}
      </span>
    </div>
  );
}
