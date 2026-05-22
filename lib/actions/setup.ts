"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function setupInicial(formData: FormData) {
  const count = await prisma.user.count();
  if (count > 0) redirect("/login");

  const nome = (formData.get("nome") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const senha = formData.get("senha") as string;

  if (!nome || !email || !senha || senha.length < 6) {
    throw new Error("Preencha todos os campos (senha mínimo 6 caracteres)");
  }

  const hash = await bcrypt.hash(senha, 10);

  const configExiste = await prisma.configuracao.findFirst();
  if (!configExiste) {
    await prisma.configuracao.create({
      data: {
        percentLucro: 0.40,
        percentComissao: 0.06,
        percentImposto: 0.08,
        custoEmbalagem: 10.00,
        pecasPorCaixa: 20,
        descontoMaximoLivre: 0.05,
        freteGratisAcimaCx: 5,
        tetoMEIAnual: 81000.00,
      },
    });
  }

  await prisma.produto.upsert({
    where: { larguraCm: 21 },
    create: { nome: "Pingadeira 21 cm", larguraCm: 21, custoUnitario: 8.00 },
    update: {},
  });

  await prisma.produto.upsert({
    where: { larguraCm: 19 },
    create: { nome: "Pingadeira 19 cm", larguraCm: 19, custoUnitario: 7.24 },
    update: {},
  });

  await prisma.user.create({
    data: { name: nome, email, password: hash, role: Role.SOCIO },
  });

  redirect("/login");
}
