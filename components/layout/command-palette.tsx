"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Cmd {
  label: string;
  desc: string;
  href: string;
  soSocio?: boolean;
}

const COMMANDS: Cmd[] = [
  { label: "Dashboard", desc: "Visão geral do negócio", href: "/dashboard" },
  { label: "Novo orçamento", desc: "Criar orçamento ou venda rápida", href: "/orcamento" },
  { label: "Vendas", desc: "Histórico de vendas", href: "/vendas" },
  { label: "Calculadora de preços", desc: "Simular preços e margens", href: "/calculadora-preco" },
  { label: "Clientes", desc: "Cadastro de clientes", href: "/clientes" },
  { label: "Análise", desc: "Sazonalidade, sensibilidade, produtos", href: "/analise", soSocio: true },
  { label: "Configurações", desc: "Parâmetros de precificação", href: "/configuracoes", soSocio: true },
];

export function CommandPalette() {
  const router = useRouter();
  const { data: session } = useSession();
  const isSocio = session?.user?.role === "SOCIO";

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = COMMANDS.filter((c) => {
    if (c.soSocio && !isSocio) return false;
    if (!query) return true;
    return (
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.desc.toLowerCase().includes(query.toLowerCase())
    );
  });

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  function navigate(href: string) {
    router.push(href);
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-[20vh]"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-md border border-[#E4E4E7] bg-white shadow-lg dark:border-[#27272A] dark:bg-[#18181B]">
        <div className="flex items-center gap-2 border-b border-[#E4E4E7] px-4 py-3 dark:border-[#27272A]">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#A1A1AA]">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar página..."
            className="flex-1 bg-transparent text-sm text-[#232021] outline-none placeholder:text-[#A1A1AA] dark:text-white"
            onKeyDown={(e) => {
              if (e.key === "Enter" && filtered[0]) navigate(filtered[0].href);
            }}
          />
          <kbd className="hidden items-center gap-1 rounded border border-[#E4E4E7] px-1.5 py-0.5 text-xs text-[#A1A1AA] sm:inline-flex dark:border-[#27272A]">Esc</kbd>
        </div>

        <div className="max-h-72 overflow-y-auto py-1.5">
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-[#A1A1AA]">Nenhum resultado</p>
          )}
          {filtered.map((cmd) => (
            <button
              key={cmd.href}
              type="button"
              onClick={() => navigate(cmd.href)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#F4F4F5] dark:hover:bg-[#27272A]"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#232021] dark:text-white">{cmd.label}</p>
                <p className="truncate text-xs text-[#71717A]">{cmd.desc}</p>
              </div>
              <kbd className="hidden shrink-0 items-center rounded border border-[#E4E4E7] px-1.5 py-0.5 text-xs text-[#A1A1AA] sm:inline-flex dark:border-[#27272A]">↵</kbd>
            </button>
          ))}
        </div>

        <div className="flex gap-3 border-t border-[#E4E4E7] px-4 py-2 text-xs text-[#A1A1AA] dark:border-[#27272A]">
          <span><kbd className="font-mono">↑↓</kbd> navegar</span>
          <span><kbd className="font-mono">↵</kbd> ir</span>
          <span><kbd className="font-mono">Esc</kbd> fechar</span>
        </div>
      </div>
    </div>
  );
}
