"use client";

import { useRouter } from "next/navigation";

const PERIODOS = [
  { value: "mes",         label: "Este mês" },
  { value: "mes_passado", label: "Mês passado" },
  { value: "3m",          label: "3 meses" },
  { value: "6m",          label: "6 meses" },
  { value: "ano",         label: "Este ano" },
];

export function DashboardFiltros({ periodoAtivo }: { periodoAtivo: string }) {
  const router = useRouter();
  return (
    <div className="flex flex-wrap gap-1.5">
      {PERIODOS.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => router.push(`/dashboard?periodo=${p.value}`)}
          className={`h-7 rounded-full px-3 text-xs font-medium transition-colors ${
            periodoAtivo === p.value
              ? "bg-[#232021] text-white dark:bg-white dark:text-[#232021]"
              : "border border-[#E4E4E7] bg-white text-[#52525B] hover:bg-[#F4F4F5] dark:border-[#27272A] dark:bg-transparent dark:text-[#A1A1AA] dark:hover:bg-[#27272A]"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
