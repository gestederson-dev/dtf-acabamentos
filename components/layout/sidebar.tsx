"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, ShoppingCart, PlusCircle, BarChart2,
  Settings, Package, Users, Calculator, FileText, LogOut, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Role } from "@prisma/client";
import { DarkModeToggle } from "./dark-mode-toggle";

const navVendas = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendas", label: "Vendas", icon: ShoppingCart },
  { href: "/vendas/nova", label: "Nova Venda", icon: PlusCircle },
  { href: "/orcamento", label: "Orçamento", icon: FileText },
  { href: "/clientes", label: "Clientes", icon: Users },
];

const navAnalise = [
  { href: "/analise", label: "Análise", icon: BarChart2 },
];

const navSocio = [
  { href: "/calculadora-preco", label: "Calculadora", icon: Calculator },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

const navGuia = [
  { href: "/guia", label: "Guia de Uso", icon: BookOpen },
];

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ElementType;
}

function NavItem({ href, label, icon: Icon }: NavItemProps) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
        active
          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800"
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const { data: session } = useSession();
  const isSocio = session?.user?.role === Role.SOCIO;

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
        <p className="font-bold text-zinc-900 text-base leading-tight">DTF Acabamentos</p>
        <p className="text-xs text-zinc-500 mt-0.5">Sistema Comercial</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        <div className="space-y-0.5">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">Vendas</p>
          {navVendas.map((item) => <NavItem key={item.href} {...item} />)}
        </div>

        <div className="space-y-0.5">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">Análise</p>
          {navAnalise.map((item) => <NavItem key={item.href} {...item} />)}
        </div>

        {isSocio && (
          <div className="space-y-0.5">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">Configurações</p>
            {navSocio.map((item) => <NavItem key={item.href} {...item} />)}
          </div>
        )}

        <div className="space-y-0.5">
          {navGuia.map((item) => <NavItem key={item.href} {...item} />)}
        </div>
      </nav>

      {/* Usuário */}
      <div className="px-3 py-3 border-t border-zinc-200 dark:border-zinc-800">
        <div className="px-3 py-2 mb-1">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{session?.user?.name}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{isSocio ? "Sócio" : "Vendedor"}</p>
        </div>
        <DarkModeToggle />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
