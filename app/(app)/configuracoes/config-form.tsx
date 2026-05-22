"use client";

import { useTransition } from "react";
import { salvarConfiguracoes } from "@/lib/actions/configuracoes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Configuracao } from "@prisma/client";

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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Margens */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Margens</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Lucro alvo (%)" name="percentLucro" defaultValue={pct(c?.percentLucro, 40)} />
          <Field label="Comissão vendedor (%)" name="percentComissao" defaultValue={pct(c?.percentComissao, 6)} />
          <Field label="Imposto embutido (%)" name="percentImposto" defaultValue={pct(c?.percentImposto, 8)} />
        </CardContent>
      </Card>

      {/* Embalagem */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Embalagem</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Custo da caixa (R$)" name="custoEmbalagem" defaultValue={String(c?.custoEmbalagem ?? 10)} step="0.01" />
          <Field label="Peças por caixa" name="pecasPorCaixa" defaultValue={String(c?.pecasPorCaixa ?? 20)} step="1" />
        </CardContent>
      </Card>

      {/* Política comercial */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Política Comercial</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Desconto máximo sem autorização (%)" name="descontoMaximoLivre" defaultValue={pct(c?.descontoMaximoLivre, 5)} />
          <Field label="Frete grátis acima de (caixas)" name="freteGratisAcimaCx" defaultValue={String(c?.freteGratisAcimaCx ?? 5)} step="1" />
        </CardContent>
      </Card>

      {/* Meta e MEI */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Meta e MEI</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Meta mensal (R$) — opcional" name="metaMensalRS" defaultValue={String(c?.metaMensalRS ?? "")} required={false} />
          <Field label="Teto MEI anual (R$)" name="tetoMEIAnual" defaultValue={String(c?.tetoMEIAnual ?? 81000)} step="0.01" />
        </CardContent>
      </Card>

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Salvando..." : "Salvar configurações"}
      </Button>
    </form>
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
    <div className="space-y-1">
      <label className="text-xs font-medium text-zinc-600">{label}</label>
      <Input name={name} type="number" step={step} min="0" defaultValue={defaultValue} required={required} className="tabular-nums" />
    </div>
  );
}
