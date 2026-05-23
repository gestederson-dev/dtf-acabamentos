import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { OrcamentoPDF } from "@/components/pdf/orcamento-pdf";
import { createElement, type ReactElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Não autorizado", { status: 401 });

  const venda = await prisma.venda.findUnique({
    where: { id: params.id },
    include: { cliente: true, produto: true, vendedor: true },
  });

  if (!venda) return new NextResponse("Não encontrado", { status: 404 });

  if (session.user.role === "VENDEDOR" && venda.vendedorId !== session.user.id) {
    return new NextResponse("Sem permissão", { status: 403 });
  }

  const logoPath = join(process.cwd(), "public", "brand", "logo.png");
  const logoBase64 = existsSync(logoPath)
    ? `data:image/png;base64,${readFileSync(logoPath).toString("base64")}`
    : undefined;

  const element = createElement(OrcamentoPDF, { venda, logoBase64 }) as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(element);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="orcamento-dtf-${venda.numero}.pdf"`,
    },
  });
}
