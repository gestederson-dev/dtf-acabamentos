import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { ConfigForm } from "./config-form";

export default async function ConfiguracoesPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== Role.SOCIO) redirect("/dashboard");

  const config = await prisma.configuracao.findFirst();

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Configurações</h1>
        <p className="text-sm text-zinc-500">Parâmetros financeiros e política comercial da DTF</p>
      </div>
      <ConfigForm config={config} />
      <p className="text-xs text-zinc-400 border border-zinc-200 rounded-md p-3 bg-zinc-50">
        ⚠️ Mudar essas configurações afeta o preço sugerido nas próximas vendas. Vendas já registradas mantêm o valor original.
      </p>
    </div>
  );
}
