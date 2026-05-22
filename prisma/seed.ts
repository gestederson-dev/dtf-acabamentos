import { PrismaClient, Role, StatusVenda, FormaPagamento } from "@prisma/client";
import bcrypt from "bcryptjs";
import { calcularAnatomiaVenda, calcularPrecoPorMetro, calcularPrecoPorPeca } from "../lib/pricing";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Limpar banco
  await prisma.venda.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.produto.deleteMany();
  await prisma.configuracao.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Configuração inicial DTF
  const config = await prisma.configuracao.create({
    data: {
      percentLucro: 0.40,
      percentComissao: 0.06,
      percentImposto: 0.08,
      custoEmbalagem: 10.00,
      pecasPorCaixa: 20,
      descontoMaximoLivre: 0.05,
      freteGratisAcimaCx: 5,
      tetoMEIAnual: 81000.00,
    },
  });
  console.log("✅ Configuração criada");

  // Produtos
  const p21 = await prisma.produto.create({
    data: { nome: "Pingadeira 21 cm", larguraCm: 21, custoUnitario: 8.00 },
  });
  const p19 = await prisma.produto.create({
    data: { nome: "Pingadeira 19 cm", larguraCm: 19, custoUnitario: 7.24 },
  });
  console.log("✅ Produtos criados");

  // Usuários
  const senhaHash = await bcrypt.hash("dtf123", 10);

  const socio = await prisma.user.create({
    data: {
      email: "socio@dtf.com.br",
      name: "Sócio DTF",
      password: senhaHash,
      role: Role.SOCIO,
    },
  });
  const vendedor = await prisma.user.create({
    data: {
      email: "vendedor@dtf.com.br",
      name: "Vendedor DTF",
      password: senhaHash,
      role: Role.VENDEDOR,
    },
  });
  console.log("✅ Usuários criados");

  // Clientes
  const clientes = await Promise.all([
    prisma.cliente.create({ data: { nome: "Construtora Alfa", empresa: "Construtora Alfa Ltda", telefone: "(45) 99999-0001" } }),
    prisma.cliente.create({ data: { nome: "Material Construção Silva", empresa: "Silva Materiais Ltda", telefone: "(45) 99999-0002" } }),
    prisma.cliente.create({ data: { nome: "João Pedreiro", telefone: "(45) 99999-0003" } }),
    prisma.cliente.create({ data: { nome: "Construtora Beta", empresa: "Beta Engenharia SA", telefone: "(45) 99999-0004" } }),
    prisma.cliente.create({ data: { nome: "Loja do Mestre", empresa: "Loja do Mestre ME", telefone: "(45) 99999-0005" } }),
  ]);
  console.log("✅ Clientes criados");

  // Preços calculados
  const custoPorPeca21 = p21.custoUnitario;
  const custoPorPeca19 = p19.custoUnitario;
  const custoCxPorPeca = config.custoEmbalagem / config.pecasPorCaixa; // R$ 0,50/peça

  const pv21comEmb = calcularPrecoPorPeca(custoPorPeca21, custoCxPorPeca, config.percentLucro, config.percentComissao, config.percentImposto);
  const pv21semEmb = calcularPrecoPorPeca(custoPorPeca21, 0, config.percentLucro, config.percentComissao, config.percentImposto);
  const pv19comEmb = calcularPrecoPorPeca(custoPorPeca19, custoCxPorPeca, config.percentLucro, config.percentComissao, config.percentImposto);
  const pv19semEmb = calcularPrecoPorPeca(custoPorPeca19, 0, config.percentLucro, config.percentComissao, config.percentImposto);

  const pvm21com = calcularPrecoPorMetro(pv21comEmb);
  const pvm21sem = calcularPrecoPorMetro(pv21semEmb);
  const pvm19com = calcularPrecoPorMetro(pv19comEmb);
  const pvm19sem = calcularPrecoPorMetro(pv19semEmb);

  // Vendas de exemplo (últimos 3 meses)
  const hoje = new Date();
  const vendas = [
    { dias: 5, cliente: clientes[0], produto: p21, comEmb: true, metros: 50, desc: 0, pvm: pvm21com, vendedorId: socio.id },
    { dias: 8, cliente: clientes[1], produto: p21, comEmb: false, metros: 30, desc: 0.03, pvm: pvm21sem, vendedorId: vendedor.id },
    { dias: 12, cliente: clientes[2], produto: p19, comEmb: true, metros: 10, desc: 0, pvm: pvm19com, vendedorId: vendedor.id },
    { dias: 18, cliente: clientes[3], produto: p21, comEmb: true, metros: 75, desc: 0.05, pvm: pvm21com, vendedorId: socio.id },
    { dias: 25, cliente: clientes[4], produto: p19, comEmb: false, metros: 20, desc: 0, pvm: pvm19sem, vendedorId: vendedor.id },
    { dias: 35, cliente: clientes[0], produto: p21, comEmb: true, metros: 100, desc: 0.05, pvm: pvm21com, vendedorId: socio.id },
    { dias: 42, cliente: clientes[1], produto: p19, comEmb: true, metros: 25, desc: 0, pvm: pvm19com, vendedorId: vendedor.id },
    { dias: 50, cliente: clientes[2], produto: p21, comEmb: false, metros: 15, desc: 0, pvm: pvm21sem, vendedorId: vendedor.id },
    { dias: 55, cliente: clientes[3], produto: p19, comEmb: false, metros: 40, desc: 0.02, pvm: pvm19sem, vendedorId: socio.id },
    { dias: 62, cliente: clientes[4], produto: p21, comEmb: true, metros: 60, desc: 0, pvm: pvm21com, vendedorId: vendedor.id },
    { dias: 70, cliente: clientes[0], produto: p21, comEmb: true, metros: 80, desc: 0.04, pvm: pvm21com, vendedorId: socio.id },
    { dias: 75, cliente: clientes[1], produto: p19, comEmb: false, metros: 35, desc: 0, pvm: pvm19sem, vendedorId: vendedor.id },
    { dias: 80, cliente: clientes[2], produto: p21, comEmb: true, metros: 20, desc: 0, pvm: pvm21com, vendedorId: vendedor.id },
    { dias: 85, cliente: clientes[3], produto: p21, comEmb: false, metros: 45, desc: 0.03, pvm: pvm21sem, vendedorId: socio.id },
    { dias: 90, cliente: clientes[4], produto: p19, comEmb: true, metros: 55, desc: 0, pvm: pvm19com, vendedorId: vendedor.id },
  ];

  const statusOptions = [StatusVenda.PAGO, StatusVenda.PAGO, StatusVenda.ENTREGUE, StatusVenda.CONFIRMADO, StatusVenda.ORCAMENTO];

  for (let i = 0; i < vendas.length; i++) {
    const v = vendas[i];
    const data = new Date(hoje);
    data.setDate(data.getDate() - v.dias);

    const custoPeca = v.produto.custoUnitario;
    const custoEmbPeca = v.comEmb ? custoCxPorPeca : 0;

    const anatomia = calcularAnatomiaVenda({
      metros: v.metros,
      precoPorMetro: v.pvm,
      descontoPercent: v.desc,
      custoUnitario: custoPeca,
      custoEmbalagemPeca: custoEmbPeca,
      comEmbalagem: v.comEmb,
      percentImposto: config.percentImposto,
      percentComissao: config.percentComissao,
    });

    await prisma.venda.create({
      data: {
        numero: i + 1,
        data,
        vendedorId: v.vendedorId,
        clienteId: v.cliente.id,
        produtoId: v.produto.id,
        comEmbalagem: v.comEmb,
        metros: v.metros,
        pecas: v.metros * 4,
        precoUnitario: v.pvm,
        descontoPercent: v.desc,
        valorTotal: anatomia.valorVenda,
        custoProduto: anatomia.custoProduto,
        custoEmbalagem: anatomia.custoEmbalagem,
        custoImposto: anatomia.custoImposto,
        custoComissao: anatomia.custoComissao,
        lucroLimpo: anatomia.lucroLimpo,
        status: statusOptions[i % statusOptions.length],
        formaPagamento: i % 2 === 0 ? FormaPagamento.PIX : FormaPagamento.DINHEIRO,
        shareToken: `share_${Date.now()}_${i}`,
      },
    });
  }
  console.log("✅ 15 vendas de exemplo criadas");
  console.log("\n📊 Resumo:");
  console.log("   Login sócio:    socio@dtf.com.br    / dtf123");
  console.log("   Login vendedor: vendedor@dtf.com.br / dtf123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
