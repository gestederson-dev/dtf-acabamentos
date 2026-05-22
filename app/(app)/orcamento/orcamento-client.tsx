"use client";

import { useState, useTransition } from "react";
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
  { value: FormaPagamento.PIX,      label: "PIX" },
  { value: FormaPagamento.DINHEIRO, label: "Dinheiro" },
  { value: FormaPagamento.BOLETO,   label: "Boleto" },
  { value: FormaPagamento.CARTAO_1X, label: "Cartão 1x" },
  { value: FormaPagamento.CARTAO_2X, label: "Cartão 2x" },
  { value: FormaPagamento.CARTAO_3X, label: "Cartão 3x" },
];

const fieldCls = "h-10 w-full rounded-md border border-[#E4E4E7] bg-white px-3 text-sm text-[#232021] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-[#232021] focus:border-[#232021] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white";
const labelCls = "mb-1 block text-xs font-medium text-[#71717A]";

interface Props {
  config: Configuracao | null;
  produtos: Produto[];
  clientes: Cliente[];
  isSocio: boolean;
}

export function OrcamentoClient({ config, produtos, clientes, isSocio }: Props) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [produtoId, setProdutoId]       = useState(produtos[0]?.id ?? "");
  const [comEmbalagem, setComEmbalagem] = useState(true);
  const [metros, setMetros]             = useState("10");
  const [desconto, setDesconto]         = useState("0");
  const [forma, setForma]               = useState<FormaPagamento>(FormaPagamento.PIX);
  const [clienteId, setClienteId]       = useState("");
  const [clienteAvulso, setClienteAvulso] = useState("");
  const [observacao, setObservacao]     = useState("");
  const [copiado, setCopiado]           = useState(false);

  const produto     = produtos.find((p) => p.id === produtoId);
  const clienteSel  = clientes.find((c) => c.id === clienteId);
  const nomeCliente = clienteSel?.nome || clienteAvulso || "Cliente";

  const c           = config;
  const pLucro      = c?.percentLucro ?? 0.4;
  const pComissao   = c?.percentComissao ?? 0.06;
  const pImposto    = c?.percentImposto ?? 0.08;
  const embPorPeca  = comEmbalagem ? ((c?.custoEmbalagem ?? 10) / (c?.pecasPorCaixa ?? 20)) : 0;
  const descontoMaxLivre = c?.descontoMaximoLivre ?? 0.05;
  const freteGratisCx    = c?.freteGratisAcimaCx ?? 5;

  const nMetros  = arredondarMetragem(Number(metros) || 0);
  const nDesconto = Number(desconto) / 100;
  const pecas    = nMetros * 4;
  const empack   = sugerirEmpacotamento(pecas, c?.pecasPorCaixa ?? 20);

  const pvPeca  = produto
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

  const sm          = anatomia ? statusMargem(anatomia.margemReal) : null;
  const descontoAlto = nDesconto > descontoMaxLivre;
  const margemBaixa  = anatomia && anatomia.margemReal < 0.25 && anatomia.margemReal >= 0;
  const prejuizo     = anatomia && anatomia.margemReal < 0;
  const freteGratis  = empack.caixas >= freteGratisCx;
  const nomeProduto  = produto ? `${produto.nome}${comEmbalagem ? " c/ embalagem" : " s/ embalagem"}` : "";

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
                    className={`flex-1 h-10 rounded-md border text-sm font-medium transition-colors active:scale-[0.98] ${
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
                onChange={(e) => setDesconto(e.target.value)}
                className={`${fieldCls} tabular-nums ${descontoAlto ? "border-[#FCD34D] focus:ring-[#B45309]" : ""}`}
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
      {descontoAlto && !isSocio && (
        <div className="rounded-md border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm text-[#B45309]">
          Desconto acima de {formatarPercent(descontoMaxLivre)} — precisa autorização do sócio
        </div>
      )}
      {margemBaixa && (
        <div className="rounded-md border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm text-[#B45309]">
          Margem baixa ({formatarPercent(anatomia!.margemReal)}) — verifique antes de confirmar
        </div>
      )}
      {prejuizo && (
        <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
          Venda em prejuízo — não é possível salvar
        </div>
      )}

      {/* Resultado */}
      {anatomia && produto && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* Resumo */}
          <div className="rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
            <div className="border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272A]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#232021] dark:text-white">Resumo</p>
                {sm && <span className="text-xs font-medium" style={{ color: sm.cor }}>{sm.emoji} {sm.label}</span>}
              </div>
            </div>
            <div className="space-y-3 px-5 py-4 text-sm">
              <ORow label="Metragem" value={`${nMetros} m`} />
              <ORow label="Peças" value={`${pecas} peças`} />
              <ORow label="Caixas + avulsas" value={`${empack.caixas} cx + ${empack.avulsas} avulsas`} />
              {freteGratis && <ORow label="Frete" value="Grátis" accent />}
              <div className="border-t border-[#E4E4E7] pt-3 dark:border-[#27272A]">
                <ORow label="Preço/metro" value={formatarMoeda(pvMetro)} mono />
                {nDesconto > 0 && <ORow label={`Desconto (${formatarPercent(nDesconto)})`} value={`-${formatarMoeda(anatomia.desconto)}`} mono />}
                <div className="mt-3">
                  <ORow label="TOTAL" value={formatarMoeda(anatomia.valorVenda)} mono bold />
                </div>
              </div>
              {!isSocio && (
                <div className="border-t border-[#E4E4E7] pt-3 dark:border-[#27272A]">
                  <ORow label="Sua comissão" value={formatarMoeda(anatomia.custoComissao)} mono accent />
                </div>
              )}
            </div>
          </div>

          {/* Anatomia — só sócio */}
          {isSocio && (
            <div className="rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
              <div className="border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272A]">
                <p className="text-sm font-semibold text-[#232021] dark:text-white">Anatomia financeira</p>
              </div>
              <div className="space-y-3 px-5 py-4 text-sm">
                <ORow label="Faturamento bruto" value={formatarMoeda(anatomia.faturamentoBruto)} mono />
                <ORow label="Desconto" value={`-${formatarMoeda(anatomia.desconto)}`} mono />
                <div className="border-t border-[#E4E4E7] pt-3 space-y-3 dark:border-[#27272A]">
                  <ORow label="Custo produto" value={`-${formatarMoeda(anatomia.custoProduto)}`} mono />
                  <ORow label="Custo embalagem" value={`-${formatarMoeda(anatomia.custoEmbalagem)}`} mono />
                  <ORow label="Imposto" value={`-${formatarMoeda(anatomia.custoImposto)}`} mono />
                  <ORow label="Comissão" value={`-${formatarMoeda(anatomia.custoComissao)}`} mono />
                </div>
                <div className="border-t border-[#E4E4E7] pt-3 dark:border-[#27272A]">
                  <ORow label="Lucro líquido" value={formatarMoeda(anatomia.lucroLimpo)} mono accent />
                  <div className="mt-3">
                    <ORow label="Margem real" value={formatarPercent(anatomia.margemReal)} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Texto WhatsApp */}
      {anatomia && (
        <div className="rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
          <div className="flex items-center justify-between border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272A]">
            <p className="text-sm font-semibold text-[#232021] dark:text-white">Texto para WhatsApp</p>
            <button
              type="button" onClick={copiarTexto}
              className="h-8 rounded-md border border-[#E4E4E7] bg-white px-3 text-xs font-medium text-[#232021] transition-colors hover:bg-[#F4F4F5] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white dark:hover:bg-[#27272A]"
            >
              {copiado ? "Copiado!" : "Copiar"}
            </button>
          </div>
          <div className="px-5 py-4">
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-[#232021] dark:text-[#FAFAFA]">
              {textoWhatsApp}
            </pre>
          </div>
        </div>
      )}

      {/* Ações */}
      {anatomia && !prejuizo && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => salvar(StatusVenda.ORCAMENTO)}
            disabled={pending || (descontoAlto && !isSocio)}
            className="h-10 rounded-md border border-[#E4E4E7] bg-white px-4 text-sm font-medium text-[#232021] transition-colors hover:bg-[#F4F4F5] active:scale-[0.98] disabled:opacity-40 dark:border-[#27272A] dark:bg-[#18181B] dark:text-white dark:hover:bg-[#27272A]"
          >
            {pending ? "Salvando..." : "Salvar como Orçamento"}
          </button>
          <button
            type="button"
            onClick={() => salvar(StatusVenda.CONFIRMADO)}
            disabled={pending || (descontoAlto && !isSocio)}
            className="h-10 rounded-md bg-[#232021] px-4 text-sm font-medium text-white transition-colors hover:bg-[#3F3F46] active:scale-[0.98] disabled:opacity-40 dark:bg-white dark:text-[#232021] dark:hover:bg-[#F4F4F5]"
          >
            {pending ? "Salvando..." : "Salvar como Confirmado"}
          </button>
        </div>
      )}
    </div>
  );
}

function ORow({
  label, value, mono, bold, accent,
}: {
  label: string; value: string;
  mono?: boolean; bold?: boolean; accent?: boolean;
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
