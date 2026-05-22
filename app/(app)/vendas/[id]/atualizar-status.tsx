"use client";

import { useTransition } from "react";
import { StatusVenda } from "@prisma/client";
import { atualizarStatusVenda } from "@/lib/actions/vendas";
import { useToast } from "@/hooks/use-toast";

const STATUS_LABEL: Record<StatusVenda, string> = {
  ORCAMENTO: "Orçamento",
  CONFIRMADO: "Confirmado",
  ENTREGUE: "Entregue",
  PAGO: "Pago",
  CANCELADO: "Cancelado",
};

const STATUS_CLS: Record<StatusVenda, string> = {
  ORCAMENTO:  "border-[#E4E4E7] bg-white text-[#52525B] hover:bg-[#F4F4F5]",
  CONFIRMADO: "border-[#232021] bg-[#232021] text-white hover:bg-[#3F3F46]",
  ENTREGUE:   "border-[#E4E4E7] bg-[#F4F4F5] text-[#52525B] hover:bg-[#E4E4E7]",
  PAGO:       "border-[#A7F3D0] bg-[#ECFDF5] text-[#047857] hover:bg-[#D1FAE5]",
  CANCELADO:  "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C] hover:bg-[#FEE2E2]",
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
        <button
          key={s}
          type="button"
          disabled={pending}
          onClick={() => atualizar(s)}
          className={`inline-flex h-9 items-center rounded-sm border px-3 text-sm font-medium transition-colors active:scale-[0.98] disabled:opacity-40 ${STATUS_CLS[s]}`}
        >
          {STATUS_LABEL[s]}
        </button>
      ))}
    </div>
  );
}
