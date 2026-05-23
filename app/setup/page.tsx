import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { SetupForm } from "./setup-form";

export default async function SetupPage() {
  const total = await prisma.user.count({ where: { role: Role.SOCIO } });
  if (total > 0) redirect("/login");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4 dark:bg-[#0A0A0B]">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold text-[#232021] dark:text-white">Configuração inicial</h1>
          <p className="mt-1 text-sm text-[#71717A]">Crie a conta do primeiro sócio para começar.</p>
        </div>
        <SetupForm />
      </div>
    </div>
  );
}
