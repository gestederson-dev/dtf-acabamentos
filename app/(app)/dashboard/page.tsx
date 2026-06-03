import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, StatusVenda } from "@prisma/client";
import { formatarMoeda, formatarPercent } from "@/lib/pricing";
import { startOfMonth, endOfMonth, startOfDay, endOfDay, subMonths, startOfYear, endOfYear, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { dadosMensais, dadosSazonalidade } from "@/lib/dados-dashboard";
import { GraficoLucroMensal } from "@/components/charts/grafico-lucro-mensal";
import { DashboardSections } from "./dashboard-sections";
import { DashboardFiltros } from "./dashboard-filtros";
import Link from "next/link";

interface Props {
  searchParams: { periodo?: string; mes?: string };
}

export default async function DashboardPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const isSocio = session?.user?.role === Role.SOCIO;

  const periodo = searchParams.periodo ?? "mes";
  const mesCustom = searchParams.mes;
  const today = new Date();

  // Calcula o intervalo dos KPIs baseado no filtro
  let inicioKPI: Date;
  let fimKPI: Date;
  let periodoLabel: string;

  if (periodo === "custom" && mesCustom) {
    const [y, m] = mesCustom.split("-").map(Number);
    const ref = new Date(y, m - 1);
    inicioKPI = startOfMonth(ref);
    fimKPI = endOfMonth(ref);
    periodoLabel = format(ref, "MMMM 'de' yyyy", { locale: ptBR });
  } else if (periodo === "mes_passado") {
    const ref = subMonths(today, 1);
    inicioKPI = startOfMonth(ref);
    fimKPI = endOfMonth(ref);
    periodoLabel = format(ref, "MMMM 'de' yyyy", { locale: ptBR });
  } else if (periodo === "3m") {
    inicioKPI = startOfDay(subMonths(today, 3));
    fimKPI = endOfDay(today);
    periodoLabel = "últimos 3 meses";
  } else if (periodo === "6m") {
    inicioKPI = startOfDay(subMonths(today, 6));
    fimKPI = endOfDay(today);
    periodoLabel = "últimos 6 meses";
  } else if (periodo === "ano") {
    inicioKPI = startOfYear(today);
    fimKPI = endOfYear(today);
    periodoLabel = `ano de ${today.getFullYear()}`;
  } else {
    inicioKPI = startOfMonth(today);
    fimKPI = endOfMonth(today);
    periodoLabel = format(today, "MMMM 'de' yyyy", { locale: ptBR });
  }

  const statusConfirmados = [StatusVenda.CONFIRMADO, StatusVenda.ENTREGUE, StatusVenda.PAGO];

  // KPIs: apenas vendas confirmadas/entregues/pagas (faturamento real)
  const whereBase = {
    data: { gte: inicioKPI, lte: fimKPI },
    status: { in: statusConfirmados },
    ...(isSocio || !session ? {} : { vendedorId: session.user.id }),
  };

  // Orçamentos em aberto no período
  const whereOrcamentos = {
    data: { gte: inicioKPI, lte: fimKPI },
    status: StatusVenda.ORCAMENTO,
    ...(isSocio || !session ? {} : { vendedorId: session.user.id }),
  };

  const whereVendas = {
    data: { gte: startOfMonth(today), lte: endOfMonth(today) },
    ...(isSocio || !session ? {} : { vendedorId: session.user.id }),
  };

  const [vendasRaw, totais, orcamentosTotais, config] = await Promise.all([
    prisma.venda.findMany({
      where: whereVendas,
      orderBy: { data: "desc" },
      include: { cliente: true, produto: true, vendedor: true },
    }),
    prisma.venda.aggregate({
      where: whereBase,
      _sum: { valorTotal: true, lucroLimpo: true, custoComissao: true, metros: true },
      _count: { id: true },
    }),
    prisma.venda.aggregate({
      where: whereOrcamentos,
      _sum: { valorTotal: true },
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

  const numOrcamentos = orcamentosTotais._count.id;
  const valorOrcamentos = orcamentosTotais._sum.valorTotal ?? 0;

  const anoAtual = today.getFullYear();
  const faturamentoAnual = await prisma.venda.aggregate({
    where: {
      data: { gte: new Date(`${anoAtual}-01-01`), lte: new Date(`${anoAtual}-12-31`) },
      status: { in: statusConfirmados },
    },
    _sum: { valorTotal: true },
  });
  const fatAnual = faturamentoAnual._sum.valorTotal ?? 0;
  const tetoMEI = config?.tetoMEIAnual ?? 81000;
  const percentMEI = fatAnual / tetoMEI;

  // Busca 12 meses para o gráfico (cliente filtra 3/6/12 internamente)
  const vendedorId = (!isSocio && session?.user?.id) ? session.user.id : undefined;
  const [grafMensal, grafVendedor] = await Promise.all([
    isSocio ? dadosMensais(12) : Promise.resolve([]),
    vendedorId ? dadosSazonalidade(12, vendedorId) : Promise.resolve([]),
  ]);

  const vendas = vendasRaw.map((v) => ({
    id: v.id,
    numero: v.numero,
    data: format(v.data, "dd/MM", { locale: ptBR }),
    status: v.status,
    valorTotal: v.valorTotal,
    lucroLimpo: v.lucroLimpo,
    custoComissao: v.custoComissao,
    metros: v.metros,
    cliente: v.cliente ? { nome: v.cliente.nome } : null,
    clienteNomeAvulso: v.clienteNomeAvulso,
    produto: { nome: v.produto.nome },
    vendedorNome: v.vendedor.name ?? "—",
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-10">

      {/* Header + filtros */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#232021] dark:text-white">Dashboard</h1>
          <p className="mt-0.5 text-sm capitalize text-[#71717A]">{periodoLabel}</p>
        </div>
        <DashboardFiltros periodoAtivo={periodo} mesCustom={mesCustom} />
      </div>

      {/* Separador decorativo */}
      <div className="mb-8 flex items-center gap-3">
        <span className="h-px flex-1 bg-[#E4E4E7] dark:bg-[#27272A]" />
        <span className="text-[10px] font-medium uppercase tracking-widest text-[#A1A1AA]">Painel · DTF Acabamentos</span>
        <span className="h-px flex-1 bg-[#E4E4E7] dark:bg-[#27272A]" />
      </div>

      {/* Alertas MEI */}
      {isSocio && percentMEI > 0.7 && (
        <div className={`mb-6 rounded-md border px-4 py-3 text-sm font-medium ${
          percentMEI > 0.9
            ? "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]"
            : "border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]"
        }`}>
          {percentMEI > 0.9 ? "🚨" : "⚠️"} Faturamento anual: {formatarMoeda(fatAnual)} ({formatarPercent(percentMEI)} do teto MEI de {formatarMoeda(tetoMEI)})
        </div>
      )}
      {isSocio && margem > 0 && margem < 0.30 && (
        <div className="mb-6 rounded-md border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm font-medium text-[#B45309]">
          ⚠️ Margem média do período: {formatarPercent(margem)} — abaixo de 30%
        </div>
      )}

      {/* Orçamentos em aberto */}
      {numOrcamentos > 0 && (
        <div className="mb-6 flex items-center justify-between rounded-md border border-[#E4E4E7] bg-[#FAFAFA] px-4 py-3 dark:border-[#27272A] dark:bg-[#18181B]">
          <div className="flex items-center gap-2 text-sm text-[#71717A]">
            <span className="h-2 w-2 rounded-full bg-[#A1A1AA]" />
            <span>
              <span className="font-medium text-[#232021] dark:text-white">{numOrcamentos} orçamento{numOrcamentos !== 1 ? "s" : ""} em aberto</span>
              {" · "}{formatarMoeda(valorOrcamentos)} em potencial
            </span>
          </div>
          <Link href="/vendas?status=ORCAMENTO" className="text-xs text-[#71717A] underline-offset-2 hover:text-[#232021] hover:underline dark:hover:text-white">
            Ver →
          </Link>
        </div>
      )}

      {/* KPIs */}
      <div className={`mb-8 grid gap-4 ${isSocio ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-3"}`}>
        {isSocio ? (
          <>
            <KpiCard title="Faturamento" value={formatarMoeda(faturamento)} sub={`${numVendas} venda${numVendas !== 1 ? "s" : ""}`} />
            <KpiCard title="Custos" value={formatarMoeda(faturamento - lucro)} />
            <KpiCard title="Lucro Líquido" value={formatarMoeda(lucro)} accent />
            <KpiCard
              title="Margem"
              value={formatarPercent(margem)}
              accent={margem >= 0.35}
              warning={margem < 0.35 && margem >= 0.25}
              danger={margem > 0 && margem < 0.25}
            />
          </>
        ) : (
          <>
            <KpiCard title="Vendas do Mês" value={numVendas.toString()} sub={`${metros.toFixed(1)} m`} />
            <KpiCard title="Comissão" value={formatarMoeda(comissao)} accent />
            <KpiCard title="Ticket Médio" value={numVendas > 0 ? formatarMoeda(faturamento / numVendas) : "R$ 0,00"} />
          </>
        )}
      </div>

      {/* Gráfico sócio */}
      {isSocio && (
        <div className="mb-8 rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
          <div className="border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272A]">
            <p className="text-sm font-semibold text-[#232021] dark:text-white">Evolução histórica</p>
            <p className="mt-0.5 text-xs text-[#71717A]">Alterne entre lucro e faturamento · selecione o período</p>
          </div>
          <div className="p-5">
            <GraficoLucroMensal dados={grafMensal} />
          </div>
        </div>
      )}

      {/* Gráfico vendedor */}
      {!isSocio && (
        <div className="mb-8 rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
          <div className="border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272A]">
            <p className="text-sm font-semibold text-[#232021] dark:text-white">Evolução histórica</p>
            <p className="mt-0.5 text-xs text-[#71717A]">Alterne entre comissão e faturamento · selecione o período</p>
          </div>
          <div className="p-5">
            <GraficoLucroMensal dados={grafVendedor} lucroLabel="Comissão" />
          </div>
        </div>
      )}

      {/* Seções por status */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#232021] dark:text-white">Vendas do mês</h2>
          <Link href="/vendas" className="text-xs text-[#71717A] underline-offset-2 hover:text-[#232021] hover:underline dark:hover:text-white">
            Ver todas →
          </Link>
        </div>
        {vendas.length === 0 ? (
          <div className="rounded-md border border-dashed border-[#E4E4E7] py-14 text-center dark:border-[#27272A]">
            <p className="text-sm text-[#71717A]">Nenhuma venda registrada este mês.</p>
            <Link href="/vendas/nova" className="mt-2 inline-block text-sm font-medium text-[#232021] underline-offset-2 hover:underline dark:text-white">
              Registrar primeira venda →
            </Link>
          </div>
        ) : (
          <DashboardSections vendas={vendas} isSocio={isSocio} />
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-[#E4E4E7] py-5 dark:border-[#27272A]">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#A1A1AA]">
          <span>DTF Acabamentos · Sistema interno</span>
          <span>v1.0 · {format(new Date(), "MMM yyyy", { locale: ptBR })}</span>
        </div>
      </footer>
    </div>
  );
}

function KpiCard({ title, value, sub, accent, warning, danger }: {
  title: string; value: string; sub?: string;
  accent?: boolean; warning?: boolean; danger?: boolean;
}) {
  const valueColor = accent
    ? "text-[#047857]"
    : warning
    ? "text-[#B45309]"
    : danger
    ? "text-[#B91C1C]"
    : "text-[#232021] dark:text-white";

  return (
    <div className="relative overflow-hidden rounded-md border border-[#E4E4E7] bg-white p-5 dark:border-[#27272A] dark:bg-[#18181B]">
      <span className="absolute bottom-4 left-0 top-4 w-[3px] bg-[#232021] dark:bg-white" />
      <p className="text-xs font-medium uppercase tracking-wider text-[#71717A]">{title}</p>
      <p className={`mt-2 font-mono text-2xl font-semibold tabular-nums ${valueColor}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-[#A1A1AA]">{sub}</p>}
    </div>
  );
}
