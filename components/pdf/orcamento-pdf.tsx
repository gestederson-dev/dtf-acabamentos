import {
  Document, Page, Text, View, StyleSheet, Image,
} from "@react-pdf/renderer";
import type { Venda, Cliente, Produto, User } from "@prisma/client";

type VendaCompleta = Venda & { cliente: Cliente | null; produto: Produto; vendedor: User };

const FORMA_LABEL: Record<string, string> = {
  PIX: "PIX", BOLETO: "Boleto", DINHEIRO: "Dinheiro",
  CARTAO_1X: "Cartão 1x", CARTAO_2X: "Cartão 2x", CARTAO_3X: "Cartão 3x",
};

function fmt(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

function fmtPct(valor: number) {
  return `${(valor * 100).toFixed(1)}%`;
}

const s = StyleSheet.create({
  page: { padding: 48, fontFamily: "Helvetica", fontSize: 10, color: "#18181B", backgroundColor: "#FFFFFF" },
  header: { marginBottom: 24 },
  empresa: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  subtitle: { fontSize: 10, color: "#71717A" },
  divider: { borderBottomWidth: 1, borderBottomColor: "#E4E4E7", marginVertical: 16 },
  secTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 8, color: "#18181B" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  label: { color: "#71717A", flex: 1 },
  value: { fontFamily: "Helvetica-Bold", textAlign: "right" },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, alignSelf: "flex-start" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, marginTop: 4 },
  totalLabel: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  totalValue: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  footer: { marginTop: 32, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#E4E4E7" },
  footerText: { fontSize: 8, color: "#A1A1AA", textAlign: "center" },
  validadeBox: { backgroundColor: "#DCFCE7", padding: 10, borderRadius: 6, marginTop: 16 },
  validadeText: { color: "#065F46", fontSize: 9, textAlign: "center" },
});

export function OrcamentoPDF({ venda, logoBase64 }: { venda: VendaCompleta; logoBase64?: string }) {
  const nomeCliente = venda.cliente?.nome ?? venda.clienteNomeAvulso ?? "—";
  const nomeProduto = `${venda.produto.nome} ${venda.comEmbalagem ? "c/ embalagem" : "s/ embalagem"}`;
  const dataValidade = new Date(venda.criadoEm);
  dataValidade.setDate(dataValidade.getDate() + 7);

  const STATUS_LABEL: Record<string, string> = {
    ORCAMENTO: "Orçamento", CONFIRMADO: "Confirmado", ENTREGUE: "Entregue",
    PAGO: "Pago", CANCELADO: "Cancelado",
  };

  return (
    <Document title={`Orçamento DTF #${venda.numero}`} author="DTF Acabamentos">
      <Page size="A4" style={s.page}>

        {/* Cabeçalho */}
        <View style={[s.header, { flexDirection: "row", alignItems: "center", gap: 12 }]}>
          {logoBase64 ? (
            <Image src={logoBase64} style={{ height: 40, maxWidth: 120, objectFit: "contain" }} />
          ) : (
            <Text style={s.empresa}>DTF Acabamentos</Text>
          )}
          <View>
            {logoBase64 && <Text style={s.empresa}>DTF Acabamentos</Text>}
            <Text style={s.subtitle}>Pingadeiras de qualidade para sua obra</Text>
          </View>
        </View>

        {/* Título + status */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold" }}>
            Orçamento #{String(venda.numero).padStart(3, "0")}
          </Text>
          <View style={[s.badge, { backgroundColor: "#F4F4F5" }]}>
            <Text style={{ fontSize: 9, color: "#52525B" }}>{STATUS_LABEL[venda.status] ?? venda.status}</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* Dados do cliente */}
        <Text style={s.secTitle}>Cliente</Text>
        <View style={s.row}>
          <Text style={s.label}>Nome</Text>
          <Text style={s.value}>{nomeCliente}</Text>
        </View>
        {venda.cliente?.empresa && (
          <View style={s.row}>
            <Text style={s.label}>Empresa</Text>
            <Text style={s.value}>{venda.cliente.empresa}</Text>
          </View>
        )}
        {venda.cliente?.telefone && (
          <View style={s.row}>
            <Text style={s.label}>Telefone</Text>
            <Text style={s.value}>{venda.cliente.telefone}</Text>
          </View>
        )}

        <View style={s.divider} />

        {/* Produto */}
        <Text style={s.secTitle}>Produto</Text>
        <View style={s.row}>
          <Text style={s.label}>Produto</Text>
          <Text style={s.value}>{nomeProduto}</Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>Metragem</Text>
          <Text style={s.value}>{venda.metros} m ({venda.pecas} peças)</Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>Preço por metro</Text>
          <Text style={s.value}>{fmt(venda.precoUnitario)}</Text>
        </View>
        {venda.descontoPercent > 0 && (
          <View style={s.row}>
            <Text style={s.label}>Desconto ({fmtPct(venda.descontoPercent)})</Text>
            <Text style={[s.value, { color: "#DC2626" }]}>-{fmt(venda.valorTotal * venda.descontoPercent / (1 - venda.descontoPercent))}</Text>
          </View>
        )}
        <View style={s.row}>
          <Text style={s.label}>Forma de pagamento</Text>
          <Text style={s.value}>{FORMA_LABEL[venda.formaPagamento] ?? venda.formaPagamento}</Text>
        </View>

        <View style={s.divider} />

        {/* Total */}
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>TOTAL</Text>
          <Text style={s.totalValue}>{fmt(venda.valorTotal)}</Text>
        </View>

        {/* Validade */}
        <View style={s.validadeBox}>
          <Text style={s.validadeText}>
            Orçamento válido até {dataValidade.toLocaleDateString("pt-BR")}
          </Text>
        </View>

        {/* Observação */}
        {venda.observacao && (
          <>
            <View style={s.divider} />
            <Text style={s.secTitle}>Observação</Text>
            <Text style={{ fontSize: 9, color: "#52525B", lineHeight: 1.5 }}>{venda.observacao}</Text>
          </>
        )}

        {/* Rodapé */}
        <View style={s.footer}>
          <Text style={s.footerText}>DTF Acabamentos · Gerado em {new Date().toLocaleDateString("pt-BR")}</Text>
          <Text style={[s.footerText, { marginTop: 2 }]}>Vendedor: {venda.vendedor.name}</Text>
        </View>

      </Page>
    </Document>
  );
}
