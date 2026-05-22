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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Calculadora de Preço</h1>
        <p className="text-sm text-zinc-500">Simule preços a partir do custo de produção</p>
      </div>
      <CalculadoraClient config={config} produtos={produtos} />
    </div>
  );
}
