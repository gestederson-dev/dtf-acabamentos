import { prisma } from "@/lib/prisma";
import { NovoClienteForm } from "./novo-cliente-form";

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({ orderBy: { nome: "asc" } });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-10">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#232021] dark:text-white">Clientes</h1>
          <p className="mt-0.5 text-sm text-[#71717A]">
            {clientes.length} cadastrado{clientes.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Formulário novo cliente */}
      <div className="mb-6 rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
        <div className="border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272A]">
          <p className="text-sm font-semibold text-[#232021] dark:text-white">Novo cliente</p>
        </div>
        <div className="px-5 py-4">
          <NovoClienteForm />
        </div>
      </div>

      {/* Listagem */}
      {clientes.length === 0 ? (
        <div className="rounded-md border border-dashed border-[#E4E4E7] py-16 text-center dark:border-[#27272A]">
          <p className="text-sm text-[#71717A]">Nenhum cliente cadastrado ainda.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-[#E4E4E7] dark:border-[#27272A]">
          <table className="w-full text-sm">
            <thead className="border-b border-[#E4E4E7] bg-[#FAFAFA] dark:border-[#27272A] dark:bg-[#18181B]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#71717A]">Nome</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#71717A] sm:table-cell">Empresa</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#71717A] md:table-cell">Telefone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F4F5] dark:divide-[#27272A]">
              {clientes.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-[#FAFAFA] dark:hover:bg-[#27272A]/40">
                  <td className="px-4 py-3 font-medium text-[#232021] dark:text-white">{c.nome}</td>
                  <td className="hidden px-4 py-3 text-[#71717A] sm:table-cell">{c.empresa ?? "—"}</td>
                  <td className="hidden px-4 py-3 text-[#71717A] md:table-cell">{c.telefone ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
