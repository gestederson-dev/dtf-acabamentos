"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  endOfYear, format, isWithinInterval,
  startOfWeek, endOfWeek, startOfYear, subMonths, subYears,
} from "date-fns";
import { ptBR } from "date-fns/locale";

type Periodo = "dia" | "semana" | "mes" | "custom";

interface Props {
  periodo: Periodo;
  diaParam: string;
  semanaParam: string;
  mesParam: string;
  deParam: string;
  ateParam: string;
  statusParam: string;
  buscaParam: string;
}

function parseLocal(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function VendasFiltros(props: Props) {
  const router = useRouter();
  const today = new Date();

  const [isOpen, setIsOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(props.periodo === "custom");
  const [yearNav, setYearNav] = useState(() => {
    if (props.periodo === "mes") return parseInt(props.mesParam.split("-")[0]);
    return today.getFullYear();
  });
  const [busca, setBusca] = useState(props.buscaParam);
  const [de, setDe] = useState(props.deParam);
  const [ate, setAte] = useState(props.ateParam);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sincroniza estado interno quando props mudam após navegação
  useEffect(() => {
    setShowCustom(props.periodo === "custom");
    if (props.periodo === "mes") setYearNav(parseInt(props.mesParam.split("-")[0]));
    setBusca(props.buscaParam);
    setDe(props.deParam);
    setAte(props.ateParam);
  }, [props.periodo, props.mesParam, props.buscaParam, props.deParam, props.ateParam]);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!isOpen) return;
    function onMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen]);

  function buildUrl(overrides: Record<string, string>) {
    const base: Record<string, string> = {
      periodo: props.periodo,
      dia: props.diaParam,
      semana: props.semanaParam,
      mes: props.mesParam,
      de: props.deParam,
      ate: props.ateParam,
      status: props.statusParam,
      busca,
      ...overrides,
    };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(base)) {
      if (v) sp.set(k, v);
    }
    return `/vendas?${sp.toString()}`;
  }

  function navigate(params: Record<string, string>) {
    setIsOpen(false);
    router.push(buildUrl(params));
  }

  // Definição dos atalhos
  const presets = [
    {
      label: "Hoje",
      isActive: props.periodo === "dia" && props.diaParam === format(today, "yyyy-MM-dd"),
      onSelect: () => navigate({ periodo: "dia", dia: format(today, "yyyy-MM-dd") }),
    },
    {
      label: "Esta semana",
      isActive: (() => {
        if (props.periodo !== "semana") return false;
        const ref = parseLocal(props.semanaParam);
        return isWithinInterval(ref, {
          start: startOfWeek(today, { weekStartsOn: 1 }),
          end: endOfWeek(today, { weekStartsOn: 1 }),
        });
      })(),
      onSelect: () => navigate({ periodo: "semana", semana: format(today, "yyyy-MM-dd") }),
    },
    {
      label: "Este mês",
      isActive: props.periodo === "mes" && props.mesParam === format(today, "yyyy-MM"),
      onSelect: () => navigate({ periodo: "mes", mes: format(today, "yyyy-MM") }),
    },
    {
      label: "Mês passado",
      isActive: props.periodo === "mes" && props.mesParam === format(subMonths(today, 1), "yyyy-MM"),
      onSelect: () => navigate({ periodo: "mes", mes: format(subMonths(today, 1), "yyyy-MM") }),
    },
    {
      label: "Últimos 3 meses",
      isActive:
        props.periodo === "custom" &&
        props.deParam === format(subMonths(today, 3), "yyyy-MM-dd") &&
        props.ateParam === format(today, "yyyy-MM-dd"),
      onSelect: () =>
        navigate({ periodo: "custom", de: format(subMonths(today, 3), "yyyy-MM-dd"), ate: format(today, "yyyy-MM-dd") }),
    },
    {
      label: "Últimos 6 meses",
      isActive:
        props.periodo === "custom" &&
        props.deParam === format(subMonths(today, 6), "yyyy-MM-dd") &&
        props.ateParam === format(today, "yyyy-MM-dd"),
      onSelect: () =>
        navigate({ periodo: "custom", de: format(subMonths(today, 6), "yyyy-MM-dd"), ate: format(today, "yyyy-MM-dd") }),
    },
    {
      label: "Este ano",
      isActive:
        props.periodo === "custom" &&
        props.deParam === format(startOfYear(today), "yyyy-MM-dd") &&
        props.ateParam === format(endOfYear(today), "yyyy-MM-dd"),
      onSelect: () =>
        navigate({ periodo: "custom", de: format(startOfYear(today), "yyyy-MM-dd"), ate: format(endOfYear(today), "yyyy-MM-dd") }),
    },
    {
      label: "Ano passado",
      isActive: (() => {
        const ly = subYears(today, 1);
        return (
          props.periodo === "custom" &&
          props.deParam === format(startOfYear(ly), "yyyy-MM-dd") &&
          props.ateParam === format(endOfYear(ly), "yyyy-MM-dd")
        );
      })(),
      onSelect: () => {
        const ly = subYears(today, 1);
        navigate({ periodo: "custom", de: format(startOfYear(ly), "yyyy-MM-dd"), ate: format(endOfYear(ly), "yyyy-MM-dd") });
      },
    },
  ];

  function isMonthActive(idx: number) {
    if (props.periodo !== "mes") return false;
    const [y, m] = props.mesParam.split("-").map(Number);
    return y === yearNav && m === idx + 1;
  }

  function handleMonthClick(idx: number) {
    navigate({ periodo: "mes", mes: format(new Date(yearNav, idx), "yyyy-MM") });
  }

  function getTriggerLabel() {
    const hit = presets.find((p) => p.isActive);
    if (hit) return hit.label;
    if (props.periodo === "dia") return format(parseLocal(props.diaParam), "dd 'de' MMM", { locale: ptBR });
    if (props.periodo === "semana") {
      const ref = parseLocal(props.semanaParam);
      const ini = startOfWeek(ref, { weekStartsOn: 1 });
      const fim = endOfWeek(ref, { weekStartsOn: 1 });
      return `${format(ini, "dd/MM")} – ${format(fim, "dd/MM")}`;
    }
    if (props.periodo === "mes") {
      const [y, m] = props.mesParam.split("-").map(Number);
      return format(new Date(y, m - 1), "MMM yyyy", { locale: ptBR });
    }
    if (props.periodo === "custom" && props.deParam && props.ateParam) {
      return `${format(parseLocal(props.deParam), "dd/MM/yy")} – ${format(parseLocal(props.ateParam), "dd/MM/yy")}`;
    }
    return "Período";
  }

  const inputCls =
    "h-10 w-full rounded-md border border-[#E4E4E7] bg-white px-3 text-sm text-[#232021] focus:outline-none focus:ring-1 focus:ring-[#232021] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white";

  const presetActiveCls =
    "bg-[#F0FDF4] text-[#15803D] font-semibold dark:bg-green-400/10 dark:text-green-400";
  const presetDefaultCls =
    "text-[#232021] hover:bg-[#F4F4F5] dark:text-[#E5E7EB] dark:hover:bg-[#1C222B]";

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap items-center gap-2">

        {/* ── Trigger + painel calendário ── */}
        <div className="relative" ref={wrapperRef}>
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="flex h-10 items-center gap-2 rounded-md border border-[#E4E4E7] bg-white px-3 text-sm font-medium text-[#232021] transition-colors hover:bg-[#F4F4F5] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white dark:hover:bg-[#27272A]"
          >
            {/* Ícone calendário */}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <rect x="2" y="3.5" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M2 6.5h12" stroke="currentColor" strokeWidth="1.4" />
              <path d="M5 2v3M11 2v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span className="capitalize">{getTriggerLabel()}</span>
            <svg
              width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden
              className={`transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
            >
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Painel dropdown */}
          {isOpen && (
            <div className="absolute left-0 top-12 z-50 overflow-hidden rounded-lg border border-[#E4E4E7] bg-white shadow-xl dark:border-[#27272A] dark:bg-[#0A0A0B]">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E4E4E7] bg-[#FAFAFA] px-4 py-2.5 dark:border-[#27272A] dark:bg-[#111318]">
                <span className="text-sm capitalize text-[#232021] dark:text-[#E5E7EB]">{getTriggerLabel()}</span>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <rect x="2" y="3.5" width="12" height="11" rx="1.5" stroke="#9aa3b2" strokeWidth="1.4" />
                  <path d="M2 6.5h12" stroke="#9aa3b2" strokeWidth="1.4" />
                  <path d="M5 2v3M11 2v3" stroke="#9aa3b2" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>

              {/* Corpo: atalhos | calendário */}
              <div className="flex">

                {/* Coluna esquerda: atalhos */}
                <div className="w-44 shrink-0 border-r border-[#E4E4E7] px-2 py-2.5 dark:border-[#1C222B]">
                  <p className="mb-1.5 px-2.5 text-[10px] font-medium uppercase tracking-wider text-[#A1A1AA] dark:text-[#5B6573]">
                    Atalhos
                  </p>
                  {presets.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={p.onSelect}
                      className={`w-full rounded-md px-2.5 py-[7px] text-left text-[12.5px] transition-colors ${
                        p.isActive ? presetActiveCls : presetDefaultCls
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                  <div className="my-1.5 border-t border-[#E4E4E7] dark:border-[#1C222B]" />
                  <button
                    type="button"
                    onClick={() => setShowCustom(true)}
                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-[7px] text-[12.5px] transition-colors ${
                      showCustom
                        ? presetActiveCls
                        : "text-[#71717A] hover:bg-[#F4F4F5] dark:text-[#9AA3B2] dark:hover:bg-[#1C222B]"
                    }`}
                  >
                    <span>Personalizado</span>
                    <span className="text-base leading-none">›</span>
                  </button>
                </div>

                {/* Coluna direita: calendário ou range */}
                <div className="p-3">
                  {!showCustom ? (
                    <>
                      {/* Navegação de ano */}
                      <div className="mb-3 flex items-center justify-between px-1">
                        <button
                          type="button"
                          onClick={() => setYearNav((y) => y - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-[#71717A] transition-colors hover:bg-[#F4F4F5] hover:text-[#232021] dark:hover:bg-[#1C222B] dark:hover:text-white"
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
                          className="flex h-7 w-7 items-center justify-center rounded-md text-[#71717A] transition-colors hover:bg-[#F4F4F5] hover:text-[#232021] dark:hover:bg-[#1C222B] dark:hover:text-white"
                          aria-label="Próximo ano"
                        >
                          <svg width="12" height="14" viewBox="0 0 14 16" fill="none" aria-hidden>
                            <path d="M5 4L10 8L5 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                      {/* Grade 4×3 de meses */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {MESES.map((mes, i) => (
                          <button
                            key={mes}
                            type="button"
                            onClick={() => handleMonthClick(i)}
                            className={`h-11 w-[70px] rounded-md text-sm font-medium transition-colors ${
                              isMonthActive(i)
                                ? presetActiveCls + " border-b border-[#15803D] dark:border-green-400"
                                : presetDefaultCls
                            }`}
                          >
                            {mes}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    /* Range personalizado */
                    <div className="flex w-[240px] flex-col gap-3 py-1">
                      <div>
                        <label className="mb-1 block text-xs text-[#71717A]">De</label>
                        <input type="date" value={de} onChange={(e) => setDe(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-[#71717A]">Até</label>
                        <input type="date" value={ate} onChange={(e) => setAte(e.target.value)} className={inputCls} />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCustom(false)}
                          className="h-10 flex-1 rounded-md border border-[#E4E4E7] text-sm text-[#71717A] transition-colors hover:bg-[#F4F4F5] dark:border-[#27272A] dark:hover:bg-[#27272A] dark:text-white"
                        >
                          Voltar
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate({ periodo: "custom", de, ate })}
                          className="h-10 flex-1 rounded-md bg-[#232021] text-sm font-medium text-white transition-colors hover:bg-[#3F3F46] dark:bg-white dark:text-[#232021] dark:hover:bg-[#F4F4F5]"
                        >
                          Aplicar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Status ── */}
        <select
          value={props.statusParam}
          onChange={(e) => router.push(buildUrl({ status: e.target.value }))}
          className="h-10 rounded-md border border-[#E4E4E7] bg-white px-3 text-sm text-[#232021] focus:outline-none focus:ring-1 focus:ring-[#232021] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white"
        >
          <option value="">Todos os status</option>
          <option value="ORCAMENTO">Orçamento</option>
          <option value="CONFIRMADO">Confirmado</option>
          <option value="ENTREGUE">Entregue</option>
          <option value="PAGO">Pago</option>
          <option value="CANCELADO">Cancelado</option>
        </select>

        {/* ── Busca ── */}
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && router.push(buildUrl({ busca }))}
          placeholder="Buscar cliente..."
          className="h-10 min-w-[160px] flex-1 rounded-md border border-[#E4E4E7] bg-white px-3 text-sm text-[#232021] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-[#232021] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white"
        />
        <button
          type="button"
          onClick={() => router.push(buildUrl({ busca }))}
          className="h-10 rounded-md border border-[#E4E4E7] bg-white px-4 text-sm font-medium text-[#232021] transition-colors hover:bg-[#F4F4F5] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white dark:hover:bg-[#27272A]"
        >
          Filtrar
        </button>
      </div>
    </div>
  );
}
