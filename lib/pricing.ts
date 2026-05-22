// Módulo de precificação DTF Acabamentos
// LÓGICA SAGRADA — não alterar sem atualizar os testes

export type StatusMargem = "saudavel" | "apertada" | "critica" | "prejuizo";

export interface AnatomiaVenda {
  faturamentoBruto: number;
  desconto: number;
  valorVenda: number;
  custoProduto: number;
  custoEmbalagem: number;
  custoImposto: number;
  custoComissao: number;
  totalCustos: number;
  lucroLimpo: number;
  margemReal: number;
}

export interface StatusMargemResult {
  status: StatusMargem;
  cor: string;
  emoji: string;
  label: string;
}

export interface EmpacotamentoResult {
  caixas: number;
  avulsas: number;
}

/**
 * Calcula preço de venda por peça usando markup divisor.
 * PV = CustoDireto / (1 - %totalSobreVenda)
 *
 * Exemplo DTF: custo R$ 8,50 → lucro 40% + comissão 6% + imposto 8% = 54%
 * Divisor: 1 - 0.54 = 0.46 → PV = 8.50 / 0.46 = R$ 18.48
 */
export function calcularPrecoPorPeca(
  custoUnitario: number,
  custoEmbalagemPorPeca: number,
  percentLucro: number,
  percentComissao: number,
  percentImposto: number
): number {
  const custoDireto = custoUnitario + custoEmbalagemPorPeca;
  const divisor = 1 - (percentLucro + percentComissao + percentImposto);
  if (divisor <= 0) throw new Error("Percentuais somam >= 100%");
  return custoDireto / divisor;
}

/** 1 metro = 4 peças (pingadeira tem 25 cm de comprimento fixo) */
export function calcularPrecoPorMetro(precoPorPeca: number): number {
  return precoPorPeca * 4;
}

/** Anatomia financeira completa de uma venda */
export function calcularAnatomiaVenda(input: {
  metros: number;
  precoPorMetro: number;
  descontoPercent: number;
  custoUnitario: number;
  custoEmbalagemPeca: number;
  comEmbalagem: boolean;
  percentImposto: number;
  percentComissao: number;
}): AnatomiaVenda {
  const pecas = input.metros * 4;
  const faturamentoBruto = input.metros * input.precoPorMetro;
  const desconto = faturamentoBruto * input.descontoPercent;
  const valorVenda = faturamentoBruto - desconto;

  const custoProduto = pecas * input.custoUnitario;
  const custoEmbalagem = input.comEmbalagem ? pecas * input.custoEmbalagemPeca : 0;
  const custoImposto = valorVenda * input.percentImposto;
  const custoComissao = valorVenda * input.percentComissao;

  const totalCustos = custoProduto + custoEmbalagem + custoImposto + custoComissao;
  const lucroLimpo = valorVenda - totalCustos;
  const margemReal = valorVenda > 0 ? lucroLimpo / valorVenda : 0;

  return {
    faturamentoBruto,
    desconto,
    valorVenda,
    custoProduto,
    custoEmbalagem,
    custoImposto,
    custoComissao,
    totalCustos,
    lucroLimpo,
    margemReal,
  };
}

/** Semáforo de margem */
export function statusMargem(margem: number): StatusMargemResult {
  if (margem >= 0.35) return { status: "saudavel", cor: "#065F46", emoji: "✅", label: "Margem saudável" };
  if (margem >= 0.25) return { status: "apertada", cor: "#D97706", emoji: "⚠️", label: "Margem apertada" };
  if (margem >= 0)    return { status: "critica",  cor: "#DC2626", emoji: "🚨", label: "Margem crítica" };
  return { status: "prejuizo", cor: "#7F1D1D", emoji: "❌", label: "PREJUÍZO" };
}

/**
 * Arredonda metragem para múltiplo de 0,25m (1 peça = 25 cm).
 * Ex: 7,3m → 7,5m
 */
export function arredondarMetragem(metragemSolicitada: number): number {
  return Math.ceil(metragemSolicitada / 0.25) * 0.25;
}

/**
 * Sugere empacotamento: caixas completas + peças avulsas.
 * Ex: 27 peças → 1 caixa + 7 avulsas
 */
export function sugerirEmpacotamento(
  pecas: number,
  pecasPorCaixa: number = 20
): EmpacotamentoResult {
  const caixas = Math.floor(pecas / pecasPorCaixa);
  const avulsas = pecas % pecasPorCaixa;
  return { caixas, avulsas };
}

/** Formata valor em R$ brasileiro com separadores corretos */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

/** Formata percentual */
export function formatarPercent(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(valor);
}
