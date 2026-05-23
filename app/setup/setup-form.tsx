"use client";

import { useState, useTransition } from "react";
import { criarPrimeiroSocio } from "@/lib/actions/users";
import { useRouter } from "next/navigation";

const fieldCls = "h-10 w-full rounded-md border border-[#E4E4E7] bg-white px-3 text-sm text-[#232021] focus:outline-none focus:ring-1 focus:ring-[#232021] focus:border-[#232021] dark:border-[#27272A] dark:bg-[#18181B] dark:text-white";
const labelCls = "mb-1.5 block text-xs font-medium text-[#71717A]";

export function SetupForm() {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await criarPrimeiroSocio(fd);
        router.push("/login");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro ao criar conta");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>Nome completo</label>
        <input name="nome" type="text" required autoFocus className={fieldCls} />
      </div>
      <div>
        <label className={labelCls}>E-mail</label>
        <input name="email" type="email" required className={fieldCls} />
      </div>
      <div>
        <label className={labelCls}>Senha</label>
        <input name="senha" type="password" required minLength={6} className={fieldCls} />
      </div>

      {error && (
        <p className="rounded-md bg-[#FEF2F2] px-3 py-2 text-xs text-[#B91C1C]">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-10 w-full rounded-md bg-[#232021] text-sm font-medium text-white transition-colors hover:bg-[#3F3F46] disabled:opacity-40 dark:bg-white dark:text-[#232021]"
      >
        {pending ? "Criando conta..." : "Criar conta de sócio"}
      </button>
    </form>
  );
}
