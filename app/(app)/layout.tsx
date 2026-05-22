import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// TEMPORÁRIO — auth desativada para testes. Reativar antes de entregar ao cliente:
// import { getServerSession } from "next-auth"; import { authOptions } from "@/lib/auth"; import { redirect } from "next/navigation";

async function autoSeed() {
  try {
    const config = await prisma.configuracao.findFirst();
    if (config) return;
    await prisma.configuracao.create({
      data: { percentLucro: 0.4, percentComissao: 0.06, percentImposto: 0.08, custoEmbalagem: 10, pecasPorCaixa: 20, descontoMaximoLivre: 0.05, freteGratisAcimaCx: 5, tetoMEIAnual: 81000 },
    });
    await prisma.produto.createMany({
      data: [
        { nome: "Pingadeira 21 cm", larguraCm: 21, custoUnitario: 8.00 },
        { nome: "Pingadeira 19 cm", larguraCm: 19, custoUnitario: 7.24 },
      ],
    });
  } catch {
    // silencia falha de conexão durante build/prerender
  }
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await autoSeed();
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
