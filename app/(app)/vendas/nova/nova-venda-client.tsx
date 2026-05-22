"use client";

// Reutiliza a mesma lógica do Orçamento, com botões de salvar diferentes
import { OrcamentoClient } from "@/app/(app)/orcamento/orcamento-client";
import type { Configuracao, Produto, Cliente } from "@prisma/client";

interface Props {
  config: Configuracao | null;
  produtos: Produto[];
  clientes: Cliente[];
  isSocio: boolean;
}

export function NovaVendaClient(props: Props) {
  return <OrcamentoClient {...props} />;
}
