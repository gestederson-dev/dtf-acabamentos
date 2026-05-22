"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, PlusCircle, BarChart2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",   label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendas",      label: "Vendas",     icon: ShoppingCart },
  { href: "/vendas/nova", label: "Novo",       icon: PlusCircle },
  { href: "/analise",     label: "Análise",    icon: BarChart2 },
  { href: "/mais",        label: "Mais",       icon: MoreHorizontal },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 flex justify-around border-t border-[#E4E4E7] bg-white/95 backdrop-blur dark:border-[#27272A] dark:bg-[#0A0A0B]/95">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 px-2 py-2.5 transition-colors duration-150",
              active
                ? "text-[#232021] dark:text-white"
                : "text-[#A1A1AA] hover:text-[#71717A] dark:text-[#52525B] dark:hover:text-[#A1A1AA]"
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
