import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { OrcamentoClient } from "./orcamento-client";

export default async function OrcamentoPage() {
  const session = await getServerSession(authOptions);
  const isSocio = session?.user?.role === Role.SOCIO;

  const [config, produtos, clientes] = await Promise.all([
    prisma.configuracao.findFirst(),
    prisma.produto.findMany({ where: { ativo: true }, orderBy: { larguraCm: "desc" } }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-10">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-[#232021] dark:text-white">Orçamento</h1>
        <p className="mt-0.5 text-sm text-[#71717A]">Simule uma venda e gere o texto para WhatsApp</p>
      </div>
      <OrcamentoClient config={config} produtos={produtos} clientes={clientes} isSocio={isSocio} />
    </div>
  );
}
