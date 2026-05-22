import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, StatusVenda } from "@prisma/client";
import Link from "next/link";
import { formatarMoeda, formatarPercent } from "@/lib/pricing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_BADGE: Record<StatusVenda, { label: string; class: string }> = {
  ORCAMENTO: { label: "Orçamento", class: "bg-zinc-100 text-zinc-700" },
  CONFIRMADO: { label: "Confirmado", class: "bg-blue-50 text-blue-700" },
  ENTREGUE: { label: "Entregue", class: "bg-purple-50 text-purple-700" },
  PAGO: { label: "Pago", class: "bg-green-50 text-[#065F46]" },
  CANCELADO: { label: "Cancelado", class: "bg-red-50 text-red-700" },
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
    ...(!isSocio ? { vendedorId: session!.user.id } : {}),
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
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Vendas</h1>
          <p className="text-sm text-zinc-500 capitalize">{mesLabel}</p>
        </div>
        <Link href="/vendas/nova">
          <Button>+ Nova venda</Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className={`grid gap-3 ${isSocio ? "grid-cols-2 md:grid-cols-5" : "grid-cols-2 md:grid-cols-4"}`}>
        {isSocio ? (
          <>
            <KpiCard label="Faturamento" value={formatarMoeda(fat)} />
            <KpiCard label="Custos" value={formatarMoeda(fat - lucro)} />
            <KpiCard label="Lucro líquido" value={formatarMoeda(lucro)} green />
            <KpiCard label="Margem" value={formatarPercent(margem)} green={margem >= 0.35} yellow={margem < 0.35 && margem > 0} />
            <KpiCard label="Vendas" value={String(nVendas)} />
          </>
        ) : (
          <>
            <KpiCard label="Vendas" value={String(nVendas)} />
            <KpiCard label="Comissão" value={formatarMoeda(comissao)} green />
            <KpiCard label="Metros" value={`${metros.toFixed(1)} m`} />
            <KpiCard label="Ticket médio" value={nVendas > 0 ? formatarMoeda(fat / nVendas) : "R$ 0,00"} />
          </>
        )}
      </div>

      {/* Filtros */}
      <form className="flex flex-wrap gap-2 items-center">
        <input
          name="mes"
          type="month"
          defaultValue={mesParam ?? format(new Date(), "yyyy-MM")}
          className="h-9 rounded-md border border-zinc-200 px-3 text-sm bg-white"
        />
        <select
          name="status"
          defaultValue={statusFiltro ?? ""}
          className="h-9 rounded-md border border-zinc-200 px-3 text-sm bg-white"
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
          className="h-9 rounded-md border border-zinc-200 px-3 text-sm bg-white flex-1 min-w-[160px]"
        />
        <Button type="submit" className="h-9 text-sm px-4">Filtrar</Button>
      </form>

      {/* Tabela */}
      {vendas.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 text-sm border border-dashed border-zinc-200 rounded-lg">
          Nenhuma venda no período.{" "}
          <Link href="/vendas/nova" className="text-zinc-700 underline">Registrar agora</Link>
        </div>
      ) : (
        <div className="border border-zinc-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-zinc-600">#</th>
                <th className="text-left px-4 py-2.5 font-medium text-zinc-600">Data</th>
                <th className="text-left px-4 py-2.5 font-medium text-zinc-600">Cliente</th>
                <th className="text-left px-4 py-2.5 font-medium text-zinc-600 hidden sm:table-cell">Produto</th>
                <th className="text-right px-4 py-2.5 font-medium text-zinc-600 tabular-nums hidden md:table-cell">Metros</th>
                <th className="text-right px-4 py-2.5 font-medium text-zinc-600 tabular-nums">Total</th>
                {isSocio && <th className="text-right px-4 py-2.5 font-medium text-zinc-600 tabular-nums hidden lg:table-cell">Lucro</th>}
                {!isSocio && <th className="text-right px-4 py-2.5 font-medium text-zinc-600 tabular-nums hidden lg:table-cell">Comissão</th>}
                <th className="text-left px-4 py-2.5 font-medium text-zinc-600">Status</th>
                {isSocio && <th className="text-left px-4 py-2.5 font-medium text-zinc-600 hidden xl:table-cell">Vendedor</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {vendas.map((v) => {
                const sb = STATUS_BADGE[v.status];
                return (
                  <tr key={v.id} className="hover:bg-zinc-50 cursor-pointer" onClick={() => { window.location.href = `/vendas/${v.id}`; }}>
                    <td className="px-4 py-3 text-zinc-500">#{v.numero}</td>
                    <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">{format(v.data, "dd/MM/yy")}</td>
                    <td className="px-4 py-3 font-medium max-w-[140px] truncate">{v.cliente?.nome ?? v.clienteNomeAvulso ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-500 hidden sm:table-cell">{v.produto.nome} {v.comEmbalagem ? "c/emb" : "s/emb"}</td>
                    <td className="px-4 py-3 text-right tabular-nums hidden md:table-cell">{v.metros} m</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">{formatarMoeda(v.valorTotal)}</td>
                    {isSocio && <td className="px-4 py-3 text-right tabular-nums text-[#065F46] hidden lg:table-cell">{formatarMoeda(v.lucroLimpo)}</td>}
                    {!isSocio && <td className="px-4 py-3 text-right tabular-nums text-[#065F46] hidden lg:table-cell">{formatarMoeda(v.custoComissao)}</td>}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${sb.class}`}>{sb.label}</span>
                    </td>
                    {isSocio && <td className="px-4 py-3 text-zinc-500 hidden xl:table-cell">{v.vendedor.name}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, green, yellow }: { label: string; value: string; green?: boolean; yellow?: boolean }) {
  return (
    <Card>
      <CardHeader className="px-4 pt-3 pb-1">
        <CardTitle className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">{label}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <p className={`text-lg font-bold tabular-nums ${green ? "text-[#065F46]" : yellow ? "text-[#D97706]" : "text-zinc-900"}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
