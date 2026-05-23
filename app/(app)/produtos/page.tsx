import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { ToggleAtivo } from "./toggle-ativo";
import { EditarCusto } from "./editar-custo";

export default async function ProdutosPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== Role.SOCIO) redirect("/dashboard");

  const produtos = await prisma.produto.findMany({ orderBy: { larguraCm: "desc" } });

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:px-8 lg:py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-[#232021] dark:text-white">Produtos</h1>
        <p className="mt-0.5 text-sm text-[#71717A]">{produtos.length} produto{produtos.length !== 1 ? "s" : ""} cadastrado{produtos.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="space-y-3">
        {produtos.map((p) => (
          <div key={p.id} className="rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className={`font-semibold ${p.ativo ? "text-[#232021] dark:text-white" : "text-[#A1A1AA]"}`}>
                  {p.nome}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#71717A]">
                  <span>Custo unitário:</span>
                  <EditarCusto produtoId={p.id} custoAtual={p.custoUnitario} />
                  <span>· {p.larguraCm} cm</span>
                </div>
              </div>
              <ToggleAtivo produtoId={p.id} ativo={p.ativo} />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-[#A1A1AA]">
        Para alterar custos, use a página Calculadora de Preço.
      </p>
    </div>
  );
}
