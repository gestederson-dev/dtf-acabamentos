import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { NovaVendaClient } from "./nova-venda-client";

export default async function NovaVendaPage() {
  const session = await getServerSession(authOptions);
  const isSocio = session?.user?.role === Role.SOCIO;

  const [config, produtos, clientes] = await Promise.all([
    prisma.configuracao.findFirst(),
    prisma.produto.findMany({ where: { ativo: true }, orderBy: { larguraCm: "desc" } }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Nova Venda</h1>
        <p className="text-sm text-zinc-500">Registre uma venda ou orçamento</p>
      </div>
      <NovaVendaClient config={config} produtos={produtos} clientes={clientes} isSocio={isSocio} />
    </div>
  );
}
