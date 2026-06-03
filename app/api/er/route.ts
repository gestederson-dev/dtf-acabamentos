import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// ROTA TEMPORÁRIA DE EMERGÊNCIA — DELETAR APÓS USO
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("k") !== "dtf-er-7x2m") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const hash = await bcrypt.hash("DTF@2025", 12);
  await prisma.user.update({
    where: { email: "gestederson@gmail.com" },
    data: { password: hash, ativo: true },
  });

  return NextResponse.json({ ok: true, msg: "Senha redefinida para DTF@2025" });
}
