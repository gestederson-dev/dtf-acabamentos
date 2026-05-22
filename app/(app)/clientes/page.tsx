import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NovoClienteForm } from "./novo-cliente-form";

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({ orderBy: { nome: "asc" } });

  return (
    <div className="p-6 max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900">Clientes</h1>
        <span className="text-sm text-zinc-500">{clientes.length} cadastrado{clientes.length !== 1 ? "s" : ""}</span>
      </div>

      <NovoClienteForm />

      {clientes.length === 0 ? (
        <div className="text-center py-12 text-zinc-400 text-sm border border-dashed border-zinc-200 rounded-lg">
          Nenhum cliente cadastrado ainda.
        </div>
      ) : (
        <div className="border border-zinc-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-zinc-600">Nome</th>
                <th className="text-left px-4 py-2.5 font-medium text-zinc-600 hidden sm:table-cell">Empresa</th>
                <th className="text-left px-4 py-2.5 font-medium text-zinc-600 hidden md:table-cell">Telefone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {clientes.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium">{c.nome}</td>
                  <td className="px-4 py-3 text-zinc-500 hidden sm:table-cell">{c.empresa ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-500 hidden md:table-cell">{c.telefone ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
