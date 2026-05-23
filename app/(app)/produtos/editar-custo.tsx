"use client";

import { useState, useTransition } from "react";
import { atualizarCustoProduto } from "@/lib/actions/produtos";
import { useToast } from "@/hooks/use-toast";
import { formatarMoeda } from "@/lib/pricing";

export function EditarCusto({ produtoId, custoAtual }: { produtoId: string; custoAtual: number }) {
  const [editing, setEditing] = useState(false);
  const [valor, setValor] = useState(String(custoAtual));
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function salvar() {
    const novo = Number(String(valor).replace(",", "."));
    if (!novo || novo <= 0) { toast({ title: "Valor inválido", variant: "destructive" }); return; }
    startTransition(async () => {
      try {
        await atualizarCustoProduto(produtoId, novo);
        toast({ title: "Custo atualizado. Próximos orçamentos usarão o novo valor." });
        setEditing(false);
      } catch (e: unknown) {
        toast({ title: e instanceof Error ? e.message : "Erro ao salvar", variant: "destructive" });
      }
    });
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="group flex items-center gap-1.5 text-sm text-[#71717A] transition-colors hover:text-[#232021] dark:hover:text-white"
        title="Editar custo"
      >
        <span className="font-mono tabular-nums font-medium text-[#232021] dark:text-white">
          {formatarMoeda(custoAtual)}/peça
        </span>
        <svg className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        step="0.01"
        min="0.01"
        value={valor}
        inputMode="decimal"
        autoFocus
        onChange={(e) => setValor(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") salvar(); if (e.key === "Escape") setEditing(false); }}
        className="h-8 w-24 rounded-md border border-[#E4E4E7] bg-white px-2 text-sm tabular-nums focus:border-[#232021] focus:outline-none focus:ring-1 focus:ring-[#232021] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white"
      />
      <button
        type="button"
        onClick={salvar}
        disabled={pending}
        className="h-8 rounded-md bg-[#232021] px-3 text-xs font-medium text-white disabled:opacity-40 dark:bg-white dark:text-[#232021]"
      >
        {pending ? "..." : "Salvar"}
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="h-8 rounded-md border border-[#E4E4E7] px-2 text-xs text-[#71717A] hover:bg-[#F4F4F5] dark:border-[#27272A]"
      >
        ✕
      </button>
    </div>
  );
}
