"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function toggleProdutoAtivo(produtoId: string, ativo: boolean) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== Role.SOCIO) throw new Error("Sem permissão");
  await prisma.produto.update({ where: { id: produtoId }, data: { ativo } });
  revalidatePath("/produtos");
}
