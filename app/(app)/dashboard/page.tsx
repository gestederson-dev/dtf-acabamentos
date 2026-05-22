import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, StatusVenda } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatarMoeda, formatarPercent } from "@/lib/pricing";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { dadosMensais, dadosComissaoSemanal } from "@/lib/dados-dashboard";
import { GraficoLucroMensal } from "@/components/charts/grafico-lucro-mensal";
import { GraficoComissaoSemanal } from "@/components/charts/grafico-comissao-semanal";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const isSocio = session?.user?.role === Role.SOCIO;

  const inicioMes = startOfMonth(new Date());
  const fimMes = endOfMonth(new Date());

  const whereBase = {
    data: { gte: inicioMes, lte: fimMes },
    status: { not: StatusVenda.CANCELADO },
    ...(isSocio ? {} : { vendedorId: session!.user.id }),
  };

  const [vendas, totais, config] = await Promise.all([
    prisma.venda.findMany({
      where: whereBase,
      orderBy: { data: "desc" },
      take: 5,
      include: { cliente: true, produto: true },
    }),
    prisma.venda.aggregate({
      where: whereBase,
      _sum: { valorTotal: true, lucroLimpo: true, custoComissao: true, metros: true },
      _count: { id: true },
    }),
    prisma.configuracao.findFirst(),
  ]);

  const faturamento = totais._sum.valorTotal ?? 0;
  const lucro = totais._sum.lucroLimpo ?? 0;
  const comissao = totais._sum.custoComissao ?? 0;
  const metros = totais._sum.metros ?? 0;
  const numVendas = totais._count.id;
  const margem = faturamento > 0 ? lucro / faturamento : 0;

  // Alerta MEI (faturamento anual)
  const anoAtual = new Date().getFullYear();
  const faturamentoAnual = await prisma.venda.aggregate({
    where: {
      data: { gte: new Date(`${anoAtual}-01-01`), lte: new Date(`${anoAtual}-12-31`) },
      status: { not: StatusVenda.CANCELADO },
    },
    _sum: { valorTotal: true },
  });
  const fatAnual = faturamentoAnual._sum.valorTotal ?? 0;
  const tetoMEI = config?.tetoMEIAnual ?? 81000;
  const percentMEI = fatAnual / tetoMEI;

  // Dados para gráficos
  const [grafMensal, grafComissao] = await Promise.all([
    isSocio ? dadosMensais(6) : Promise.resolve([]),
    !isSocio ? dadosComissaoSemanal(session!.user.id, 8) : Promise.resolve([]),
  ]);

  const mesLabel = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500 capitalize">{mesLabel}</p>
      </div>

      {/* Alertas MEI */}
      {isSocio && percentMEI > 0.7 && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium border ${percentMEI > 0.9
          ? "bg-red-50 text-red-800 border-red-200"
          : "bg-yellow-50 text-yellow-800 border-yellow-200"}`}>
          {percentMEI > 0.9 ? "🚨" : "⚠️"} Faturamento anual: {formatarMoeda(fatAnual)} ({formatarPercent(percentMEI)} do teto MEI de {formatarMoeda(tetoMEI)})
        </div>
      )}
      {isSocio && margem > 0 && margem < 0.30 && (
        <div className="rounded-lg px-4 py-3 text-sm font-medium bg-yellow-50 text-yellow-800 border border-yellow-200">
          ⚠️ Margem média do mês: {formatarPercent(margem)} — abaixo de 30%
        </div>
      )}

      {/* KPIs */}
      <div className={`grid gap-4 ${isSocio ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-3"}`}>
        {isSocio ? (
          <>
            <KpiCard title="Faturamento" value={formatarMoeda(faturamento)} sub={`${numVendas} venda${numVendas !== 1 ? "s" : ""}`} />
            <KpiCard title="Custos" value={formatarMoeda(faturamento - lucro)} />
            <KpiCard title="Lucro Líquido" value={formatarMoeda(lucro)} highlight />
            <KpiCard
              title="Margem"
              value={formatarPercent(margem)}
              highlight={margem >= 0.35}
              warning={margem < 0.35 && margem >= 0.25}
              danger={margem > 0 && margem < 0.25}
            />
          </>
        ) : (
          <>
            <KpiCard title="Vendas do Mês" value={numVendas.toString()} sub={`${metros.toFixed(1)} m`} />
            <KpiCard title="Comissão" value={formatarMoeda(comissao)} highlight />
            <KpiCard title="Ticket Médio" value={numVendas > 0 ? formatarMoeda(faturamento / numVendas) : "R$ 0,00"} />
          </>
        )}
      </div>

      {/* Gráficos */}
      {isSocio && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Lucro Líquido — últimos 6 meses</CardTitle>
            <p className="text-xs text-zinc-400">Verde escuro ≥35% · Amarelo 25–35% · Vermelho &lt;25%</p>
          </CardHeader>
          <CardContent className="pt-0">
            <GraficoLucroMensal dados={grafMensal} />
          </CardContent>
        </Card>
      )}

      {!isSocio && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Comissão semanal — últimas 8 semanas</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <GraficoComissaoSemanal dados={grafComissao} />
          </CardContent>
        </Card>
      )}

      {/* Últimas vendas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-700">Últimas vendas</h2>
          <Link href="/vendas" className="text-xs text-zinc-500 hover:text-zinc-900 underline">Ver todas</Link>
        </div>
        {vendas.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-sm border border-dashed border-zinc-200 rounded-lg">
            Nenhuma venda no mês.{" "}
            <Link href="/vendas/nova" className="text-zinc-700 underline">Registrar venda</Link>
          </div>
        ) : (
          <div className="border border-zinc-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-zinc-600">#</th>
                  <th className="text-left px-4 py-2 font-medium text-zinc-600">Cliente</th>
                  <th className="text-left px-4 py-2 font-medium text-zinc-600 hidden sm:table-cell">Produto</th>
                  <th className="text-right px-4 py-2 font-medium text-zinc-600 tabular-nums">Total</th>
                  {isSocio && <th className="text-right px-4 py-2 font-medium text-zinc-600 tabular-nums hidden md:table-cell">Lucro</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {vendas.map((v) => (
                  <Link key={v.id} href={`/vendas/${v.id}`} legacyBehavior>
                    <tr className="hover:bg-zinc-50 cursor-pointer">
                      <td className="px-4 py-2.5 text-zinc-500">#{v.numero}</td>
                      <td className="px-4 py-2.5 font-medium">{v.cliente?.nome ?? v.clienteNomeAvulso ?? "—"}</td>
                      <td className="px-4 py-2.5 text-zinc-500 hidden sm:table-cell">{v.produto.nome}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-medium">{formatarMoeda(v.valorTotal)}</td>
                      {isSocio && <td className="px-4 py-2.5 text-right tabular-nums text-[#065F46] hidden md:table-cell">{formatarMoeda(v.lucroLimpo)}</td>}
                    </tr>
                  </Link>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ title, value, sub, highlight, warning, danger }: {
  title: string; value: string; sub?: string;
  highlight?: boolean; warning?: boolean; danger?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-1 pt-4 px-4">
        <CardTitle className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <p className={`text-2xl font-bold tabular-nums ${highlight ? "text-[#065F46]" : warning ? "text-[#D97706]" : danger ? "text-[#DC2626]" : "text-zinc-900"}`}>
          {value}
        </p>
        {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}
