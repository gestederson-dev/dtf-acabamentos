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
    <div className="mx-auto max-w-2xl px-4 py-6 lg:px-8 lg:py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-[#232021] dark:text-white">Configurações</h1>
        <p className="mt-0.5 text-sm text-[#71717A]">Parâmetros financeiros e política comercial da DTF</p>
      </div>

      <ConfigForm config={config} />

      <div className="mt-6 rounded-md border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 dark:border-[#78350F]/40 dark:bg-[#78350F]/10">
        <p className="text-xs text-[#B45309] dark:text-[#FCD34D]">
          Mudar essas configurações afeta o preço sugerido nas próximas vendas. Vendas já registradas mantêm o valor original.
        </p>
      </div>
    </div>
  );
}
