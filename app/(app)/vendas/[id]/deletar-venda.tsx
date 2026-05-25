"use client";

import { useTransition } from "react";
import { deletarVenda } from "@/lib/actions/vendas";

export function DeletarVenda({ vendaId, numero }: { vendaId: string; numero: number }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`Apagar o orçamento #${String(numero).padStart(3, "0")} permanentemente? Essa ação não pode ser desfeita.`)) return;
    startTransition(() => { deletarVenda(vendaId); });
  }

  return (
    <div className="mt-4 rounded-md border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 dark:border-[#7F1D1D]/40 dark:bg-[#7F1D1D]/10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#B91C1C] dark:text-[#FCA5A5]">Zona de perigo</p>
          <p className="mt-0.5 text-xs text-[#B91C1C]/70 dark:text-[#FCA5A5]/70">Apagar este orçamento permanentemente.</p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={isPending}
          className="h-8 shrink-0 rounded-md border border-[#FECACA] bg-white px-3 text-xs font-medium text-[#B91C1C] transition-colors hover:bg-[#FEF2F2] disabled:opacity-50 dark:border-[#7F1D1D] dark:bg-transparent dark:text-[#FCA5A5] dark:hover:bg-[#7F1D1D]/20"
        >
          {isPending ? "Apagando..." : "Apagar orçamento"}
        </button>
      </div>
    </div>
  );
}
