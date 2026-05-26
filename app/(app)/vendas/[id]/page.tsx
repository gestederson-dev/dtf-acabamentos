import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, StatusVenda } from "@prisma/client";
import { notFound } from "next/navigation";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatarMoeda, formatarPercent, statusMargem } from "@/lib/pricing";
import { AtualizarStatus } from "./atualizar-status";
import { BotaoPDF } from "@/components/pdf/botao-pdf";
import { LinkPublico } from "./link-publico";
import { DeletarVenda } from "./deletar-venda";
import Link from "next/link";

const STATUS_BADGE: Record<StatusVenda, { label: string; cls: string }> = {
  ORCAMENTO:  { label: "Orçamento",  cls: "border-[#E4E4E7] bg-white text-[#52525B]" },
  CONFIRMADO: { label: "Confirmado", cls: "border-[#232021] bg-[#232021] text-white" },
  ENTREGUE:   { label: "Entregue",   cls: "border-[#E4E4E7] bg-[#F4F4F5] text-[#52525B]" },
  PAGO:       { label: "Pago",       cls: "border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]" },
  CANCELADO:  { label: "Cancelado",  cls: "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]" },
};

const FORMA_LABEL: Record<string, string> = {
  PIX: "PIX", BOLETO: "Boleto", DINHEIRO: "Dinheiro",
  CARTAO_1X: "Cartão 1x", CARTAO_2X: "Cartão 2x", CARTAO_3X: "Cartão 3x",
};

export default async function VendaDetalhePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const isSocio = session?.user?.role === Role.SOCIO;

  const venda = await prisma.venda.findUnique({
    where: { id: params.id },
    include: { cliente: true, produto: true, vendedor: true },
  });
  if (!venda) notFound();

  if (!isSocio && session?.user?.id && venda.vendedorId !== session.user.id) notFound();

  const sb = STATUS_BADGE[venda.status];
  const margem = venda.valorTotal > 0 ? venda.lucroLimpo / venda.valorTotal : 0;
  const sm = statusMargem(margem);
  const nomeCliente = venda.cliente?.nome ?? venda.clienteNomeAvulso ?? "—";
  const statusDisponiveis = Object.values(StatusVenda).filter((s) => s !== venda.status);
  const diasConversao = venda.dataConfirmado
    ? differenceInDays(venda.dataConfirmado, venda.criadoEm)
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-10">

      {/* Header */}
      <div className="mb-8">
        <Link href="/vendas" className="mb-3 inline-flex items-center gap-1 text-sm text-[#71717A] transition-colors hover:text-[#232021] dark:hover:text-white">
          ← Vendas
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[#232021] dark:text-white">
              Venda #{venda.numero}
            </h1>
            <p className="mt-0.5 text-sm capitalize text-[#71717A]">
              {format(venda.data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <BotaoPDF vendaId={venda.id} />
            {isSocio && venda.status === StatusVenda.ORCAMENTO && (
              <Link
                href={`/vendas/${venda.id}/editar`}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E4E4E7] bg-white px-3 text-xs font-medium text-[#232021] transition-colors hover:bg-[#F4F4F5] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white dark:hover:bg-[#27272A]"
              >
                Editar
              </Link>
            )}
            <span className={`inline-flex items-center rounded-sm border px-2.5 py-1 text-xs font-medium ${sb.cls}`}>
              {sb.label}
            </span>
          </div>
        </div>
      </div>

      {/* Cartões */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
        {/* Dados da venda */}
        <div className="rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
          <div className="border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272A]">
            <p className="text-sm font-semibold text-[#232021] dark:text-white">Dados da venda</p>
          </div>
          <div className="space-y-3 px-5 py-4 text-sm">
            <DataRow label="Cliente" value={nomeCliente} />
            <DataRow label="Produto" value={`${venda.produto.nome} ${venda.comEmbalagem ? "c/ embalagem" : "s/ embalagem"}`} />
            <DataRow label="Metragem" value={`${venda.metros} m (${venda.pecas} peças)`} />
            <DataRow label="Preço/metro" value={formatarMoeda(venda.precoUnitario)} mono />
            {venda.descontoPercent > 0 && <DataRow label="Desconto" value={formatarPercent(venda.descontoPercent)} />}
            <DataRow label="Pagamento" value={FORMA_LABEL[venda.formaPagamento] ?? venda.formaPagamento} />
            <DataRow label="Vendedor" value={venda.vendedor.name ?? "—"} />
            {venda.observacao && <DataRow label="Observação" value={venda.observacao} />}
            {diasConversao !== null && (
              <DataRow
                label="Conversão"
                value={diasConversao === 0 ? "mesmo dia" : `${diasConversao} dia${diasConversao !== 1 ? "s" : ""}`}
              />
            )}
          </div>
        </div>

        {/* Financeiro */}
        <div className="rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
          <div className="border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272A]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#232021] dark:text-white">
                {isSocio ? "Anatomia financeira" : "Resultado"}
              </p>
              {isSocio && (
                <span className="text-xs font-medium" style={{ color: sm.cor }}>
                  {sm.emoji} {sm.label}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-3 px-5 py-4 text-sm">
            {isSocio ? (
              <>
                <DataRow label="Custo produto" value={`-${formatarMoeda(venda.custoProduto)}`} mono />
                <DataRow label="Custo embalagem" value={`-${formatarMoeda(venda.custoEmbalagem)}`} mono />
                <DataRow label="Imposto" value={`-${formatarMoeda(venda.custoImposto)}`} mono />
                <DataRow label="Comissão" value={`-${formatarMoeda(venda.custoComissao)}`} mono />
                <div className="border-t border-[#E4E4E7] pt-3 dark:border-[#27272A]">
                  <DataRow label="Total" value={formatarMoeda(venda.valorTotal)} mono bold />
                  <div className="mt-3">
                    <DataRow label="Lucro líquido" value={formatarMoeda(venda.lucroLimpo)} mono accent />
                  </div>
                  <div className="mt-3">
                    <DataRow label="Margem real" value={formatarPercent(margem)} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <DataRow label="Total da venda" value={formatarMoeda(venda.valorTotal)} mono bold />
                <div className="border-t border-[#E4E4E7] pt-3 dark:border-[#27272A]">
                  <DataRow label="Sua comissão" value={formatarMoeda(venda.custoComissao)} mono accent />
                  <div className="mt-3">
                    <DataRow label="Comissão/metro" value={formatarMoeda(venda.custoComissao / venda.metros)} mono />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Atualizar status */}
      {venda.status !== StatusVenda.CANCELADO && (
        <div className="mb-4 rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
          <div className="border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272A]">
            <p className="text-sm font-semibold text-[#232021] dark:text-white">Atualizar status</p>
          </div>
          <div className="px-5 py-4">
            <AtualizarStatus vendaId={venda.id} statusAtual={venda.status} statusDisponiveis={statusDisponiveis} />
          </div>
        </div>
      )}

      {/* Link público */}
      {venda.shareToken && <LinkPublico shareToken={venda.shareToken} />}

      {/* Apagar orçamento — só sócio */}
      {isSocio && venda.status === StatusVenda.ORCAMENTO && (
        <DeletarVenda vendaId={venda.id} numero={venda.numero} />
      )}
    </div>
  );
}

function DataRow({
  label, value, mono, bold, accent,
}: {
  label: string; value: string;
  mono?: boolean; bold?: boolean; accent?: boolean;
}) {
  const valCls = [
    "text-right",
    mono ? "font-mono tabular-nums" : "",
    bold ? "font-semibold text-[#232021] dark:text-white" : "text-[#52525B] dark:text-[#A1A1AA]",
    accent ? "!text-[#047857] font-semibold" : "",
  ].join(" ");

  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-[#71717A]">{label}</span>
      <span className={valCls}>{value}</span>
    </div>
  );
}
