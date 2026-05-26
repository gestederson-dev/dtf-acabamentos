"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

interface Props {
  periodoAtivo: string;
  mesCustom?: string; // yyyy-MM
}

export function DashboardFiltros({ periodoAtivo, mesCustom }: Props) {
  const router = useRouter();
  const today = new Date();

  const [calOpen, setCalOpen] = useState(false);
  const [yearNav, setYearNav] = useState(() => {
    if (periodoAtivo === "custom" && mesCustom) return parseInt(mesCustom.split("-")[0]);
    return today.getFullYear();
  });

  const [pending, startTransition] = useTransition();
  const calRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (periodoAtivo === "custom" && mesCustom) setYearNav(parseInt(mesCustom.split("-")[0]));
  }, [periodoAtivo, mesCustom]);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (calOpen && calRef.current && !calRef.current.contains(e.target as Node)) setCalOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [calOpen]);

  function navigate(params: Record<string, string>) {
    setCalOpen(false);
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    startTransition(() => { router.push(`/dashboard?${sp.toString()}`); });
  }

  const presets = [
    {
      label: "Este mês",
      isActive: periodoAtivo === "mes",
      onSelect: () => navigate({ periodo: "mes" }),
    },
    {
      label: "Mês passado",
      isActive: periodoAtivo === "mes_passado",
      onSelect: () => navigate({ periodo: "mes_passado" }),
    },
    {
      label: "Últimos 3 meses",
      isActive: periodoAtivo === "3m",
      onSelect: () => navigate({ periodo: "3m" }),
    },
    {
      label: "Últimos 6 meses",
      isActive: periodoAtivo === "6m",
      onSelect: () => navigate({ periodo: "6m" }),
    },
    {
      label: "Este ano",
      isActive: periodoAtivo === "ano",
      onSelect: () => navigate({ periodo: "ano" }),
    },
  ];

  function isMonthActive(idx: number) {
    if (periodoAtivo !== "custom" || !mesCustom) return false;
    const [y, m] = mesCustom.split("-").map(Number);
    return y === yearNav && m === idx + 1;
  }

  function getTriggerLabel() {
    const hit = presets.find((p) => p.isActive);
    if (hit) return hit.label;
    if (periodoAtivo === "custom" && mesCustom) {
      const [y, m] = mesCustom.split("-").map(Number);
      return format(new Date(y, m - 1), "MMMM 'de' yyyy", { locale: ptBR });
    }
    return "Período";
  }

  const triggerCls =
    "flex h-9 items-center gap-2 rounded-md border border-[#E4E4E7] bg-white px-3 text-sm font-medium text-[#232021] transition-colors hover:bg-[#F4F4F5] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white dark:hover:bg-[#27272A]";

  const presetActiveCls = "bg-[#F0FDF4] text-[#15803D] font-semibold dark:bg-green-400/10 dark:text-green-400";
  const presetDefaultCls = "text-[#232021] hover:bg-[#F4F4F5] dark:text-[#E5E7EB] dark:hover:bg-[#1C222B]";

  const chevron = (open: boolean) => (
    <svg
      width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden
      className={`shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
    >
      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="relative" ref={calRef}>
      <button
        type="button"
        onClick={() => setCalOpen((v) => !v)}
        className={`${triggerCls} ${pending ? "opacity-60" : ""}`}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect x="2" y="3.5" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M2 6.5h12" stroke="currentColor" strokeWidth="1.4" />
          <path d="M5 2v3M11 2v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span className="capitalize">{getTriggerLabel()}</span>
        {chevron(calOpen)}
      </button>

      {calOpen && (
        <div className="absolute right-0 top-11 z-50 w-[calc(100vw-1rem)] max-h-[80vh] overflow-y-auto rounded-lg border border-[#E4E4E7] bg-white shadow-xl sm:w-auto sm:min-w-[380px] sm:overflow-visible dark:border-[#27272A] dark:bg-[#0A0A0B]">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E4E4E7] bg-[#FAFAFA] px-4 py-2.5 dark:border-[#27272A] dark:bg-[#111318]">
            <span className="text-sm capitalize text-[#232021] dark:text-[#E5E7EB]">{getTriggerLabel()}</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <rect x="2" y="3.5" width="12" height="11" rx="1.5" stroke="#9aa3b2" strokeWidth="1.4" />
              <path d="M2 6.5h12" stroke="#9aa3b2" strokeWidth="1.4" />
              <path d="M5 2v3M11 2v3" stroke="#9aa3b2" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>

          {/* Corpo */}
          <div className="flex flex-col sm:flex-row">

            {/* Presets */}
            <div className="border-b border-[#E4E4E7] px-2 py-2 sm:w-44 sm:shrink-0 sm:border-b-0 sm:border-r sm:py-2.5 dark:border-[#1C222B]">
              <p className="mb-1 hidden px-2.5 text-[10px] font-medium uppercase tracking-wider text-[#A1A1AA] sm:block dark:text-[#5B6573]">
                Atalhos
              </p>
              <div className="flex flex-wrap gap-1 sm:flex-col sm:gap-0">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={p.onSelect}
                    className={`rounded-md px-2.5 py-[7px] text-left text-[12.5px] transition-colors sm:w-full ${p.isActive ? presetActiveCls : presetDefaultCls}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grade de meses */}
            <div className="p-3">
              {/* Navegação de ano */}
              <div className="mb-3 flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={() => setYearNav((y) => y - 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-[#71717A] transition-colors hover:bg-[#F4F4F5] hover:text-[#232021] dark:hover:bg-[#1C222B] dark:hover:text-white"
                  aria-label="Ano anterior"
                >
                  <svg width="12" height="14" viewBox="0 0 14 16" fill="none" aria-hidden>
                    <path d="M9 4L4 8L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span className="text-sm font-semibold text-[#232021] dark:text-[#E5E7EB]">{yearNav}</span>
                <button
                  type="button"
                  onClick={() => setYearNav((y) => y + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-[#71717A] transition-colors hover:bg-[#F4F4F5] hover:text-[#232021] dark:hover:bg-[#1C222B] dark:hover:text-white"
                  aria-label="Próximo ano"
                >
                  <svg width="12" height="14" viewBox="0 0 14 16" fill="none" aria-hidden>
                    <path d="M5 4L10 8L5 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              {/* Grade 4×3 */}
              <div className="grid grid-cols-4 gap-1.5">
                {MESES.map((mes, i) => (
                  <button
                    key={mes}
                    type="button"
                    onClick={() => navigate({ periodo: "custom", mes: format(new Date(yearNav, i), "yyyy-MM") })}
                    className={`h-11 w-full rounded-md text-sm font-medium transition-colors ${
                      isMonthActive(i)
                        ? presetActiveCls + " border-b border-[#15803D] dark:border-green-400"
                        : presetDefaultCls
                    }`}
                  >
                    {mes}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
