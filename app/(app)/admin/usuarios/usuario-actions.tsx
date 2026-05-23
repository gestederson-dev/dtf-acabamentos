"use client";

import { useTransition } from "react";
import { toggleAtivoUsuario } from "@/lib/actions/users";
import { useToast } from "@/hooks/use-toast";

export function UsuarioActions({ userId, ativo, isSelf }: { userId: string; ativo: boolean; isSelf: boolean }) {
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  function toggle() {
    startTransition(async () => {
      try {
        await toggleAtivoUsuario(userId, !ativo);
      } catch (err: unknown) {
        toast({ title: err instanceof Error ? err.message : "Erro", variant: "destructive" });
      }
    });
  }

  if (isSelf) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={`shrink-0 h-7 rounded-sm border px-3 text-xs font-medium transition-colors disabled:opacity-40 ${
        ativo
          ? "border-[#E4E4E7] text-[#71717A] hover:border-[#FECACA] hover:text-[#B91C1C] dark:border-[#27272A]"
          : "border-[#A7F3D0] bg-[#ECFDF5] text-[#047857] hover:opacity-80"
      }`}
    >
      {pending ? "..." : ativo ? "Desativar" : "Ativar"}
    </button>
  );
}
