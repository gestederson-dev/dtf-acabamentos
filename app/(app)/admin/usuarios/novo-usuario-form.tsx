"use client";

import { useState, useTransition } from "react";
import { criarUsuario } from "@/lib/actions/users";
import { useToast } from "@/hooks/use-toast";

const fieldCls = "h-10 w-full rounded-md border border-[#E4E4E7] bg-white px-3 text-sm text-[#232021] focus:outline-none focus:ring-1 focus:ring-[#232021] focus:border-[#232021] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white";
const labelCls = "mb-1.5 block text-xs font-medium text-[#71717A]";

export function NovoUsuarioForm() {
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  const [key, setKey] = useState(0);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await criarUsuario(fd);
        toast({ title: "Usuário criado com sucesso" });
        setKey((k) => k + 1);
      } catch (err: unknown) {
        toast({ title: err instanceof Error ? err.message : "Erro ao criar", variant: "destructive" });
      }
    });
  }

  return (
    <form key={key} onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Nome completo</label>
          <input name="nome" type="text" required className={fieldCls} />
        </div>
        <div>
          <label className={labelCls}>E-mail</label>
          <input name="email" type="email" required className={fieldCls} />
        </div>
        <div>
          <label className={labelCls}>Senha</label>
          <input name="senha" type="password" required minLength={6} className={fieldCls} />
        </div>
        <div>
          <label className={labelCls}>Perfil</label>
          <select name="role" className={fieldCls}>
            <option value="VENDEDOR">Vendedor</option>
            <option value="SOCIO">Sócio</option>
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-10 rounded-md bg-[#232021] px-6 text-sm font-medium text-white hover:opacity-80 disabled:opacity-40 dark:bg-white dark:text-[#232021]"
      >
        {pending ? "Criando..." : "Criar usuário"}
      </button>
    </form>
  );
}
