"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function criarUsuario(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== Role.SOCIO) throw new Error("Sem permissão");

  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const senha = String(formData.get("senha") ?? "");
  const role = formData.get("role") === "SOCIO" ? Role.SOCIO : Role.VENDEDOR;

  if (!nome || !email || senha.length < 6) throw new Error("Preencha todos os campos (senha mínimo 6 caracteres)");

  const existe = await prisma.user.findUnique({ where: { email } });
  if (existe) throw new Error("Este e-mail já está cadastrado");

  const hash = await bcrypt.hash(senha, 12);
  await prisma.user.create({ data: { name: nome, email, password: hash, role, ativo: true } });

  revalidatePath("/admin/usuarios");
}

export async function criarPrimeiroSocio(formData: FormData) {
  const total = await prisma.user.count({ where: { role: Role.SOCIO } });
  if (total > 0) throw new Error("Já existe um sócio cadastrado");

  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const senha = String(formData.get("senha") ?? "");

  if (!nome || !email || senha.length < 6) throw new Error("Preencha todos os campos (senha mínimo 6 caracteres)");

  const hash = await bcrypt.hash(senha, 12);
  await prisma.user.upsert({
    where: { email },
    update: { password: hash, role: Role.SOCIO, ativo: true, name: nome },
    create: { name: nome, email, password: hash, role: Role.SOCIO, ativo: true },
  });
}

export async function toggleAtivoUsuario(userId: string, ativo: boolean) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== Role.SOCIO) throw new Error("Sem permissão");
  if (session.user.id === userId) throw new Error("Não é possível desativar a própria conta");

  await prisma.user.update({ where: { id: userId }, data: { ativo } });
  revalidatePath("/admin/usuarios");
}

export async function alterarSenhaUsuario(userId: string, novaSenha: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== Role.SOCIO) throw new Error("Sem permissão");
  if (novaSenha.length < 6) throw new Error("Senha mínimo 6 caracteres");

  const hash = await bcrypt.hash(novaSenha, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hash } });
  revalidatePath("/admin/usuarios");
}
