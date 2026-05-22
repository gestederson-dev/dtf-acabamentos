import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, StatusVenda } from "@prisma/client";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatarMoeda, formatarPercent, statusMargem } from "@/lib/pricing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AtualizarStatus } from "./atualizar-status";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STATUS_BADGE: Record<StatusVenda, { label: string; class: string }> = {
  ORCAMENTO: { label: "Orçamento", class: "bg-zinc-100 text-zinc-700" },
  CONFIRMADO: { label: "Confirmado", class: "bg-blue-50 text-blue-700" },
  ENTREGUE: { label: "Entregue", class: "bg-purple-50 text-purple-700" },
  PAGO: { label: "Pago", class: "bg-green-50 text-[#065F46]" },
  CANCELADO: { label: "Cancelado", class: "bg-red-50 text-red-700" },
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

  // Vendedor só vê próprias vendas
  if (!isSocio && venda.vendedorId !== session!.user.id) notFound();

  const sb = STATUS_BADGE[venda.status];
  const margem = venda.valorTotal > 0 ? venda.lucroLimpo / venda.valorTotal : 0;
  const sm = statusMargem(margem);
  const nomeCliente = venda.cliente?.nome ?? venda.clienteNomeAvulso ?? "—";

  const statusDisponiveis = Object.values(StatusVenda).filter((s) => s !== venda.status);

  return (
    <div className="p-6 max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/vendas" className="text-zinc-400 hover:text-zinc-700 text-sm">← Vendas</Link>
          </div>
          <h1 className="text-xl font-bold text-zinc-900">Venda #{venda.numero}</h1>
          <p className="text-sm text-zinc-500">{format(venda.data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${sb.class}`}>{sb.label}</span>
      </div>

      {/* Info principal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Dados da venda</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Cliente" value={nomeCliente} />
            <Row label="Produto" value={`${venda.produto.nome} ${venda.comEmbalagem ? "c/ embalagem" : "s/ embalagem"}`} />
            <Row label="Metragem" value={`${venda.metros} m (${venda.pecas} peças)`} />
            <Row label="Preço/metro" value={formatarMoeda(venda.precoUnitario)} />
            {venda.descontoPercent > 0 && <Row label="Desconto" value={formatarPercent(venda.descontoPercent)} />}
            <Row label="Forma de pagamento" value={FORMA_LABEL[venda.formaPagamento] ?? venda.formaPagamento} />
            <Row label="Vendedor" value={venda.vendedor.name ?? "—"} />
            {venda.observacao && <Row label="Observação" value={venda.observacao} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              {isSocio ? "Anatomia financeira" : "Resultado"}
              {isSocio && <span className="text-xs font-normal" style={{ color: sm.cor }}>{sm.emoji} {sm.label}</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {isSocio ? (
              <>
                <Row label="Faturamento bruto" value={formatarMoeda(venda.valorTotal + venda.descontoPercent * (venda.valorTotal / (1 - venda.descontoPercent)))} />
                <Row label="Custo produto" value={`-${formatarMoeda(venda.custoProduto)}`} />
                <Row label="Custo embalagem" value={`-${formatarMoeda(venda.custoEmbalagem)}`} />
                <Row label="Imposto" value={`-${formatarMoeda(venda.custoImposto)}`} />
                <Row label="Comissão" value={`-${formatarMoeda(venda.custoComissao)}`} />
                <div className="border-t border-zinc-100 pt-2">
                  <Row label="TOTAL" value={formatarMoeda(venda.valorTotal)} bold />
                  <Row label="💰 Lucro líquido" value={formatarMoeda(venda.lucroLimpo)} highlight />
                  <Row label="Margem real" value={formatarPercent(margem)} />
                </div>
              </>
            ) : (
              <>
                <Row label="Total da venda" value={formatarMoeda(venda.valorTotal)} bold />
                <Row label="Sua comissão" value={formatarMoeda(venda.custoComissao)} highlight />
                <Row label="Comissão/metro" value={formatarMoeda(venda.custoComissao / venda.metros)} />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Atualizar status */}
      {venda.status !== StatusVenda.CANCELADO && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Atualizar status</CardTitle></CardHeader>
          <CardContent>
            <AtualizarStatus vendaId={venda.id} statusAtual={venda.status} statusDisponiveis={statusDisponiveis} />
          </CardContent>
        </Card>
      )}

      {/* Link público */}
      {venda.shareToken && (
        <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm">
          <span className="text-zinc-500 flex-1 truncate">
            /o/{venda.shareToken}
          </span>
          <Button
            type="button"
            className="h-7 text-xs px-3 shrink-0"
            onClick={() => {
              // handled client-side via component if needed
            }}
          >
            Copiar link
          </Button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold, highlight }: { label: string; value: string; bold?: boolean; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-zinc-500 shrink-0">{label}</span>
      <span className={`text-right tabular-nums ${bold ? "font-bold" : ""} ${highlight ? "font-semibold text-[#065F46]" : ""}`}>{value}</span>
    </div>
  );
}
