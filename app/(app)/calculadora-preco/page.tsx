import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { CalculadoraClient } from "./calculadora-client";

export default async function CalculadoraPrecoPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== Role.SOCIO) redirect("/dashboard");

  const [config, produtos] = await Promise.all([
    prisma.configuracao.findFirst(),
    prisma.produto.findMany({ where: { ativo: true }, orderBy: { larguraCm: "desc" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-10">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-[#232021] dark:text-white">Calculadora de Preço</h1>
        <p className="mt-0.5 text-sm text-[#71717A]">Simule preços a partir do custo de produção</p>
      </div>
      <CalculadoraClient config={config} produtos={produtos} />
    </div>
  );
}
