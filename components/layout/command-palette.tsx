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
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-zinc-200">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar página..."
            className="flex-1 bg-transparent text-sm outline-none text-zinc-900 placeholder:text-zinc-400"
            onKeyDown={(e) => {
              if (e.key === "Enter" && filtered[0]) navigate(filtered[0].href);
            }}
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-zinc-200 text-xs text-zinc-400">Esc</kbd>
        </div>

        <div className="py-1.5 max-h-72 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-zinc-400">Nenhum resultado</p>
          )}
          {filtered.map((cmd) => (
            <button
              key={cmd.href}
              type="button"
              onClick={() => navigate(cmd.href)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 text-left transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900">{cmd.label}</p>
                <p className="text-xs text-zinc-500 truncate">{cmd.desc}</p>
              </div>
              <kbd className="hidden sm:inline-flex shrink-0 items-center px-1.5 py-0.5 rounded border border-zinc-200 text-xs text-zinc-400">↵</kbd>
            </button>
          ))}
        </div>

        <div className="px-4 py-2 border-t border-zinc-100 flex gap-3 text-xs text-zinc-400">
          <span><kbd className="font-mono">↑↓</kbd> navegar</span>
          <span><kbd className="font-mono">↵</kbd> ir</span>
          <span><kbd className="font-mono">Esc</kbd> fechar</span>
        </div>
      </div>
    </div>
  );
}
