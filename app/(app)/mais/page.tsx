"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Role } from "@prisma/client";
import { Settings, Package, Calculator, BookOpen, LogOut, User, BarChart2 } from "lucide-react";

const links = [
  { href: "/analise",          label: "Análise",              icon: BarChart2, roles: ["SOCIO", "VENDEDOR"] },
  { href: "/clientes",         label: "Clientes",             icon: User,      roles: ["SOCIO", "VENDEDOR"] },
  { href: "/calculadora-preco", label: "Calculadora de Preço", icon: Calculator, roles: ["SOCIO"] },
  { href: "/produtos",         label: "Produtos",             icon: Package,   roles: ["SOCIO"] },
  { href: "/configuracoes",    label: "Configurações",        icon: Settings,  roles: ["SOCIO"] },
  { href: "/guia",             label: "Guia de Uso",          icon: BookOpen,  roles: ["SOCIO", "VENDEDOR"] },
];

export default function MaisPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "VENDEDOR";

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <p className="font-semibold text-[#232021] dark:text-white">{session?.user?.name}</p>
        <p className="text-sm text-[#71717A]">
          {role === Role.SOCIO ? "Sócio" : "Vendedor"} · {session?.user?.email}
        </p>
      </div>

      <div className="space-y-0.5">
        {links
          .filter((l) => l.roles.includes(role))
          .map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-md px-3 py-3 text-sm text-[#52525B] transition-colors hover:bg-[#F4F4F5] hover:text-[#232021] dark:text-[#71717A] dark:hover:bg-[#27272A] dark:hover:text-white"
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              {label}
            </Link>
          ))}
      </div>

      <div className="mt-6 border-t border-[#E4E4E7] pt-4 dark:border-[#27272A]">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm text-[#B91C1C] transition-colors hover:bg-[#FEF2F2]"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          Sair
        </button>
      </div>
    </div>
  );
}
