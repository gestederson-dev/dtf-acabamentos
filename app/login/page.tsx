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

  const [showPassword, setShowPassword] = useState(false);

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
          <div className="mb-4 flex justify-center">
            <Image
              src="/brand/logo.png"
              alt="DTF Acabamentos"
              width={96}
              height={96}
              className="h-24 w-24 object-contain brightness-0 dark:invert"
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
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Senha"
                    autoComplete="current-password"
                    {...register("password")}
                    className={`h-10 w-full rounded-md border px-3 pr-10 text-sm text-[#232021] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-1 dark:bg-[#18181B] dark:text-white ${
                      errors.password
                        ? "border-[#B91C1C] focus:ring-[#B91C1C]"
                        : "border-[#E4E4E7] focus:border-[#232021] focus:ring-[#232021] dark:border-[#27272A] dark:focus:border-white dark:focus:ring-white"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#71717A]"
                    tabIndex={-1}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
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
