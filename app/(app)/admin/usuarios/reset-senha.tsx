"use client";

import { useState, useTransition } from "react";
import { alterarSenhaUsuario } from "@/lib/actions/users";
import { useToast } from "@/hooks/use-toast";

export function ResetSenha({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [senha, setSenha] = useState("");
  const [show, setShow] = useState(false);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function salvar() {
    if (senha.length < 6) {
      toast({ title: "Senha mínimo 6 caracteres", variant: "destructive" });
      return;
    }
    startTransition(async () => {
      try {
        await alterarSenhaUsuario(userId, senha);
        toast({ title: "Senha redefinida com sucesso" });
        setSenha("");
        setOpen(false);
      } catch (err: unknown) {
        toast({ title: err instanceof Error ? err.message : "Erro", variant: "destructive" });
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 h-9 rounded-sm border border-[#E4E4E7] px-3 text-xs font-medium text-[#71717A] transition-colors hover:border-[#232021] hover:text-[#232021] dark:border-[#27272A] dark:hover:border-white dark:hover:text-white"
      >
        Redefinir senha
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder="Nova senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && salvar()}
          className="h-9 w-36 rounded-sm border border-[#E4E4E7] bg-white px-3 pr-8 text-sm text-[#232021] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-[#232021] focus:border-[#232021] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white"
          autoFocus
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#71717A]"
        >
          {show ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>
      <button
        type="button"
        onClick={salvar}
        disabled={pending}
        className="h-9 rounded-sm bg-[#232021] px-3 text-xs font-medium text-white hover:opacity-80 disabled:opacity-40 dark:bg-white dark:text-[#232021]"
      >
        {pending ? "..." : "Salvar"}
      </button>
      <button
        type="button"
        onClick={() => { setOpen(false); setSenha(""); }}
        className="h-9 rounded-sm border border-[#E4E4E7] px-3 text-xs font-medium text-[#71717A] hover:bg-[#F4F4F5] dark:border-[#27272A]"
      >
        Cancelar
      </button>
    </div>
  );
}
