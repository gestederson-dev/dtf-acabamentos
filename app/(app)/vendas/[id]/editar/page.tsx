import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, StatusVenda } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { EditarVendaClient } from "./editar-client";

export default async function EditarVendaPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== Role.SOCIO) redirect(`/vendas/${params.id}`);

  const [venda, config, produtos, clientes] = await Promise.all([
    prisma.venda.findUnique({
      where: { id: params.id },
      include: { cliente: true, produto: true },
    }),
    prisma.configuracao.findFirst(),
    prisma.produto.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
  ]);

  if (!venda) notFound();
  if (venda.status !== StatusVenda.ORCAMENTO) redirect(`/vendas/${params.id}`);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-10">
      <div className="mb-8">
        <a href={`/vendas/${params.id}`} className="mb-3 inline-flex items-center gap-1 text-sm text-[#71717A] transition-colors hover:text-[#232021] dark:hover:text-white">
          ← Voltar
        </a>
        <h1 className="text-xl font-semibold tracking-tight text-[#232021] dark:text-white">
          Editar Orçamento #{String(venda.numero).padStart(3, "0")}
        </h1>
      </div>
      <EditarVendaClient
        vendaId={venda.id}
        config={config}
        produtos={produtos}
        clientes={clientes}
        inicial={{
          produtoId: venda.produtoId,
          comEmbalagem: venda.comEmbalagem,
          metros: String(venda.metros),
          desconto: String(venda.descontoPercent * 100),
          forma: venda.formaPagamento,
          clienteId: venda.clienteId ?? "",
          clienteAvulso: venda.clienteNomeAvulso ?? "",
          observacao: venda.observacao ?? "",
        }}
      />
    </div>
  );
}
