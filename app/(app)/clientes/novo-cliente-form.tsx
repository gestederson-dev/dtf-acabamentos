"use client";

import { useState, useTransition } from "react";
import { criarCliente } from "@/lib/actions/clientes";
import { useToast } from "@/hooks/use-toast";

const fieldCls = "h-10 w-full rounded-md border border-[#E4E4E7] bg-white px-3 text-sm text-[#232021] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-[#232021] focus:border-[#232021] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white";

export function NovoClienteForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await criarCliente(fd);
        toast({ title: "Cliente cadastrado!" });
        setOpen(false);
        (e.target as HTMLFormElement).reset();
      } catch {
        toast({ title: "Erro ao cadastrar cliente", variant: "destructive" });
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-10 rounded-md border border-[#E4E4E7] bg-white px-4 text-sm font-medium text-[#232021] transition-colors hover:bg-[#F4F4F5] active:scale-[0.98] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white dark:hover:bg-[#27272A]"
      >
        + Novo cliente
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input name="nome"    placeholder="Nome *"  required className={fieldCls} />
        <input name="empresa" placeholder="Empresa"          className={fieldCls} />
        <input name="telefone" placeholder="Telefone"        className={fieldCls} />
        <input name="email"   placeholder="Email" type="email" className={fieldCls} />
        <input name="cnpjCpf" placeholder="CNPJ / CPF"       className={fieldCls} />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-md bg-[#232021] px-4 text-sm font-medium text-white transition-colors hover:bg-[#3F3F46] active:scale-[0.98] disabled:opacity-40 dark:bg-white dark:text-[#232021] dark:hover:bg-[#F4F4F5]"
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-10 rounded-md border border-[#E4E4E7] bg-white px-4 text-sm font-medium text-[#232021] transition-colors hover:bg-[#F4F4F5] active:scale-[0.98] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white dark:hover:bg-[#27272A]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
