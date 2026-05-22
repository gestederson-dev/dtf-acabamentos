"use client";

import { useTransition } from "react";
import { StatusVenda } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { atualizarStatusVenda } from "@/lib/actions/vendas";
import { useToast } from "@/hooks/use-toast";

const STATUS_LABEL: Record<StatusVenda, string> = {
  ORCAMENTO: "Orçamento",
  CONFIRMADO: "Confirmado",
  ENTREGUE: "Entregue",
  PAGO: "Pago",
  CANCELADO: "Cancelado",
};

interface Props {
  vendaId: string;
  statusAtual: StatusVenda;
  statusDisponiveis: StatusVenda[];
}

export function AtualizarStatus({ vendaId, statusDisponiveis }: Props) {
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function atualizar(status: StatusVenda) {
    startTransition(async () => {
      try {
        await atualizarStatusVenda(vendaId, status);
        toast({ title: `Status atualizado para ${STATUS_LABEL[status]}` });
      } catch {
        toast({ title: "Erro ao atualizar status", variant: "destructive" });
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {statusDisponiveis.map((s) => (
        <Button
          key={s}
          type="button"
          disabled={pending}
          onClick={() => atualizar(s)}
          className={s === StatusVenda.CANCELADO
            ? "bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"}
        >
          {STATUS_LABEL[s]}
        </Button>
      ))}
    </div>
  );
}
