import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, StatusVenda } from "@prisma/client";
import Link from "next/link";
import { formatarMoeda, formatarPercent } from "@/lib/pricing";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_BADGE: Record<StatusVenda, { label: string; cls: string }> = {
  ORCAMENTO:  { label: "Orçamento",  cls: "border-[#E4E4E7] bg-white text-[#52525B]" },
  CONFIRMADO: { label: "Confirmado", cls: "border-[#232021] bg-[#232021] text-white" },
  ENTREGUE:   { label: "Entregue",   cls: "border-[#E4E4E7] bg-[#F4F4F5] text-[#52525B]" },
  PAGO:       { label: "Pago",       cls: "border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]" },
  CANCELADO:  { label: "Cancelado",  cls: "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]" },
};

interface Props {
  searchParams: { mes?: string; status?: string; busca?: string };
}

export default async function VendasPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const isSocio = session?.user?.role === Role.SOCIO;

  const mesParam = searchParams.mes;
  const refDate = mesParam ? new Date(mesParam + "-01") : new Date();
  const inicio = startOfMonth(refDate);
  const fim = endOfMonth(refDate);
  const statusFiltro = searchParams.status as StatusVenda | undefined;
  const busca = searchParams.busca;

  const where = {
    data: { gte: inicio, lte: fim },
    ...(statusFiltro ? { status: statusFiltro } : {}),
    ...(!isSocio && session?.user?.id ? { vendedorId: session.user.id } : {}),
    ...(busca ? {
      OR: [
        { clienteNomeAvulso: { contains: busca } },
        { cliente: { nome: { contains: busca } } },
      ],
    } : {}),
  };

  const [vendas, totais] = await Promise.all([
    prisma.venda.findMany({
      where,
      orderBy: { data: "desc" },
      include: { cliente: true, produto: true, vendedor: true },
    }),
    prisma.venda.aggregate({
      where: { ...where, status: { not: StatusVenda.CANCELADO } },
      _sum: { valorTotal: true, lucroLimpo: true, custoComissao: true, metros: true },
      _count: { id: true },
    }),
  ]);

  const fat = totais._sum.valorTotal ?? 0;
  const lucro = totais._sum.lucroLimpo ?? 0;
  const comissao = totais._sum.custoComissao ?? 0;
  const metros = totais._sum.metros ?? 0;
  const nVendas = totais._count.id;
  const margem = fat > 0 ? lucro / fat : 0;
  const mesLabel = format(refDate, "MMMM yyyy", { locale: ptBR });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-10">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#232021] dark:text-white">Vendas</h1>
          <p className="mt-0.5 text-sm capitalize text-[#71717A]">{mesLabel}</p>
        </div>
        <Link
          href="/vendas/nova"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-[#232021] px-4 text-sm font-medium text-white transition-colors hover:bg-[#3F3F46] active:scale-[0.98] dark:bg-white dark:text-[#232021] dark:hover:bg-[#F4F4F5]"
        >
          + Nova venda
        </Link>
      </div>

      {/* KPIs */}
      <div className={`mb-8 grid gap-4 ${isSocio ? "grid-cols-2 md:grid-cols-5" : "grid-cols-2 md:grid-cols-4"}`}>
        {isSocio ? (
          <>
            <KpiCard label="Faturamento" value={formatarMoeda(fat)} />
            <KpiCard label="Custos" value={formatarMoeda(fat - lucro)} />
            <KpiCard label="Lucro" value={formatarMoeda(lucro)} accent />
            <KpiCard label="Margem" value={formatarPercent(margem)} accent={margem >= 0.35} warning={margem < 0.35 && margem > 0} />
            <KpiCard label="Vendas" value={String(nVendas)} />
          </>
        ) : (
          <>
            <KpiCard label="Vendas" value={String(nVendas)} />
            <KpiCard label="Comissão" value={formatarMoeda(comissao)} accent />
            <KpiCard label="Metros" value={`${metros.toFixed(1)} m`} />
            <KpiCard label="Ticket médio" value={nVendas > 0 ? formatarMoeda(fat / nVendas) : "R$ 0,00"} />
          </>
        )}
      </div>

      {/* Filtros */}
      <form className="mb-6 flex flex-wrap items-center gap-2">
        <input
          name="mes"
          type="month"
          defaultValue={mesParam ?? format(new Date(), "yyyy-MM")}
          className="h-10 rounded-md border border-[#E4E4E7] bg-white px-3 text-sm text-[#232021] focus:outline-none focus:ring-1 focus:ring-[#232021] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white"
        />
        <select
          name="status"
          defaultValue={statusFiltro ?? ""}
          className="h-10 rounded-md border border-[#E4E4E7] bg-white px-3 text-sm text-[#232021] focus:outline-none focus:ring-1 focus:ring-[#232021] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white"
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_BADGE).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <input
          name="busca"
          type="text"
          defaultValue={busca ?? ""}
          placeholder="Buscar cliente..."
          className="h-10 min-w-[160px] flex-1 rounded-md border border-[#E4E4E7] bg-white px-3 text-sm text-[#232021] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-[#232021] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white"
        />
        <button
          type="submit"
          className="h-10 rounded-md border border-[#E4E4E7] bg-white px-4 text-sm font-medium text-[#232021] transition-colors hover:bg-[#F4F4F5] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white dark:hover:bg-[#27272A]"
        >
          Filtrar
        </button>
      </form>

      {/* Tabela */}
      {vendas.length === 0 ? (
        <div className="rounded-md border border-dashed border-[#E4E4E7] py-16 text-center dark:border-[#27272A]">
          <p className="text-sm text-[#71717A]">Nenhuma venda no período.</p>
          <Link href="/vendas/nova" className="mt-2 inline-block text-sm font-medium text-[#232021] underline-offset-2 hover:underline dark:text-white">
            Registrar agora →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-[#E4E4E7] dark:border-[#27272A]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#E4E4E7] bg-[#FAFAFA] dark:border-[#27272A] dark:bg-[#18181B]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#71717A]">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#71717A]">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#71717A]">Cliente</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#71717A] sm:table-cell">Produto</th>
                  <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#71717A] md:table-cell">Metros</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#71717A]">Total</th>
                  {isSocio && <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#71717A] lg:table-cell">Lucro</th>}
                  {!isSocio && <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#71717A] lg:table-cell">Comissão</th>}
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#71717A]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F4F5] dark:divide-[#27272A]">
                {vendas.map((v) => {
                  const sb = STATUS_BADGE[v.status];
                  return (
                    <Link key={v.id} href={`/vendas/${v.id}`} legacyBehavior>
                      <tr className="cursor-pointer transition-colors hover:bg-[#FAFAFA] dark:hover:bg-[#27272A]/40">
                        <td className="px-4 py-3 font-mono text-xs text-[#A1A1AA]">#{v.numero}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-[#71717A]">{format(v.data, "dd/MM/yy")}</td>
                        <td className="max-w-[140px] truncate px-4 py-3 font-medium text-[#232021] dark:text-white">{v.cliente?.nome ?? v.clienteNomeAvulso ?? "—"}</td>
                        <td className="hidden px-4 py-3 text-[#71717A] sm:table-cell">{v.produto.nome} {v.comEmbalagem ? "c/emb" : "s/emb"}</td>
                        <td className="hidden px-4 py-3 text-right font-mono tabular-nums text-[#71717A] md:table-cell">{v.metros} m</td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums font-medium text-[#232021] dark:text-white">{formatarMoeda(v.valorTotal)}</td>
                        {isSocio && <td className="hidden px-4 py-3 text-right font-mono tabular-nums text-[#047857] lg:table-cell">{formatarMoeda(v.lucroLimpo)}</td>}
                        {!isSocio && <td className="hidden px-4 py-3 text-right font-mono tabular-nums text-[#047857] lg:table-cell">{formatarMoeda(v.custoComissao)}</td>}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium ${sb.cls}`}>{sb.label}</span>
                        </td>
                      </tr>
                    </Link>
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

function KpiCard({ label, value, accent, warning }: { label: string; value: string; accent?: boolean; warning?: boolean }) {
  const valueColor = accent ? "text-[#047857]" : warning ? "text-[#B45309]" : "text-[#232021] dark:text-white";
  return (
    <div className="relative overflow-hidden rounded-md border border-[#E4E4E7] bg-white p-4 dark:border-[#27272A] dark:bg-[#18181B]">
      <span className="absolute bottom-3 left-0 top-3 w-[3px] bg-[#232021] dark:bg-white" />
      <p className="text-[10px] font-medium uppercase tracking-wider text-[#71717A]">{label}</p>
      <p className={`mt-1.5 font-mono text-xl font-semibold tabular-nums ${valueColor}`}>{value}</p>
    </div>
  );
}
