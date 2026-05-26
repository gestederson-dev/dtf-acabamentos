import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, StatusVenda } from "@prisma/client";
import Link from "next/link";
import { formatarMoeda, formatarPercent } from "@/lib/pricing";
import {
  startOfMonth, endOfMonth, startOfDay, endOfDay,
  startOfWeek, endOfWeek, format,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { VendasFiltros } from "./vendas-filtros";

const STATUS_BADGE: Record<StatusVenda, { label: string; cls: string }> = {
  ORCAMENTO:  { label: "Orçamento",  cls: "border-[#E4E4E7] bg-white text-[#52525B]" },
  CONFIRMADO: { label: "Confirmado", cls: "border-[#232021] bg-[#232021] text-white" },
  ENTREGUE:   { label: "Entregue",   cls: "border-[#E4E4E7] bg-[#F4F4F5] text-[#52525B]" },
  PAGO:       { label: "Pago",       cls: "border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]" },
  CANCELADO:  { label: "Cancelado",  cls: "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]" },
};

type Periodo = "dia" | "semana" | "mes" | "custom";

interface Props {
  searchParams: {
    periodo?: string;
    mes?: string;
    dia?: string;
    semana?: string;
    de?: string;
    ate?: string;
    status?: string;
    busca?: string;
  };
}

function parseLocal(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default async function VendasPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const isSocio = session?.user?.role === Role.SOCIO;

  const periodo = (searchParams.periodo ?? "mes") as Periodo;
  const today = new Date();

  const diaParam = searchParams.dia ?? format(today, "yyyy-MM-dd");
  const semanaParam = searchParams.semana ?? format(today, "yyyy-MM-dd");
  const mesParam = searchParams.mes ?? format(today, "yyyy-MM");
  const deParam = searchParams.de ?? format(startOfMonth(today), "yyyy-MM-dd");
  const ateParam = searchParams.ate ?? format(endOfMonth(today), "yyyy-MM-dd");
  const statusFiltro = searchParams.status as StatusVenda | undefined;
  const busca = searchParams.busca ?? "";

  let inicio: Date;
  let fim: Date;
  let periodoLabel: string;

  if (periodo === "dia") {
    const d = parseLocal(diaParam);
    inicio = startOfDay(d);
    fim = endOfDay(d);
    periodoLabel = format(d, "EEEE, dd 'de' MMMM", { locale: ptBR });
  } else if (periodo === "semana") {
    const ref = parseLocal(semanaParam);
    inicio = startOfWeek(ref, { weekStartsOn: 1 });
    fim = endOfWeek(ref, { weekStartsOn: 1 });
    periodoLabel = `${format(inicio, "dd/MM")} – ${format(fim, "dd/MM/yyyy")}`;
  } else if (periodo === "custom") {
    inicio = startOfDay(parseLocal(deParam));
    fim = endOfDay(parseLocal(ateParam));
    periodoLabel = `${format(inicio, "dd/MM/yyyy")} – ${format(fim, "dd/MM/yyyy")}`;
  } else {
    const refDate = parseLocal(mesParam + "-01");
    inicio = startOfMonth(refDate);
    fim = endOfMonth(refDate);
    periodoLabel = format(refDate, "MMMM yyyy", { locale: ptBR });
  }

  const where = {
    data: { gte: inicio, lte: fim },
    ...(statusFiltro ? { status: statusFiltro } : {}),
    ...(!isSocio && session?.user?.id ? { vendedorId: session.user.id } : {}),
    ...(busca ? {
      OR: [
        { clienteNomeAvulso: { contains: busca, mode: "insensitive" as const } },
        { cliente: { nome: { contains: busca, mode: "insensitive" as const } } },
      ],
    } : {}),
  };

  const statusConfirmados = [StatusVenda.CONFIRMADO, StatusVenda.ENTREGUE, StatusVenda.PAGO];

  // KPIs sempre baseados no período, sem filtro de status do dropdown
  const wherePeriodo = {
    data: { gte: inicio, lte: fim },
    ...(!isSocio && session?.user?.id ? { vendedorId: session.user.id } : {}),
    ...(busca ? {
      OR: [
        { clienteNomeAvulso: { contains: busca, mode: "insensitive" as const } },
        { cliente: { nome: { contains: busca, mode: "insensitive" as const } } },
      ],
    } : {}),
  };

  const [vendas, totaisConf, totaisOrc] = await Promise.all([
    prisma.venda.findMany({
      where,
      orderBy: { data: "desc" },
      include: { cliente: true, produto: true, vendedor: true },
    }),
    prisma.venda.aggregate({
      where: { ...wherePeriodo, status: { in: statusConfirmados } },
      _sum: { valorTotal: true, lucroLimpo: true, custoComissao: true, metros: true },
      _count: { id: true },
    }),
    prisma.venda.aggregate({
      where: { ...wherePeriodo, status: StatusVenda.ORCAMENTO },
      _sum: { valorTotal: true, custoComissao: true, metros: true },
      _count: { id: true },
    }),
  ]);

  const fat      = totaisConf._sum.valorTotal ?? 0;
  const lucro    = totaisConf._sum.lucroLimpo ?? 0;
  const comissao = totaisConf._sum.custoComissao ?? 0;
  const metros   = totaisConf._sum.metros ?? 0;
  const nVendas  = totaisConf._count.id;
  const margem   = fat > 0 ? lucro / fat : 0;

  const fatOrc      = totaisOrc._sum.valorTotal ?? 0;
  const comissaoOrc = totaisOrc._sum.custoComissao ?? 0;
  const metrosOrc   = totaisOrc._sum.metros ?? 0;
  const nOrc        = totaisOrc._count.id;


  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-10">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#232021] dark:text-white">Vendas</h1>
          <p className="mt-0.5 text-sm capitalize text-[#71717A]">{periodoLabel}</p>
        </div>
        <Link
          href="/vendas/nova"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-[#232021] px-4 text-sm font-medium text-white transition-colors hover:bg-[#3F3F46] active:scale-[0.98] dark:bg-white dark:text-[#232021] dark:hover:bg-[#F4F4F5]"
        >
          + Nova venda
        </Link>
      </div>

      {/* KPIs — Vendas fechadas */}
      <div className="mb-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#71717A]">Vendas fechadas</p>
        <div className={`grid gap-4 ${isSocio ? "grid-cols-2 md:grid-cols-5" : "grid-cols-2 md:grid-cols-4"}`}>
          {isSocio ? (
            <>
              <KpiCard label="Faturamento" value={formatarMoeda(fat)} sub={`${nVendas} venda${nVendas !== 1 ? "s" : ""}`} />
              <KpiCard label="Custos" value={formatarMoeda(fat - lucro)} />
              <KpiCard label="Lucro" value={formatarMoeda(lucro)} accent />
              <KpiCard label="Margem" value={formatarPercent(margem)} accent={margem >= 0.35} warning={margem < 0.35 && margem > 0} />
              <KpiCard label="Ticket médio" value={nVendas > 0 ? formatarMoeda(fat / nVendas) : "R$ 0,00"} className="col-span-2 md:col-span-1" />
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
      </div>

      {/* KPIs — Orçamentos em aberto */}
      {nOrc > 0 && (
        <div className="mb-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#A1A1AA]">Orçamentos em aberto</p>
          <div className={`grid gap-4 ${isSocio ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2"}`}>
            <KpiCard label="Orçamentos" value={String(nOrc)} sub="aguardando confirmação" muted />
            <KpiCard label="Valor em aberto" value={formatarMoeda(fatOrc)} muted />
            {isSocio && <KpiCard label="Metros em aberto" value={`${metrosOrc.toFixed(1)} m`} muted className="col-span-2 md:col-span-1" />}
            {!isSocio && comissaoOrc > 0 && <KpiCard label="Comissão potencial" value={formatarMoeda(comissaoOrc)} muted className="col-span-2" />}
          </div>
        </div>
      )}
      {nOrc === 0 && <div className="mb-8" />}

      {/* Filtros */}
      <VendasFiltros
        periodo={periodo}
        diaParam={diaParam}
        semanaParam={semanaParam}
        mesParam={mesParam}
        deParam={deParam}
        ateParam={ateParam}
        statusParam={statusFiltro ?? ""}
        buscaParam={busca}
      />

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
                  {isSocio && <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#71717A] xl:table-cell">Vendedor</th>}
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
                        <td className="max-w-[120px] truncate px-4 py-3 font-medium text-[#232021] sm:max-w-[200px] dark:text-white">{v.cliente?.nome ?? v.clienteNomeAvulso ?? "—"}</td>
                        <td className="hidden px-4 py-3 text-[#71717A] sm:table-cell">{v.produto.nome} {v.comEmbalagem ? "c/emb" : "s/emb"}</td>
                        <td className="hidden px-4 py-3 text-right font-mono tabular-nums text-[#71717A] md:table-cell">{v.metros} m</td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums font-medium text-[#232021] dark:text-white">{formatarMoeda(v.valorTotal)}</td>
                        {isSocio && <td className="hidden px-4 py-3 text-right font-mono tabular-nums text-[#047857] lg:table-cell">{formatarMoeda(v.lucroLimpo)}</td>}
                        {!isSocio && <td className="hidden px-4 py-3 text-right font-mono tabular-nums text-[#047857] lg:table-cell">{formatarMoeda(v.custoComissao)}</td>}
                        {isSocio && <td className="hidden px-4 py-3 text-[#71717A] xl:table-cell">{v.vendedor.name ?? "—"}</td>}
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

function KpiCard({ label, value, sub, accent, warning, muted, className }: {
  label: string; value: string; sub?: string;
  accent?: boolean; warning?: boolean; muted?: boolean; className?: string;
}) {
  const valueColor = accent
    ? "text-[#047857]"
    : warning
    ? "text-[#B45309]"
    : muted
    ? "text-[#71717A] dark:text-[#A1A1AA]"
    : "text-[#232021] dark:text-white";

  return (
    <div className={`relative overflow-hidden rounded-md border p-4 ${muted ? "border-[#E4E4E7] bg-[#FAFAFA] dark:border-[#27272A] dark:bg-[#111318]" : "border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]"} ${className ?? ""}`}>
      <span className={`absolute bottom-3 left-0 top-3 w-[3px] ${muted ? "bg-[#E4E4E7] dark:bg-[#27272A]" : "bg-[#232021] dark:bg-white"}`} />
      <p className="text-[10px] font-medium uppercase tracking-wider text-[#71717A]">{label}</p>
      <p className={`mt-1.5 font-mono text-base sm:text-xl font-semibold tabular-nums ${valueColor}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[10px] text-[#A1A1AA]">{sub}</p>}
    </div>
  );
}
