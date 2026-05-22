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
      className={`shrink-0 rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors active:scale-[0.98] disabled:opacity-40 ${
        ativo
          ? "border-[#A7F3D0] bg-[#ECFDF5] text-[#047857] hover:bg-[#D1FAE5]"
          : "border-[#E4E4E7] bg-[#F4F4F5] text-[#71717A] hover:bg-[#E4E4E7] dark:border-[#27272A] dark:bg-[#27272A] dark:text-[#A1A1AA]"
      }`}
    >
      {ativo ? "Ativo" : "Inativo"}
    </button>
  );
}
