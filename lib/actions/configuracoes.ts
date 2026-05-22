"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  percentLucro: z.coerce.number().min(0).max(0.99),
  percentComissao: z.coerce.number().min(0).max(0.99),
  percentImposto: z.coerce.number().min(0).max(0.99),
  custoEmbalagem: z.coerce.number().min(0),
  pecasPorCaixa: z.coerce.number().int().min(1),
  descontoMaximoLivre: z.coerce.number().min(0).max(0.99),
  freteGratisAcimaCx: z.coerce.number().int().min(0),
  metaMensalRS: z.coerce.number().min(0).optional(),
  tetoMEIAnual: z.coerce.number().min(0),
});

export async function salvarConfiguracoes(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== Role.SOCIO) throw new Error("Sem permissão");

  const raw = {
    percentLucro: Number(formData.get("percentLucro")) / 100,
    percentComissao: Number(formData.get("percentComissao")) / 100,
    percentImposto: Number(formData.get("percentImposto")) / 100,
    custoEmbalagem: formData.get("custoEmbalagem"),
    pecasPorCaixa: formData.get("pecasPorCaixa"),
    descontoMaximoLivre: Number(formData.get("descontoMaximoLivre")) / 100,
    freteGratisAcimaCx: formData.get("freteGratisAcimaCx"),
    metaMensalRS: formData.get("metaMensalRS") || undefined,
    tetoMEIAnual: formData.get("tetoMEIAnual"),
  };

  const data = schema.parse(raw);

  const existing = await prisma.configuracao.findFirst();
  if (existing) {
    await prisma.configuracao.update({ where: { id: existing.id }, data });
  } else {
    await prisma.configuracao.create({ data });
  }

  revalidatePath("/configuracoes");
  revalidatePath("/calculadora-preco");
  revalidatePath("/orcamento");
}
