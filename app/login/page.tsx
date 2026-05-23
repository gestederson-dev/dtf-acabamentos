"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Email ou senha incorretos");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function loginGoogle() {
    setLoadingGoogle(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4 dark:bg-[#0A0A0B]">
      <div className="w-full max-w-sm">

        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4">
            <Image
              src="/brand/logo.png"
              alt="DTF Acabamentos"
              width={72}
              height={72}
              className="h-16 w-16 object-contain brightness-0 dark:invert"
              priority
              unoptimized
            />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-[#232021] dark:text-white">DTF Acabamentos</h1>
          <p className="mt-0.5 text-sm text-[#71717A]">Sistema Comercial</p>
        </div>

        {/* Card */}
        <div className="rounded-md border border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#18181B]">
          <div className="border-b border-[#E4E4E7] px-6 py-4 dark:border-[#27272A]">
            <p className="font-semibold text-[#232021] dark:text-white">Entrar</p>
            <p className="mt-0.5 text-sm text-[#71717A]">Acesse com seu email e senha</p>
          </div>

          <div className="space-y-4 px-6 py-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <input
                  type="email"
                  placeholder="seu@email.com.br"
                  autoComplete="email"
                  {...register("email")}
                  className={`h-10 w-full rounded-md border px-3 text-sm text-[#232021] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-1 dark:bg-[#18181B] dark:text-white ${
                    errors.email
                      ? "border-[#B91C1C] focus:ring-[#B91C1C]"
                      : "border-[#E4E4E7] focus:border-[#232021] focus:ring-[#232021] dark:border-[#27272A] dark:focus:border-white dark:focus:ring-white"
                  }`}
                />
                {errors.email && <p className="mt-1 text-xs text-[#B91C1C]">{errors.email.message}</p>}
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Senha"
                  autoComplete="current-password"
                  {...register("password")}
                  className={`h-10 w-full rounded-md border px-3 text-sm text-[#232021] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-1 dark:bg-[#18181B] dark:text-white ${
                    errors.password
                      ? "border-[#B91C1C] focus:ring-[#B91C1C]"
                      : "border-[#E4E4E7] focus:border-[#232021] focus:ring-[#232021] dark:border-[#27272A] dark:focus:border-white dark:focus:ring-white"
                  }`}
                />
                {errors.password && <p className="mt-1 text-xs text-[#B91C1C]">{errors.password.message}</p>}
              </div>
              {error && (
                <p className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="h-10 w-full rounded-md bg-[#232021] text-sm font-medium text-white transition-colors hover:bg-[#3F3F46] active:scale-[0.98] disabled:opacity-40 dark:bg-white dark:text-[#232021] dark:hover:bg-[#F4F4F5]"
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#E4E4E7] dark:border-[#27272A]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-[#A1A1AA] dark:bg-[#18181B]">ou</span>
              </div>
            </div>

            <button
              type="button"
              onClick={loginGoogle}
              disabled={loadingGoogle}
              className="h-10 w-full rounded-md border border-[#E4E4E7] bg-white text-sm font-medium text-[#232021] transition-colors hover:bg-[#F4F4F5] active:scale-[0.98] disabled:opacity-40 dark:border-[#27272A] dark:bg-[#18181B] dark:text-white dark:hover:bg-[#27272A]"
            >
              {loadingGoogle ? "Redirecionando..." : "Entrar com Google"}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#A1A1AA]">
          Acesso restrito a usuários autorizados
        </p>
      </div>
    </div>
  );
}
