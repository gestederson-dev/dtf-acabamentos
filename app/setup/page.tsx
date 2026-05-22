import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { setupInicial } from "@/lib/actions/setup";

export default async function SetupPage() {
  const count = await prisma.user.count();
  if (count > 0) redirect("/login");

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-zinc-200 shadow-sm p-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">DTF Acabamentos</h1>
          <p className="text-sm text-zinc-500 mt-1">Configuração inicial — crie a conta do sócio</p>
        </div>

        <form action={setupInicial} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Nome completo</label>
            <input
              name="nome"
              required
              placeholder="Ex: João Silva"
              className="w-full h-10 rounded-md border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">E-mail</label>
            <input
              name="email"
              type="email"
              required
              placeholder="socio@empresa.com.br"
              className="w-full h-10 rounded-md border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700">Senha (mín. 6 caracteres)</label>
            <input
              name="senha"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full h-10 rounded-md border border-zinc-200 px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <button
            type="submit"
            className="w-full h-10 bg-zinc-900 text-white rounded-md text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            Criar conta e configurar sistema
          </button>
        </form>

        <p className="text-xs text-zinc-400 text-center">
          Esta página só aparece uma vez. Após criar a conta, acesse o sistema normalmente.
        </p>
      </div>
    </div>
  );
}
