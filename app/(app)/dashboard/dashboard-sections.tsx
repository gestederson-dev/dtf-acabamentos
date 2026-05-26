"use client";

import { useState, useTransition } from "react";
import { StatusVenda } from "@prisma/client";
import { atualizarStatusVenda } from "@/lib/actions/vendas";
import { formatarMoeda } from "@/lib/pricing";
import Link from "next/link";

export type VendaResumo = {
  id: string;
  numero: number;
  data: string;
  status: StatusVenda;
  valorTotal: number;
  lucroLimpo: number;
  custoComissao: number;
  metros: number;
  cliente: { nome: string } | null;
  clienteNomeAvulso: string | null;
  produto: { nome: string };
  vendedorNome: string;
};

const STATUS_ORDER: StatusVenda[] = [
  StatusVenda.ORCAMENTO,
  StatusVenda.CONFIRMADO,
  StatusVenda.ENTREGUE,
  StatusVenda.PAGO,
  StatusVenda.CANCELADO,
];

const STATUS_CFG: Record<StatusVenda, { label: string; titleCls: string }> = {
  ORCAMENTO:  { label: "Orçamento",  titleCls: "text-[#52525B] dark:text-[#A1A1AA]" },
  CONFIRMADO: { label: "Confirmado", titleCls: "text-[#232021] dark:text-white" },
  ENTREGUE:   { label: "Entregue",   titleCls: "text-[#52525B] dark:text-[#A1A1AA]" },
  PAGO:       { label: "Pago",       titleCls: "text-[#047857]" },
  CANCELADO:  { label: "Cancelado",  titleCls: "text-[#B91C1C]" },
};

const TRANSITIONS: Record<StatusVenda, { status: StatusVenda; label: string; primary: boolean }[]> = {
  [StatusVenda.ORCAMENTO]:  [
    { status: StatusVenda.CONFIRMADO, label: "Confirmar", primary: true },
    { status: StatusVenda.CANCELADO, label: "Cancelar", primary: false },
  ],
  [StatusVenda.CONFIRMADO]: [
    { status: StatusVenda.ENTREGUE, label: "Entregar", primary: true },
    { status: StatusVenda.CANCELADO, label: "Cancelar", primary: false },
  ],
  [StatusVenda.ENTREGUE]:   [
    { status: StatusVenda.PAGO, label: "Marcar pago", primary: true },
    { status: StatusVenda.CANCELADO, label: "Cancelar", primary: false },
  ],
  [StatusVenda.PAGO]:       [],
  [StatusVenda.CANCELADO]:  [],
};

export function DashboardSections({ vendas, isSocio }: { vendas: VendaResumo[]; isSocio: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  function mudarStatus(vendaId: string, novoStatus: StatusVenda) {
    if (isPending) return;
    setPendingId(vendaId);
    startTransition(async () => {
      await atualizarStatusVenda(vendaId, novoStatus);
      setPendingId(null);
    });
  }

  const grouped = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = vendas.filter((v) => v.status === s);
    return acc;
  }, {} as Record<StatusVenda, VendaResumo[]>);

  return (
    <div className="space-y-4">
      {STATUS_ORDER.map((status) => {
        const items = grouped[status];
        const cfg = STATUS_CFG[status];
        const transitions = TRANSITIONS[status];
        const totalValor = items.reduce((s, v) => s + v.valorTotal, 0);
        const totalMetrica = items.reduce((s, v) => s + (isSocio ? v.lucroLimpo : v.custoComissao), 0);

        return (
          <div key={status} className="rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
            {/* Section header */}
            <div className="flex items-center justify-between border-b border-[#E4E4E7] px-5 py-3.5 dark:border-[#27272A]">
              <div className="flex items-center gap-2.5">
                <span className={`text-sm font-semibold ${cfg.titleCls}`}>{cfg.label}</span>
                <span className="rounded-full bg-[#F4F4F5] px-2 py-0.5 text-xs font-medium text-[#71717A] dark:bg-[#27272A] dark:text-[#A1A1AA]">
                  {items.length}
                </span>
              </div>
              {items.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold tabular-nums text-[#232021] dark:text-white">
                    {formatarMoeda(totalValor)}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-[#047857]">
                    {isSocio ? "lucro " : "comissão "}{formatarMoeda(totalMetrica)}
                  </span>
                </div>
              )}
            </div>

            {/* Rows */}
            {items.length === 0 ? (
              <div className="px-5 py-3 text-xs text-[#A1A1AA]">Nenhuma</div>
            ) : (
              <div className="divide-y divide-[#F4F4F5] dark:divide-[#27272A]">
                {items.map((v) => {
                  const nomeCliente = v.cliente?.nome ?? v.clienteNomeAvulso ?? "—";
                  const isLoading = pendingId === v.id;
                  return (
                    <div
                      key={v.id}
                      className={`flex flex-col gap-2 px-5 py-3 transition-opacity sm:flex-row sm:items-center sm:gap-3 ${isLoading ? "opacity-40" : ""}`}
                    >
                      <Link href={`/vendas/${v.id}`} className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="font-mono text-xs text-[#A1A1AA]">#{v.numero}</span>
                          <span className="truncate text-sm font-medium text-[#232021] dark:text-white">{nomeCliente}</span>
                          <span className="hidden text-xs text-[#71717A] sm:inline">{v.produto.nome}</span>
                          {isSocio && <span className="hidden text-xs text-[#A1A1AA] lg:inline">· {v.vendedorNome}</span>}
                        </div>
                        <div className="mt-0.5 flex items-center gap-3">
                          <span className="font-mono text-xs tabular-nums text-[#71717A]">{formatarMoeda(v.valorTotal)}</span>
                          <span className="font-mono text-xs tabular-nums text-[#047857]">
                            {isSocio ? `lucro ${formatarMoeda(v.lucroLimpo)}` : `+${formatarMoeda(v.custoComissao)}`}
                          </span>
                          <span className="text-xs text-[#A1A1AA]">{v.data}</span>
                        </div>
                      </Link>
                      {transitions.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          {transitions.map((t) => (
                            <button
                              key={t.status}
                              type="button"
                              onClick={() => mudarStatus(v.id, t.status)}
                              disabled={isPending}
                              className={
                                t.primary
                                  ? "h-8 rounded-sm bg-[#232021] px-2.5 text-xs font-medium text-white hover:opacity-80 disabled:opacity-40 dark:bg-white dark:text-[#232021]"
                                  : "h-8 rounded-sm border border-[#E4E4E7] px-2.5 text-xs font-medium text-[#71717A] hover:border-[#FECACA] hover:text-[#B91C1C] disabled:opacity-40 dark:border-[#27272A]"
                              }
                            >
                              {isLoading ? "..." : t.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
