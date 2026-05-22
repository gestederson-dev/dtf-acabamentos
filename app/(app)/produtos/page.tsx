import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { formatarMoeda } from "@/lib/pricing";
import { ToggleAtivo } from "./toggle-ativo";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProdutosPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== Role.SOCIO) redirect("/dashboard");

  const produtos = await prisma.produto.findMany({ orderBy: { larguraCm: "desc" } });

  return (
    <div className="p-6 max-w-2xl space-y-5">
      <h1 className="text-xl font-bold text-zinc-900">Produtos</h1>
      <div className="space-y-3">
        {produtos.map((p) => (
          <Card key={p.id}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-zinc-900">{p.nome}</p>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    Custo unitário: <span className="tabular-nums font-medium text-zinc-700">{formatarMoeda(p.custoUnitario)}/peça</span>
                  </p>
                  <p className="text-sm text-zinc-500">Largura: {p.larguraCm} cm</p>
                </div>
                <ToggleAtivo produtoId={p.id} ativo={p.ativo} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-zinc-400">Para alterar custos, use a página Calculadora de Preço.</p>
    </div>
  );
}
