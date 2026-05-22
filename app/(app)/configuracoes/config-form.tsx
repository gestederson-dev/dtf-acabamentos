"use client";

import { useTransition } from "react";
import { salvarConfiguracoes } from "@/lib/actions/configuracoes";
import { useToast } from "@/hooks/use-toast";
import type { Configuracao } from "@prisma/client";

const fieldCls = "h-10 w-full rounded-md border border-[#E4E4E7] bg-white px-3 text-sm tabular-nums text-[#232021] focus:outline-none focus:ring-1 focus:ring-[#232021] focus:border-[#232021] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white";
const labelCls = "mb-1 block text-xs font-medium text-[#71717A]";

interface Props { config: Configuracao | null }

export function ConfigForm({ config }: Props) {
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await salvarConfiguracoes(fd);
        toast({ title: "Configurações salvas com sucesso" });
      } catch {
        toast({ title: "Erro ao salvar", variant: "destructive" });
      }
    });
  }

  const c = config;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <Section title="Margens">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Lucro alvo (%)"           name="percentLucro"    defaultValue={pct(c?.percentLucro, 40)} />
          <Field label="Comissão vendedor (%)"     name="percentComissao" defaultValue={pct(c?.percentComissao, 6)} />
          <Field label="Imposto embutido (%)"      name="percentImposto"  defaultValue={pct(c?.percentImposto, 8)} />
        </div>
      </Section>

      <Section title="Embalagem">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Custo da caixa (R$)" name="custoEmbalagem" defaultValue={String(c?.custoEmbalagem ?? 10)} step="0.01" />
          <Field label="Peças por caixa"     name="pecasPorCaixa"  defaultValue={String(c?.pecasPorCaixa ?? 20)} step="1" />
        </div>
      </Section>

      <Section title="Política Comercial">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Desconto máximo sem autorização (%)" name="descontoMaximoLivre" defaultValue={pct(c?.descontoMaximoLivre, 5)} />
          <Field label="Frete grátis acima de (caixas)"      name="freteGratisAcimaCx"  defaultValue={String(c?.freteGratisAcimaCx ?? 5)} step="1" />
        </div>
      </Section>

      <Section title="Meta e MEI">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Meta mensal (R$) — opcional" name="metaMensalRS"  defaultValue={String(c?.metaMensalRS ?? "")} required={false} />
          <Field label="Teto MEI anual (R$)"         name="tetoMEIAnual"  defaultValue={String(c?.tetoMEIAnual ?? 81000)} step="0.01" />
        </div>
      </Section>

      <button
        type="submit"
        disabled={pending}
        className="h-10 rounded-md bg-[#232021] px-6 text-sm font-medium text-white transition-colors hover:bg-[#3F3F46] active:scale-[0.98] disabled:opacity-40 dark:bg-white dark:text-[#232021] dark:hover:bg-[#F4F4F5]"
      >
        {pending ? "Salvando..." : "Salvar configurações"}
      </button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
      <div className="border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272A]">
        <p className="text-sm font-semibold text-[#232021] dark:text-white">{title}</p>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function pct(val: number | undefined | null, fallback: number) {
  if (val == null) return String(fallback);
  return String(Math.round(val * 100));
}

function Field({
  label, name, defaultValue, step = "0.01", required = true,
}: {
  label: string; name: string; defaultValue: string; step?: string; required?: boolean;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input name={name} type="number" step={step} min="0" defaultValue={defaultValue} required={required} className={fieldCls} />
    </div>
  );
}
