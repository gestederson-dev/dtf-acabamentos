import { prisma } from "@/lib/prisma";
import { StatusVenda } from "@prisma/client";
import { startOfMonth, endOfMonth, subMonths, format, startOfWeek, endOfWeek, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";

/** Últimos N meses com faturamento, lucro e margem */
export async function dadosMensais(meses = 6) {
  const resultado = [];
  const hoje = new Date();

  for (let i = meses - 1; i >= 0; i--) {
    const ref = subMonths(hoje, i);
    const inicio = startOfMonth(ref);
    const fim = endOfMonth(ref);

    const agg = await prisma.venda.aggregate({
      where: { data: { gte: inicio, lte: fim }, status: { not: StatusVenda.CANCELADO } },
      _sum: { valorTotal: true, lucroLimpo: true },
    });

    const fat = agg._sum.valorTotal ?? 0;
    const lucro = agg._sum.lucroLimpo ?? 0;

    resultado.push({
      mes: format(ref, "MMM/yy", { locale: ptBR }),
      faturamento: fat,
      lucro,
      margem: fat > 0 ? lucro / fat : 0,
    });
  }
  return resultado;
}

/** Últimas N semanas de comissão de um vendedor */
export async function dadosComissaoSemanal(vendedorId: string, semanas = 8) {
  const resultado = [];
  const hoje = new Date();

  for (let i = semanas - 1; i >= 0; i--) {
    const ref = subWeeks(hoje, i);
    const inicio = startOfWeek(ref, { weekStartsOn: 1 });
    const fim = endOfWeek(ref, { weekStartsOn: 1 });

    const agg = await prisma.venda.aggregate({
      where: {
        vendedorId,
        data: { gte: inicio, lte: fim },
        status: { not: StatusVenda.CANCELADO },
      },
      _sum: { custoComissao: true },
    });

    resultado.push({
      semana: format(inicio, "dd/MM", { locale: ptBR }),
      comissao: agg._sum.custoComissao ?? 0,
    });
  }
  return resultado;
}

/** Top 10 clientes por faturamento */
export async function topClientes(limite = 10) {
  const vendas = await prisma.venda.findMany({
    where: { status: { not: StatusVenda.CANCELADO }, clienteId: { not: null } },
    include: { cliente: true },
  });

  const mapa = new Map<string, { nome: string; faturamento: number; lucro: number; vendas: number }>();

  for (const v of vendas) {
    if (!v.clienteId || !v.cliente) continue;
    const atual = mapa.get(v.clienteId) ?? { nome: v.cliente.nome, faturamento: 0, lucro: 0, vendas: 0 };
    mapa.set(v.clienteId, {
      nome: atual.nome,
      faturamento: atual.faturamento + v.valorTotal,
      lucro: atual.lucro + v.lucroLimpo,
      vendas: atual.vendas + 1,
    });
  }

  return Array.from(mapa.values())
    .sort((a, b) => b.faturamento - a.faturamento)
    .slice(0, limite)
    .map((c) => ({ ...c, margem: c.faturamento > 0 ? c.lucro / c.faturamento : 0 }));
}

/** Vendas por variação de produto */
export async function vendasPorProduto() {
  const variações = [
    { produtoNome: "Pingadeira 21 cm", comEmbalagem: true, label: "P21 c/emb" },
    { produtoNome: "Pingadeira 21 cm", comEmbalagem: false, label: "P21 s/emb" },
    { produtoNome: "Pingadeira 19 cm", comEmbalagem: true, label: "P19 c/emb" },
    { produtoNome: "Pingadeira 19 cm", comEmbalagem: false, label: "P19 s/emb" },
  ];

  const produtos = await prisma.produto.findMany();

  const resultado = await Promise.all(
    variações.map(async (v) => {
      const produto = produtos.find((p) => p.nome === v.produtoNome);
      if (!produto) return { label: v.label, metros: 0, faturamento: 0, vendas: 0 };

      const agg = await prisma.venda.aggregate({
        where: {
          produtoId: produto.id,
          comEmbalagem: v.comEmbalagem,
          status: { not: StatusVenda.CANCELADO },
        },
        _sum: { metros: true, valorTotal: true },
        _count: { id: true },
      });

      return {
        label: v.label,
        metros: agg._sum.metros ?? 0,
        faturamento: agg._sum.valorTotal ?? 0,
        vendas: agg._count.id,
      };
    })
  );

  return resultado;
}

/** Dados mensais dos últimos 12 meses para sazonalidade */
export async function dadosSazonalidade(meses = 12) {
  return dadosMensais(meses);
}
