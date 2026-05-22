import { describe, it, expect } from "vitest";
import {
  calcularPrecoPorPeca,
  calcularPrecoPorMetro,
  calcularAnatomiaVenda,
  arredondarMetragem,
  sugerirEmpacotamento,
  statusMargem,
} from "./pricing";

// Defaults DTF
const LUCRO = 0.40;
const COMISSAO = 0.06;
const IMPOSTO = 0.08;
const CUSTO_21 = 8.00;
const CUSTO_EMB_PECA = 0.50; // R$ 10 por caixa / 20 peças

describe("calcularPrecoPorPeca", () => {
  it("retorna R$ 18.48 para Pingadeira 21 cm com embalagem (defaults DTF)", () => {
    const pv = calcularPrecoPorPeca(CUSTO_21, CUSTO_EMB_PECA, LUCRO, COMISSAO, IMPOSTO);
    expect(pv).toBeCloseTo(18.478, 2); // ±0.01
  });

  it("lança erro quando percentuais somam >= 100%", () => {
    expect(() => calcularPrecoPorPeca(8, 0.5, 0.5, 0.3, 0.25)).toThrow("Percentuais somam >= 100%");
  });

  it("sem embalagem reduz o preço", () => {
    const comEmb = calcularPrecoPorPeca(CUSTO_21, CUSTO_EMB_PECA, LUCRO, COMISSAO, IMPOSTO);
    const semEmb = calcularPrecoPorPeca(CUSTO_21, 0, LUCRO, COMISSAO, IMPOSTO);
    expect(semEmb).toBeLessThan(comEmb);
  });
});

describe("calcularPrecoPorMetro", () => {
  it("multiplica por 4 (4 peças = 1 metro)", () => {
    expect(calcularPrecoPorMetro(18.478)).toBeCloseTo(73.913, 1);
  });
});

describe("calcularAnatomiaVenda", () => {
  const pvComEmb = calcularPrecoPorPeca(CUSTO_21, CUSTO_EMB_PECA, LUCRO, COMISSAO, IMPOSTO);
  const pvmComEmb = calcularPrecoPorMetro(pvComEmb);

  it("10m com embalagem: lucroLimpo ≈ 295.65 e margemReal ≈ 0.40", () => {
    const r = calcularAnatomiaVenda({
      metros: 10,
      precoPorMetro: pvmComEmb,
      descontoPercent: 0,
      custoUnitario: CUSTO_21,
      custoEmbalagemPeca: CUSTO_EMB_PECA,
      comEmbalagem: true,
      percentImposto: IMPOSTO,
      percentComissao: COMISSAO,
    });
    expect(r.lucroLimpo).toBeCloseTo(295.65, 0);
    expect(r.margemReal).toBeCloseTo(0.40, 2);
  });

  it("10m sem embalagem: lucroLimpo ≈ 278.26 e margem ainda ≈ 0.40", () => {
    const pvSemEmb = calcularPrecoPorPeca(CUSTO_21, 0, LUCRO, COMISSAO, IMPOSTO);
    const pvmSemEmb = calcularPrecoPorMetro(pvSemEmb);
    const r = calcularAnatomiaVenda({
      metros: 10,
      precoPorMetro: pvmSemEmb,
      descontoPercent: 0,
      custoUnitario: CUSTO_21,
      custoEmbalagemPeca: 0,
      comEmbalagem: false,
      percentImposto: IMPOSTO,
      percentComissao: COMISSAO,
    });
    expect(r.lucroLimpo).toBeCloseTo(278.26, 0);
    expect(r.margemReal).toBeCloseTo(0.40, 2);
  });

  it("10m com 10% desconto: margem cai pra ≈ 0.30", () => {
    const r = calcularAnatomiaVenda({
      metros: 10,
      precoPorMetro: pvmComEmb,
      descontoPercent: 0.10,
      custoUnitario: CUSTO_21,
      custoEmbalagemPeca: CUSTO_EMB_PECA,
      comEmbalagem: true,
      percentImposto: IMPOSTO,
      percentComissao: COMISSAO,
    });
    expect(r.margemReal).toBeCloseTo(0.30, 1);
  });

  it("desconto zero: faturamentoBruto === valorVenda", () => {
    const r = calcularAnatomiaVenda({
      metros: 5,
      precoPorMetro: pvmComEmb,
      descontoPercent: 0,
      custoUnitario: CUSTO_21,
      custoEmbalagemPeca: CUSTO_EMB_PECA,
      comEmbalagem: true,
      percentImposto: IMPOSTO,
      percentComissao: COMISSAO,
    });
    expect(r.faturamentoBruto).toBeCloseTo(r.valorVenda, 5);
  });
});

describe("arredondarMetragem", () => {
  it("7.3m → 7.5m", () => expect(arredondarMetragem(7.3)).toBe(7.5));
  it("7.0m → 7.0m (já múltiplo)", () => expect(arredondarMetragem(7.0)).toBe(7.0));
  it("0.1m → 0.25m", () => expect(arredondarMetragem(0.1)).toBe(0.25));
  it("7.25m → 7.25m", () => expect(arredondarMetragem(7.25)).toBe(7.25));
  it("7.26m → 7.5m", () => expect(arredondarMetragem(7.26)).toBe(7.5));
});

describe("sugerirEmpacotamento", () => {
  it("27 peças → 1 caixa + 7 avulsas", () => {
    expect(sugerirEmpacotamento(27)).toEqual({ caixas: 1, avulsas: 7 });
  });
  it("20 peças → 1 caixa + 0 avulsas", () => {
    expect(sugerirEmpacotamento(20)).toEqual({ caixas: 1, avulsas: 0 });
  });
  it("0 peças → 0 caixas + 0 avulsas", () => {
    expect(sugerirEmpacotamento(0)).toEqual({ caixas: 0, avulsas: 0 });
  });
  it("5 peças → 0 caixas + 5 avulsas", () => {
    expect(sugerirEmpacotamento(5)).toEqual({ caixas: 0, avulsas: 5 });
  });
});

describe("statusMargem", () => {
  it("≥35% → saudavel", () => expect(statusMargem(0.40).status).toBe("saudavel"));
  it("25-34% → apertada", () => expect(statusMargem(0.28).status).toBe("apertada"));
  it("0-24% → critica", () => expect(statusMargem(0.10).status).toBe("critica"));
  it("<0 → prejuizo", () => expect(statusMargem(-0.05).status).toBe("prejuizo"));
});
