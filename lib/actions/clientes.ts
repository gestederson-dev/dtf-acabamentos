"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  nome: z.string().min(1),
  empresa: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  cnpjCpf: z.string().optional(),
});

export async function criarCliente(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Não autenticado");

  const data = schema.parse({
    nome: formData.get("nome"),
    empresa: formData.get("empresa") || undefined,
    telefone: formData.get("telefone") || undefined,
    email: formData.get("email") || undefined,
    cnpjCpf: formData.get("cnpjCpf") || undefined,
  });

  await prisma.cliente.create({ data });
  revalidatePath("/clientes");
}
