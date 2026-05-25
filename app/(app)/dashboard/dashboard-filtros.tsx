"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PERIODOS = [
  { value: "mes",         label: "Este mês" },
  { value: "mes_passado", label: "Mês passado" },
  { value: "3m",          label: "3 meses" },
  { value: "6m",          label: "6 meses" },
  { value: "ano",         label: "Este ano" },
];

interface Props {
  periodoAtivo: string;
  mesCustom?: string; // yyyy-MM
}

export function DashboardFiltros({ periodoAtivo, mesCustom }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const isCustom = periodoAtivo === "custom";

  function getCustomLabel() {
    if (!isCustom || !mesCustom) return "Mês específico";
    const [y, m] = mesCustom.split("-").map(Number);
    return format(new Date(y, m - 1), "MMM/yy", { locale: ptBR });
  }

  function abrirPicker() {
    const el = inputRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") {
      el.showPicker();
    } else {
      el.click();
    }
  }

  const chipCls = (active: boolean) =>
    `h-8 rounded-full px-3.5 text-xs font-medium transition-colors select-none ${
      active
        ? "bg-[#232021] text-white dark:bg-white dark:text-[#232021]"
        : "border border-[#E4E4E7] bg-white text-[#52525B] hover:bg-[#F4F4F5] active:bg-[#E4E4E7] dark:border-[#27272A] dark:bg-transparent dark:text-[#A1A1AA] dark:hover:bg-[#27272A]"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {PERIODOS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => router.push(`/dashboard?periodo=${p.value}`)}
          className={chipCls(periodoAtivo === p.value)}
        >
          {p.label}
        </button>
      ))}

      <button
        type="button"
        onClick={abrirPicker}
        className={chipCls(isCustom)}
      >
        {getCustomLabel()}
      </button>
      <input
        ref={inputRef}
        type="month"
        value={mesCustom ?? ""}
        onChange={(e) => {
          if (e.target.value) router.push(`/dashboard?periodo=custom&mes=${e.target.value}`);
        }}
        className="sr-only"
        aria-label="Selecionar mês específico"
        tabIndex={-1}
      />
    </div>
  );
}
