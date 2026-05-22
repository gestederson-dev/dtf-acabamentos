import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";

// TEMPORÁRIO — auth desativada para testes. Reativar antes de entregar ao cliente:
// import { getServerSession } from "next-auth"; import { authOptions } from "@/lib/auth"; import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // const session = await getServerSession(authOptions); if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 pb-16 md:pb-0 overflow-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
