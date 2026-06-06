import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("k") !== "dtf-dbg-9k3x") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const [produtos, config] = await Promise.all([
    prisma.produto.findMany({ orderBy: { larguraCm: "asc" } }),
    prisma.configuracao.findFirst(),
  ]);

  const pL = config?.percentLucro ?? 0.4;
  const pC = config?.percentComissao ?? 0.06;
  const pI = config?.percentImposto ?? 0.08;
  const embCaixa = config?.custoEmbalagem ?? 10;
  const pecasCx  = config?.pecasPorCaixa ?? 20;
  const embPeca  = embCaixa / pecasCx;
  const divisor  = 1 - (pL + pC + pI);

  return NextResponse.json({
    config: { pL, pC, pI, embCaixa, pecasCx, embPeca, divisor },
    produtos: produtos.map((p) => {
      const pvComEmb = (p.custoUnitario + embPeca) / divisor;
      const pvSemEmb = p.custoUnitario / divisor;
      return {
        nome: p.nome,
        larguraCm: p.larguraCm,
        custoUnitario: p.custoUnitario,
        pvPecaComEmb: pvComEmb,
        pvPecaSemEmb: pvSemEmb,
        pvMetroComEmb: pvComEmb * 4,
        pvMetroSemEmb: pvSemEmb * 4,
      };
    }),
  });
}
