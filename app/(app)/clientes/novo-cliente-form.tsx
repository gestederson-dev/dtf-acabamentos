"use client";

import { useState, useTransition } from "react";
import { criarCliente } from "@/lib/actions/clientes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

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
      <Button type="button" onClick={() => setOpen(true)} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
        + Novo cliente
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-zinc-200 rounded-lg p-4 space-y-3 bg-zinc-50">
      <p className="text-sm font-semibold text-zinc-700">Novo cliente</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input name="nome" placeholder="Nome *" required />
        <Input name="empresa" placeholder="Empresa" />
        <Input name="telefone" placeholder="Telefone" />
        <Input name="email" placeholder="Email" type="email" />
        <Input name="cnpjCpf" placeholder="CNPJ / CPF" />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>{pending ? "Salvando..." : "Salvar"}</Button>
        <Button type="button" onClick={() => setOpen(false)} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
