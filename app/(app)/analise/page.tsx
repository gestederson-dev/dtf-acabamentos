import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { dadosSazonalidade, topClientes, vendasPorProduto, rankingVendedores } from "@/lib/dados-dashboard";
import { AnaliseClient } from "./analise-client";

export default async function AnalisePage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== Role.SOCIO) redirect("/dashboard");

  const config = await prisma.configuracao.findFirst();
  const produtos = await prisma.produto.findMany({ where: { ativo: true } });

  const [sazonalidade, clientes, porProduto, vendedores] = await Promise.all([
    dadosSazonalidade(12),
    topClientes(10),
    vendasPorProduto(),
    rankingVendedores(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-10">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-[#232021] dark:text-white">Análise</h1>
        <p className="mt-0.5 text-sm text-[#71717A]">Visão aprofundada do negócio</p>
      </div>
      <AnaliseClient
        sazonalidade={sazonalidade}
        clientes={clientes}
        porProduto={porProduto}
        vendedores={vendedores}
        config={config}
        produtos={produtos}
      />
    </div>
  );
}
