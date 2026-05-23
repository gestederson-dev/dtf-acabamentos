"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, StatusVenda, FormaPagamento } from "@prisma/client";
import { calcularAnatomiaVenda, calcularPrecoPorPeca, calcularPrecoPorMetro, arredondarMetragem } from "@/lib/pricing";

export async function salvarVenda(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Não autenticado");

  const config = await prisma.configuracao.findFirst();
  if (!config) throw new Error("Configure os parâmetros primeiro");

  const metrosRaw = Number(formData.get("metros"));
  const metros = arredondarMetragem(metrosRaw);
  const descontoPercent = Number(formData.get("descontoPercent")) / 100;
  const comEmbalagem = formData.get("comEmbalagem") === "true";
  const status = (formData.get("status") as StatusVenda) || StatusVenda.ORCAMENTO;

  // Validar desconto por role
  if (session.user.role === Role.VENDEDOR && descontoPercent > config.descontoMaximoLivre) {
    throw new Error(`Desconto acima de ${config.descontoMaximoLivre * 100}% precisa de autorização do sócio`);
  }

  const produto = await prisma.produto.findUnique({ where: { id: String(formData.get("produtoId")) } });
  if (!produto) throw new Error("Produto não encontrado");

  const embPorPeca = comEmbalagem ? config.custoEmbalagem / config.pecasPorCaixa : 0;
  const pvPeca = calcularPrecoPorPeca(produto.custoUnitario, embPorPeca, config.percentLucro, config.percentComissao, config.percentImposto);
  const pvMetro = calcularPrecoPorMetro(pvPeca);

  const anatomia = calcularAnatomiaVenda({
    metros,
    precoPorMetro: pvMetro,
    descontoPercent,
    custoUnitario: produto.custoUnitario,
    custoEmbalagemPeca: embPorPeca,
    comEmbalagem,
    percentImposto: config.percentImposto,
    percentComissao: config.percentComissao,
  });

  // Margem mínima absoluta — bloquear prejuízo
  if (anatomia.margemReal < 0) throw new Error("Venda em prejuízo não permitida");

  // Próximo número
  const ultima = await prisma.venda.findFirst({ orderBy: { numero: "desc" } });
  const numero = (ultima?.numero ?? 0) + 1;

  const clienteId = formData.get("clienteId") as string | null;
  const clienteNomeAvulso = formData.get("clienteNomeAvulso") as string | null;

  const venda = await prisma.venda.create({
    data: {
      numero,
      data: new Date(),
      vendedorId: session.user.id,
      clienteId: clienteId || undefined,
      clienteNomeAvulso: clienteNomeAvulso || undefined,
      produtoId: produto.id,
      comEmbalagem,
      metros,
      pecas: metros * 4,
      precoUnitario: pvMetro,
      descontoPercent,
      valorTotal: anatomia.valorVenda,
      custoProduto: anatomia.custoProduto,
      custoEmbalagem: anatomia.custoEmbalagem,
      custoImposto: anatomia.custoImposto,
      custoComissao: anatomia.custoComissao,
      lucroLimpo: anatomia.lucroLimpo,
      status,
      formaPagamento: (formData.get("formaPagamento") as FormaPagamento) || FormaPagamento.PIX,
      observacao: (formData.get("observacao") as string) || undefined,
      shareToken: `dtf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    },
  });

  revalidatePath("/vendas");
  revalidatePath("/dashboard");
  redirect(`/vendas/${venda.id}`);
}

export async function atualizarStatusVenda(vendaId: string, status: StatusVenda) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Não autenticado");

  const venda = await prisma.venda.findUnique({
    where: { id: vendaId },
    select: { vendedorId: true, dataConfirmado: true },
  });
  if (!venda) throw new Error("Venda não encontrada");

  const isSocio = session.user.role === Role.SOCIO;
  if (!isSocio && venda.vendedorId !== session.user.id) throw new Error("Sem permissão");

  const dataConfirmado =
    status === StatusVenda.CONFIRMADO && !venda.dataConfirmado ? new Date() : undefined;

  await prisma.venda.update({
    where: { id: vendaId },
    data: { status, ...(dataConfirmado ? { dataConfirmado } : {}) },
  });
  revalidatePath(`/vendas/${vendaId}`);
  revalidatePath("/vendas");
  revalidatePath("/dashboard");
}
