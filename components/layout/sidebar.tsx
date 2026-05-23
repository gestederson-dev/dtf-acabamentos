"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, ShoppingCart, PlusCircle, BarChart2,
  Settings, Package, Users, Calculator, LogOut, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Role } from "@prisma/client";
import { DarkModeToggle } from "./dark-mode-toggle";

const navVendas = [
  { href: "/dashboard",   label: "Dashboard",  icon: LayoutDashboard },
  { href: "/vendas",      label: "Vendas",      icon: ShoppingCart },
  { href: "/vendas/nova", label: "Nova Venda",  icon: PlusCircle },
  { href: "/clientes",    label: "Clientes",    icon: Users },
];

const navAnalise = [
  { href: "/analise", label: "Análise", icon: BarChart2 },
];

const navSocio = [
  { href: "/calculadora-preco", label: "Calculadora", icon: Calculator },
  { href: "/produtos",          label: "Produtos",     icon: Package },
  { href: "/configuracoes",     label: "Configurações", icon: Settings },
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
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150",
        active
          ? "bg-[#232021] text-white dark:bg-white dark:text-[#232021]"
          : "text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#232021] dark:text-[#71717A] dark:hover:bg-[#27272A] dark:hover:text-white"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
      <span>{label}</span>
    </Link>
  );
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="mb-1 px-3 text-[10px] font-medium uppercase tracking-widest text-[#A1A1AA]">
        {label}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export function Sidebar() {
  const { data: session } = useSession();
  const isSocio = session?.user?.role === Role.SOCIO;

  return (
    <aside className="hidden md:flex w-60 flex-col border-r border-[#E4E4E7] bg-white dark:border-[#27272A] dark:bg-[#0A0A0B]">
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-[#E4E4E7] px-5 dark:border-[#27272A]">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#232021]">
          <Image
            src="/brand/logo.png"
            alt="DTF Acabamentos"
            width={28}
            height={28}
            className="h-7 w-7 object-contain brightness-0 invert"
            priority
            unoptimized
          />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-semibold tracking-tight text-[#232021] dark:text-white">DTF</span>
          <span className="text-[10px] text-[#71717A]">Acabamentos</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <NavSection label="Comercial">
          {navVendas.map((item) => <NavItem key={item.href} {...item} />)}
        </NavSection>

        <NavSection label="Análise">
          {navAnalise.map((item) => <NavItem key={item.href} {...item} />)}
        </NavSection>

        {isSocio && (
          <NavSection label="Gestão">
            {navSocio.map((item) => <NavItem key={item.href} {...item} />)}
          </NavSection>
        )}

        <div className="space-y-0.5">
          {navGuia.map((item) => <NavItem key={item.href} {...item} />)}
        </div>
      </nav>

      {/* Rodapé: usuário + ações */}
      <div className="border-t border-[#E4E4E7] px-3 py-3 dark:border-[#27272A]">
        <div className="mb-1 px-3 py-2">
          <p className="truncate text-sm font-medium text-[#232021] dark:text-white">
            {session?.user?.name ?? "—"}
          </p>
          <p className="text-xs text-[#71717A]">{isSocio ? "Sócio" : "Vendedor"}</p>
        </div>
        <div className="flex items-center gap-1">
          <DarkModeToggle />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm text-[#71717A] transition-colors hover:bg-[#F4F4F5] hover:text-[#232021] dark:hover:bg-[#27272A] dark:hover:text-white"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
