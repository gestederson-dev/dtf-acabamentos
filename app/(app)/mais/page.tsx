"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Role } from "@prisma/client";
import { Settings, Package, Calculator, BookOpen, LogOut, User, BarChart2 } from "lucide-react";

const links = [
  { href: "/analise", label: "Análise", icon: BarChart2, roles: ["SOCIO", "VENDEDOR"] },
  { href: "/clientes", label: "Clientes", icon: User, roles: ["SOCIO", "VENDEDOR"] },
  { href: "/calculadora-preco", label: "Calculadora de Preço", icon: Calculator, roles: ["SOCIO"] },
  { href: "/produtos", label: "Produtos", icon: Package, roles: ["SOCIO"] },
  { href: "/configuracoes", label: "Configurações", icon: Settings, roles: ["SOCIO"] },
  { href: "/guia", label: "Guia de Uso", icon: BookOpen, roles: ["SOCIO", "VENDEDOR"] },
];

export default function MaisPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "VENDEDOR";

  return (
    <div className="p-6 space-y-5">
      <div>
        <p className="font-semibold text-zinc-900">{session?.user?.name}</p>
        <p className="text-sm text-zinc-500">{role === Role.SOCIO ? "Sócio" : "Vendedor"} · {session?.user?.email}</p>
      </div>

      <div className="space-y-1">
        {links
          .filter((l) => l.roles.includes(role))
          .map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-3 rounded-md text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <Icon className="w-4 h-4 text-zinc-500" />
              {label}
            </Link>
          ))}
      </div>

      <div className="border-t border-zinc-200 pt-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-3 rounded-md text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </div>
  );
}
