import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatarMoeda } from "@/lib/pricing";
import { addDays } from "date-fns";

const FORMA_LABEL: Record<string, string> = {
  PIX: "PIX", BOLETO: "Boleto", DINHEIRO: "Dinheiro",
  CARTAO_1X: "Cartão 1x", CARTAO_2X: "Cartão 2x", CARTAO_3X: "Cartão 3x",
};

export default async function OrcamentoPublicoPage({ params }: { params: { shareToken: string } }) {
  const venda = await prisma.venda.findUnique({
    where: { shareToken: params.shareToken },
    include: { produto: true, cliente: true },
  });
  if (!venda) notFound();

  const validade = addDays(venda.criadoEm, 7);
  const expirado = new Date() > validade;
  const nomeCliente = venda.cliente?.nome ?? venda.clienteNomeAvulso ?? "Cliente";
  const nomeProduto = `${venda.produto.nome} ${venda.comEmbalagem ? "c/ embalagem" : "s/ embalagem"}`;
  const telefone = "5545999999999"; // número DTF — configurar depois
  const textoWA = encodeURIComponent(
    `Olá! Tenho interesse no orçamento da DTF Acabamentos:\n${nomeProduto}\n${venda.metros}m — TOTAL: ${formatarMoeda(venda.valorTotal)}`
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-5">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900">DTF Acabamentos</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Pingadeiras de qualidade</p>
        </div>

        {/* Card orçamento */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-700">Orçamento #{venda.numero}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${expirado ? "bg-red-50 text-red-600" : "bg-green-50 text-[#065F46]"}`}>
              {expirado ? "Expirado" : "Válido"}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Cliente</span>
              <span className="font-medium">{nomeCliente}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Produto</span>
              <span className="font-medium text-right">{nomeProduto}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Metragem</span>
              <span className="tabular-nums">{venda.metros} m ({venda.pecas} peças)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Preço/metro</span>
              <span className="tabular-nums">{formatarMoeda(venda.precoUnitario)}</span>
            </div>
            {venda.descontoPercent > 0 && (
              <div className="flex justify-between">
                <span className="text-zinc-500">Desconto</span>
                <span className="tabular-nums text-[#065F46]">-{formatarMoeda(venda.valorTotal * venda.descontoPercent / (1 - venda.descontoPercent))}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-500">Pagamento</span>
              <span>{FORMA_LABEL[venda.formaPagamento] ?? venda.formaPagamento}</span>
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-zinc-900">TOTAL</span>
              <span className="text-2xl font-bold tabular-nums text-zinc-900">{formatarMoeda(venda.valorTotal)}</span>
            </div>
          </div>
        </div>

        {/* Validade */}
        <p className="text-center text-xs text-zinc-400">
          {expirado
            ? `Orçamento expirado em ${format(validade, "dd/MM/yyyy")}`
            : `Válido até ${format(validade, "dd 'de' MMMM", { locale: ptBR })}`}
        </p>

        {/* CTA WhatsApp */}
        {!expirado && (
          <a
            href={`https://wa.me/${telefone}?text=${textoWA}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366] text-white font-semibold text-sm hover:bg-[#1ebe5d] transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.118 1.523 5.852L.057 23.928a.75.75 0 00.916.914l6.143-1.47A11.948 11.948 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.739 9.739 0 01-4.985-1.368l-.357-.213-3.703.886.9-3.626-.233-.374A9.75 9.75 0 1112 21.75z"/>
            </svg>
            Falar no WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
