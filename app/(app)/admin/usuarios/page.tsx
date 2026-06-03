import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { NovoUsuarioForm } from "./novo-usuario-form";
import { UsuarioActions } from "./usuario-actions";
import { ResetSenha } from "./reset-senha";

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== Role.SOCIO) redirect("/dashboard");

  const usuarios = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:px-8 lg:py-10">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-[#232021] dark:text-white">Usuários</h1>
        <p className="mt-0.5 text-sm text-[#71717A]">{usuarios.length} usuário{usuarios.length !== 1 ? "s" : ""} cadastrado{usuarios.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Lista */}
      <div className="mb-6 space-y-3">
        {usuarios.map((u) => (
          <div key={u.id} className="rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
            <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`font-semibold ${u.ativo ? "text-[#232021] dark:text-white" : "text-[#A1A1AA]"}`}>
                    {u.name ?? "—"}
                  </p>
                  <span className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-medium ${
                    u.role === Role.SOCIO
                      ? "border-[#232021] bg-[#232021] text-white dark:border-white dark:bg-white dark:text-[#232021]"
                      : "border-[#E4E4E7] bg-[#F4F4F5] text-[#52525B] dark:border-[#27272A] dark:bg-[#27272A] dark:text-[#A1A1AA]"
                  }`}>
                    {u.role === Role.SOCIO ? "Sócio" : "Vendedor"}
                  </span>
                  {!u.ativo && (
                    <span className="inline-flex items-center rounded-sm border border-[#FECACA] bg-[#FEF2F2] px-2 py-0.5 text-[10px] font-medium text-[#B91C1C]">
                      Inativo
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm text-[#71717A]">{u.email}</p>
              </div>
              {session.user.id !== u.id && (
                <div className="flex flex-wrap items-center gap-2">
                  <ResetSenha userId={u.id} />
                  <UsuarioActions userId={u.id} ativo={u.ativo} isSelf={false} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Formulário novo usuário */}
      <div className="rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
        <div className="border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272A]">
          <p className="text-sm font-semibold text-[#232021] dark:text-white">Adicionar usuário</p>
        </div>
        <div className="px-5 py-4">
          <NovoUsuarioForm />
        </div>
      </div>
    </div>
  );
}
