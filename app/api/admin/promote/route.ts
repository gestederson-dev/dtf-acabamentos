import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SECRET = "sCXEuUmv4L2AkKeBitlw7yqb";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const email = req.nextUrl.searchParams.get("email");

  if (token !== SECRET || !email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: "SOCIO" },
    select: { name: true, email: true, role: true },
  });

  return NextResponse.json({ ok: true, user });
}
