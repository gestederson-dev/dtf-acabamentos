"use client";

import { useTransition } from "react";
import { toggleProdutoAtivo } from "@/lib/actions/produtos";
import { useToast } from "@/hooks/use-toast";

export function ToggleAtivo({ produtoId, ativo }: { produtoId: string; ativo: boolean }) {
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => {
        await toggleProdutoAtivo(produtoId, !ativo);
        toast({ title: ativo ? "Produto desativado" : "Produto ativado" });
      })}
      className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
        ativo
          ? "bg-green-50 text-[#065F46] hover:bg-green-100"
          : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
      }`}
    >
      {ativo ? "Ativo" : "Inativo"}
    </button>
  );
}
