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
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Orçamento</h1>
        <p className="text-sm text-zinc-500">Simule uma venda e gere o texto para WhatsApp</p>
      </div>
      <OrcamentoClient config={config} produtos={produtos} clientes={clientes} isSocio={isSocio} />
    </div>
  );
}
