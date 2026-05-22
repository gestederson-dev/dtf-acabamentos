import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { dadosSazonalidade, topClientes, vendasPorProduto } from "@/lib/dados-dashboard";
import { AnaliseClient } from "./analise-client";

export default async function AnalisePage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== Role.SOCIO) redirect("/dashboard");

  const config = await prisma.configuracao.findFirst();
  const produtos = await prisma.produto.findMany({ where: { ativo: true } });

  const [sazonalidade, clientes, porProduto] = await Promise.all([
    dadosSazonalidade(12),
    topClientes(10),
    vendasPorProduto(),
  ]);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Análise</h1>
        <p className="text-sm text-zinc-500">Visão aprofundada do negócio</p>
      </div>
      <AnaliseClient
        sazonalidade={sazonalidade}
        clientes={clientes}
        porProduto={porProduto}
        config={config}
        produtos={produtos}
      />
    </div>
  );
}
